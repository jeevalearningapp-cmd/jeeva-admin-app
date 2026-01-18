import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100; // Expo recommends batches of 100

interface PushMessage {
  to: string;
  sound: "default" | null;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
}

interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: any;
}

serve(async (req) => {
  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    console.log("🚀 Starting notification processing...");

    // Step 1: Fetch pending notifications from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from("notification_queue")
      .select(
        `
        id,
        notification_id,
        run_at,
        attempts,
        notifications (
          id,
          title,
          body,
          data,
          notification_type,
          image_url,
          audience_filter
        )
      `,
      )
      .eq("status", "pending")
      .lte("run_at", new Date().toISOString())
      .order("run_at", { ascending: true })
      .limit(10);

    if (queueError) {
      console.error("❌ Error fetching queue:", queueError);
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log("✅ No pending notifications to process");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending notifications",
          processed: 0,
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 },
      );
    }

    console.log(`📬 Processing ${queueItems.length} notifications...`);

    let totalSent = 0;
    let totalFailed = 0;

    // Step 2: Process each notification
    for (const queueItem of queueItems) {
      try {
        const notification = queueItem.notifications as any;

        if (!notification) {
          console.error(
            `❌ Notification not found for queue item ${queueItem.id}`,
          );
          continue;
        }

        console.log(`📤 Processing notification: ${notification.title}`);

        // Mark queue item as processing
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "processing",
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", queueItem.id);

        // Step 3: Get target users based on audience filter
        const userIds = await getTargetUserIds(
          supabaseClient,
          notification.audience_filter,
        );

        if (userIds.length === 0) {
          console.log(
            `⚠️ No target users found for notification ${notification.id}`,
          );

          // Mark as completed (no recipients)
          await supabaseClient
            .from("notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              total_recipients: 0,
              total_delivered: 0,
            })
            .eq("id", notification.id);

          await supabaseClient
            .from("notification_queue")
            .update({ status: "completed" })
            .eq("id", queueItem.id);

          continue;
        }

        console.log(`👥 Found ${userIds.length} target users`);

        // Step 4: Get active push tokens for target users
        const { data: pushTokens, error: tokensError } = await supabaseClient
          .from("push_tokens")
          .select("id, user_id, expo_push_token, platform")
          .in("user_id", userIds)
          .eq("is_active", true);

        if (tokensError) {
          console.error("❌ Error fetching push tokens:", tokensError);
          throw tokensError;
        }

        if (!pushTokens || pushTokens.length === 0) {
          console.log(
            `⚠️ No active push tokens found for notification ${notification.id}`,
          );

          // Mark as completed (no tokens)
          await supabaseClient
            .from("notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              total_recipients: userIds.length,
              total_delivered: 0,
            })
            .eq("id", notification.id);

          await supabaseClient
            .from("notification_queue")
            .update({ status: "completed" })
            .eq("id", queueItem.id);

          continue;
        }

        console.log(`📱 Found ${pushTokens.length} active push tokens`);

        // Step 5: Create notification targets for tracking
        const targetsToInsert = pushTokens.map((token) => ({
          notification_id: notification.id,
          user_id: token.user_id,
          push_token_id: token.id,
          delivery_status: "pending",
        }));

        await supabaseClient
          .from("notification_targets")
          .insert(targetsToInsert);

        // Step 6: Send to Expo in batches
        const { sent, failed } = await sendToExpoPush(
          supabaseClient,
          pushTokens,
          notification,
        );

        totalSent += sent;
        totalFailed += failed;

        // Step 7: Update notification status
        await supabaseClient
          .from("notifications")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            total_recipients: pushTokens.length,
            total_delivered: sent,
            total_failed: failed,
          })
          .eq("id", notification.id);

        // Step 8: Mark queue item as completed
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", queueItem.id);

        console.log(
          `✅ Notification ${notification.id} processed: ${sent} sent, ${failed} failed`,
        );
      } catch (error) {
        console.error(`❌ Error processing queue item ${queueItem.id}:`, error);

        // Increment attempts and set retry
        const nextAttempts = (queueItem.attempts || 0) + 1;
        const maxAttempts = 5;

        if (nextAttempts >= maxAttempts) {
          // Max retries reached
          await supabaseClient
            .from("notification_queue")
            .update({
              status: "failed",
              attempts: nextAttempts,
              last_attempt_at: new Date().toISOString(),
            })
            .eq("id", queueItem.id);
        } else {
          // Schedule retry (exponential backoff: 1min, 5min, 15min, 30min)
          const backoffMinutes = Math.pow(2, nextAttempts) * 1;
          const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);

          await supabaseClient
            .from("notification_queue")
            .update({
              status: "pending",
              attempts: nextAttempts,
              last_attempt_at: new Date().toISOString(),
              next_retry_at: nextRetry.toISOString(),
            })
            .eq("id", queueItem.id);
        }

        totalFailed++;
      }
    }

    console.log(
      `✅ Processing complete: ${totalSent} sent, ${totalFailed} failed`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: queueItems.length,
        sent: totalSent,
        failed: totalFailed,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

/**
 * Get target user IDs based on audience filter
 */
async function getTargetUserIds(
  supabase: any,
  audienceFilter: any,
): Promise<string[]> {
  if (!audienceFilter) {
    return [];
  }

  const filter =
    typeof audienceFilter === "string"
      ? JSON.parse(audienceFilter)
      : audienceFilter;

  // Specific user IDs
  if (filter.type === "specific_users" && filter.userIds) {
    return filter.userIds;
  }

  // All users
  if (filter.type === "all_users") {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return data?.map((u: any) => u.id) || [];
  }

  // By subscription tier
  if (filter.type === "subscription_tier" && filter.tier) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("plan_name", filter.tier)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching subscription users:", error);
      return [];
    }

    return data?.map((s: any) => s.user_id) || [];
  }

  // Active users (used app in last 30 days)
  if (filter.type === "active_users") {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("user_profiles")
      .select("id")
      .gte("last_login", thirtyDaysAgo.toISOString());

    if (error) {
      console.error("Error fetching active users:", error);
      return [];
    }

    return data?.map((u: any) => u.id) || [];
  }

  console.warn("Unknown audience filter type:", filter.type);
  return [];
}

