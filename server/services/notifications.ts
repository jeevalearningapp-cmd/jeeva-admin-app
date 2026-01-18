import { createClient } from "@supabase/supabase-js";
import { ErrorHandler } from "../../src/utils/errorHandler";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100; // Expo accepts up to 100 notifications per request

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  sound?: string;
  badge?: number;
  priority?: "default" | "normal" | "high";
  data?: Record<string, any>;
  image?: string;
}

interface ExpoTicketResponse {
  id: string;
  status: "ok" | "error";
  message?: string;
}

export const notificationService = {
  /**
   * Process pending notifications from queue and send via Expo Push
   */
  async processNotificationQueue(): Promise<{ sent: number; failed: number }> {
    try {
      console.log("🔔 Starting notification queue processing...");

      // 1. Fetch pending notifications from queue
      const { data: queueItems, error: queueError } = await supabase
        .from("notification_queue")
        .select("*, notifications(*)")
        .eq("status", "pending")
        .lte("run_at", new Date().toISOString())
        .limit(10);

      if (queueError) throw queueError;
      if (!queueItems || queueItems.length === 0) {
        console.log("✅ No pending notifications in queue");
        return { sent: 0, failed: 0 };
      }

      let totalSent = 0;
      let totalFailed = 0;

      for (const queueItem of queueItems) {
        try {
          const { sent, failed } = await this.sendNotification(queueItem);
          totalSent += sent;
          totalFailed += failed;

          // Update queue item status to processed
          await supabase
            .from("notification_queue")
            .update({
              status: "processed",
              processed_at: new Date().toISOString(),
            })
            .eq("id", queueItem.id);
        } catch (error) {
          console.error(`Failed to process queue item ${queueItem.id}:`, error);
          totalFailed++;

          // Mark as failed
          await supabase
            .from("notification_queue")
            .update({
              status: "failed",
              error_message:
                error instanceof Error ? error.message : "Unknown error",
            })
            .eq("id", queueItem.id);
        }
      }

      console.log(
        `✅ Queue processing complete. Sent: ${totalSent}, Failed: ${totalFailed}`,
      );
      return { sent: totalSent, failed: totalFailed };
    } catch (error) {
      console.error("❌ Error processing notification queue:", error);
      throw error;
    }
  },

  /**
   * Send a single notification to target users
   */
  async sendNotification(
    queueItem: any,
  ): Promise<{ sent: number; failed: number }> {
    const notification = queueItem.notifications;
    console.log(`📤 Sending notification: "${notification.title}"`);

    try {
      // 2. Determine target users based on audience filter
      const userIds = await this.getTargetUsers(notification.audience_filter);
      console.log(`👥 Target users: ${userIds.length}`);

      if (userIds.length === 0) {
        console.log("⚠️  No target users found");
        return { sent: 0, failed: 0 };
      }

      // 3. Get active push tokens for target users
      const { data: pushTokens, error: tokensError } = await supabase
        .from("push_tokens")
        .select("*")
        .in("user_id", userIds)
        .eq("is_active", true);

      if (tokensError) throw tokensError;
      if (!pushTokens || pushTokens.length === 0) {
        console.log("⚠️  No active push tokens found for users");
        return { sent: 0, failed: 0 };
      }

      console.log(`📱 Found ${pushTokens.length} active push tokens`);

      // 4. Create notification targets in database
      const targets = pushTokens.map((token) => ({
        notification_id: notification.id,
        user_id: token.user_id,
        push_token_id: token.id,
        delivery_status: "pending" as const,
      }));

      const { error: targetsError } = await supabase
        .from("notification_targets")
        .insert(targets);

      if (targetsError) throw targetsError;

      // 5. Send to Expo in batches
      const messages = pushTokens.map((token) => ({
        to: token.expo_push_token,
        title: notification.title,
        body: notification.body,
        sound: "default",
        badge: 1,
        data: notification.data || {},
        image: notification.image_url,
      }));

      const { tickets, failed } = await this.sendToExpo(
        messages,
        notification.id,
        pushTokens,
      );

      console.log(
        `✅ Notification sent. Success: ${messages.length - failed}, Failed: ${failed}`,
      );
      return { sent: messages.length - failed, failed };
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      return { sent: 0, failed: 1 };
    }
  },

  /**
   * Determine target users based on audience filter
   * Simplified to query from auth.users since we don't have a subscriptions table
   */
  async getTargetUsers(audienceFilter: any): Promise<string[]> {
    try {
      // For now, just return all users regardless of filter
      // In the future, you can add subscription/activity filtering when those tables exist
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        console.error("Error fetching users from auth:", error);
        // Fallback: try to get from public.users if it exists
        const { data: publicUsers, error: publicError } = await supabase
          .from("users")
          .select("id");

        if (publicError) {
          console.error("Error fetching from public.users:", publicError);
          return [];
        }

        return publicUsers?.map((u) => u.id) || [];
      }

      return data.users?.map((u) => u.id) || [];
    } catch (error) {
      console.error("Error getting target users:", error);
      return [];
    }
  },

  /**
   * Send notifications to Expo Push API in batches
   */
  async sendToExpo(
    messages: ExpoMessage[],
    notificationId: string,
    pushTokens: any[],
  ): Promise<{ tickets: ExpoTicketResponse[]; failed: number }> {
    const expoAccessToken = process.env.EXPO_ACCESS_TOKEN;

    if (!expoAccessToken) {
      console.error("❌ EXPO_ACCESS_TOKEN not configured");
      return { tickets: [], failed: messages.length };
    }

    const allTickets: ExpoTicketResponse[] = [];
    let failedCount = 0;

    // Process in batches
    for (let i = 0; i < messages.length; i += EXPO_BATCH_SIZE) {
      const batch = messages.slice(i, i + EXPO_BATCH_SIZE);

      try {
        const response = await fetch(EXPO_PUSH_API, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
            Authorization: `Bearer ${expoAccessToken}`,
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          throw new Error(
            `Expo API error: ${response.status} ${response.statusText}`,
          );
        }

        const result: { data: ExpoTicketResponse[] } = await response.json();
        allTickets.push(...result.data);

        // Count failures
        result.data.forEach((ticket, idx) => {
          if (ticket.status === "error") {
            failedCount++;
            console.warn(
              `❌ Failed to send to token: ${batch[idx].to}`,
              ticket.message,
            );
          }
        });

        // Update notification targets with ticket IDs
        for (let j = 0; j < batch.length; j++) {
          const ticket = result.data[j];
          const token = pushTokens[i + j];

          await supabase
            .from("notification_targets")
            .update({
              ticket_id: ticket.id,
              delivery_status: ticket.status === "ok" ? "sent" : "failed",
            })
            .eq("push_token_id", token.id)
            .eq("notification_id", notificationId);
        }
      } catch (error) {
        console.error("Error sending batch to Expo:", error);
        failedCount += batch.length;
      }
    }

    // Update notification stats
    await supabase
      .from("notifications")
      .update({
        stats: {
          total_sent: messages.length,
          successful: messages.length - failedCount,
          failed: failedCount,
          delivery_rate: (
            ((messages.length - failedCount) / messages.length) *
            100
          ).toFixed(2),
        },
      })
      .eq("id", notificationId);

    return { tickets: allTickets, failed: failedCount };
  },

  /**
   * Check receipt status from Expo for sent notifications
   */
  async checkReceiptStatus(): Promise<void> {
    try {
      console.log("📋 Checking notification receipt status...");
      // Note: Receipt tracking requires ticket_id field to be added to notification_targets table
      // This feature is prepared but disabled until schema is updated
      return;
    } catch (error) {
      console.error("Error checking receipt status:", error);
    }
  },

  /**
   * Send push notification directly to devices without storing in database
   * Returns immediate results from Expo Push API
   */
  async sendDirectPush(input: {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, any>;
    audienceFilter: any;
  }): Promise<{
    totalTokens: number;
    sent: number;
    failed: number;
    errors: string[];
  }> {
    const { title, body, imageUrl, data, audienceFilter } = input;
    console.log(`📤 Sending direct push: "${title}"`);

    try {
      // 1. Determine target users based on audience filter
      const userIds = await this.getTargetUsers(audienceFilter);
      console.log(`👥 Target users: ${userIds.length}`);

      if (userIds.length === 0) {
        console.log("⚠️  No target users found");
        return {
          totalTokens: 0,
          sent: 0,
          failed: 0,
          errors: ["No target users found"],
        };
      }

      // 2. Get active push tokens for target users
      const { data: pushTokens, error: tokensError } = await supabase
        .from("push_tokens")
        .select("expo_push_token, user_id")
        .in("user_id", userIds)
        .eq("is_active", true);

      if (tokensError) throw tokensError;
      if (!pushTokens || pushTokens.length === 0) {
        console.log("⚠️  No active push tokens found for users");
        return {
          totalTokens: 0,
          sent: 0,
          failed: 0,
          errors: ["No active push tokens found"],
        };
      }

      console.log(`📱 Found ${pushTokens.length} active push tokens`);

      // 3. Build Expo push messages
      const isSilent = data?.silent === true;
      const messages: ExpoMessage[] = pushTokens.map((token) => ({
        to: token.expo_push_token,
        title,
        body,
        // Only add sound and badge for non-silent notifications
        ...(isSilent ? {} : { sound: "default", badge: 1 }),
        // Set priority to default for silent notifications
        priority: isSilent ? "default" : "high",
        data: {
          ...data,
          // Include notification metadata for local storage on device
          id: crypto.randomUUID(),
          type: data?.type || "manual",
          sentAt: new Date().toISOString(),
        },
        image: imageUrl,
      }));

      // 4. Send to Expo Push API
      const { sent, failed, errors } = await this.sendDirectToExpo(messages);

      console.log(`✅ Direct push sent. Success: ${sent}, Failed: ${failed}`);
      return { totalTokens: pushTokens.length, sent, failed, errors };
    } catch (error) {
      console.error("❌ Error sending direct push:", error);
      return {
        totalTokens: 0,
        sent: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  },

  /**
   * Send messages directly to Expo without any DB storage
   */
  async sendDirectToExpo(
    messages: ExpoMessage[],
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const expoAccessToken = process.env.EXPO_ACCESS_TOKEN;

    if (!expoAccessToken) {
      console.error("❌ EXPO_ACCESS_TOKEN not configured");
      return {
        sent: 0,
        failed: messages.length,
        errors: ["EXPO_ACCESS_TOKEN not configured"],
      };
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process in batches
    for (let i = 0; i < messages.length; i += EXPO_BATCH_SIZE) {
      const batch = messages.slice(i, i + EXPO_BATCH_SIZE);

      try {
        const response = await fetch(EXPO_PUSH_API, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
            Authorization: `Bearer ${expoAccessToken}`,
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          throw new Error(
            `Expo API error: ${response.status} ${response.statusText}`,
          );
        }

        const result: { data: ExpoTicketResponse[] } = await response.json();

        // Count successes and failures
        result.data.forEach((ticket, idx) => {
          if (ticket.status === "ok") {
            successCount++;
          } else {
            failedCount++;
            const errorMsg = `Token ${batch[idx].to.slice(-10)}: ${ticket.message || "Unknown error"}`;
            errors.push(errorMsg);
            console.warn(`❌ Failed to send:`, ticket.message);
          }
        });
      } catch (error) {
        console.error("Error sending batch to Expo:", error);
        failedCount += batch.length;
        errors.push(
          error instanceof Error ? error.message : "Batch send failed",
        );
      }
    }

    return { sent: successCount, failed: failedCount, errors };
  },
};