/**
 * Send push notifications to Expo in batches
 */
async function sendToExpoPush(
  supabase: any,
  pushTokens: any[],
  notification: any,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Process in batches of 100 (Expo recommendation)
  for (let i = 0; i < pushTokens.length; i += BATCH_SIZE) {
    const batch = pushTokens.slice(i, i + BATCH_SIZE);

    // Build Expo messages
    const messages: PushMessage[] = batch.map((token) => ({
      to: token.expo_push_token,
      sound: "default",
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: 1,
      channelId: "default",
      priority: "high",
    }));

    try {
      // Call Expo Push API
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        console.error(
          `Expo API error: ${response.status} ${response.statusText}`,
        );
        const errorText = await response.text();
        console.error("Error details:", errorText);

        // Mark all in batch as failed
        for (const token of batch) {
          await supabase
            .from("notification_targets")
            .update({
              delivery_status: "failed",
              error_message: `Expo API error: ${response.statusText}`,
            })
            .eq("notification_id", notification.id)
            .eq("push_token_id", token.id);

          failed++;
        }
        continue;
      }

      const result = await response.json();
      const tickets: ExpoTicket[] = result.data || [];

      // Update delivery status for each ticket
      for (let j = 0; j < tickets.length; j++) {
        const ticket = tickets[j];
        const token = batch[j];

        if (ticket.status === "ok") {
          await supabase
            .from("notification_targets")
            .update({
              delivery_status: "sent",
              expo_ticket_id: ticket.id,
              delivered_at: new Date().toISOString(),
            })
            .eq("notification_id", notification.id)
            .eq("push_token_id", token.id);

          sent++;
        } else {
          await supabase
            .from("notification_targets")
            .update({
              delivery_status: "failed",
              error_message: ticket.message || "Unknown error",
            })
            .eq("notification_id", notification.id)
            .eq("push_token_id", token.id);

          // Mark token as inactive if it's a DeviceNotRegistered error
          if (ticket.message?.includes("DeviceNotRegistered")) {
            await supabase
              .from("push_tokens")
              .update({ is_active: false })
              .eq("id", token.id);
          }

          failed++;
        }
      }
    } catch (error) {
      console.error("Error sending to Expo:", error);

      // Mark all in batch as failed
      for (const token of batch) {
        await supabase
          .from("notification_targets")
          .update({
            delivery_status: "failed",
            error_message: error.message || "Network error",
          })
          .eq("notification_id", notification.id)
          .eq("push_token_id", token.id);

        failed++;
      }
    }
  }

  return { sent, failed };
}
