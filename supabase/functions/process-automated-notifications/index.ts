import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * This Edge Function handles automated notification triggers:
 * 1. Subscription expiring soon (7 days, 3 days, 1 day before)
 * 2. Welcome notifications for new users
 * 3. Content approved/rejected notifications
 * 4. Quiz milestone notifications
 *
 * Triggered by pg_cron daily or by database triggers
 */

serve(async (req) => {
  try {
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

    console.log("🤖 Processing automated notifications...");

    // Get automation settings from app_settings
    const { data: settings } = await supabaseClient
      .from("app_settings")
      .select("value")
      .eq("key", "notifications_automation")
      .single();

    const automationConfig = settings?.value || {
      subscription_expiring: { enabled: true, days_before: [7, 3, 1] },
      welcome_message: { enabled: true },
      content_approved: { enabled: true },
      content_rejected: { enabled: true },
    };

    let notificationsCreated = 0;

    // 1. Check for expiring subscriptions
    if (automationConfig.subscription_expiring?.enabled) {
      const daysToCheck = automationConfig.subscription_expiring
        .days_before || [7, 3, 1];

      for (const days of daysToCheck) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        const targetDateStr = targetDate.toISOString().split("T")[0];

        // Find subscriptions expiring on target date
        const { data: expiringSubscriptions } = await supabaseClient
          .from("subscriptions")
          .select("id, user_id, plan_name, end_date")
          .eq("status", "active")
          .gte("end_date", targetDateStr)
          .lt("end_date", `${targetDateStr}T23:59:59`);

        if (expiringSubscriptions && expiringSubscriptions.length > 0) {
          console.log(
            `📅 Found ${expiringSubscriptions.length} subscriptions expiring in ${days} days`,
          );

          for (const sub of expiringSubscriptions) {
            // Check if we already sent this notification
            const { data: existing } = await supabaseClient
              .from("notifications")
              .select("id")
              .eq("notification_type", "subscription_expiring")
              .eq(
                "audience_filter",
                JSON.stringify({
                  type: "specific_users",
                  userIds: [sub.user_id],
                }),
              )
              .gte(
                "created_at",
                new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              ); // Last 24 hours

            if (existing && existing.length > 0) {
              console.log(
                `⏭️ Skipping duplicate notification for user ${sub.user_id}`,
              );
              continue;
            }

            // Create notification
            const { data: notification, error: notificationError } =
              await supabaseClient
                .from("notifications")
                .insert({
                  title: `Your ${sub.plan_name} subscription expires in ${days} day${days > 1 ? "s" : ""}`,
                  body: `Don't lose access to your study materials! Renew your subscription to continue preparing for your NMC CBT exam.`,
                  notification_type: "subscription_expiring",
                  audience_filter: {
                    type: "specific_users",
                    userIds: [sub.user_id],
                  },
                  status: "scheduled",
                  data: {
                    action: "navigate",
                    screen: "Subscription",
                    subscriptionId: sub.id,
                  },
                })
                .select()
                .single();

            if (!notificationError && notification) {
              // Add to queue for immediate sending
              await supabaseClient.from("notification_queue").insert({
                notification_id: notification.id,
                run_at: new Date().toISOString(),
                status: "pending",
              });

              notificationsCreated++;
              console.log(
                `✅ Created subscription expiring notification for user ${sub.user_id}`,
              );
            }
          }
        }
      }
    }

    // 2. Welcome notifications for new users (signed up in last 24 hours, no notification sent yet)
    if (automationConfig.welcome_message?.enabled) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data: newUsers } = await supabaseClient
        .from("user_profiles")
        .select("id, email, created_at")
        .gte("created_at", oneDayAgo.toISOString());

      if (newUsers && newUsers.length > 0) {
        console.log(`👋 Found ${newUsers.length} new users to welcome`);

        for (const user of newUsers) {
          // Check if welcome notification already sent
          const { data: existing } = await supabaseClient
            .from("notifications")
            .select("id")
            .eq("notification_type", "welcome")
            .eq(
              "audience_filter",
              JSON.stringify({
                type: "specific_users",
                userIds: [user.id],
              }),
            );

          if (existing && existing.length > 0) {
            continue;
          }

          // Create welcome notification
          const { data: notification, error: notificationError } =
            await supabaseClient
              .from("notifications")
              .insert({
                title: "Welcome to Jeeva Learning! 🎓",
                body: "Start your journey to becoming an NMC certified nurse in the UK. Explore practice questions, lessons, and mock exams.",
                notification_type: "welcome",
                audience_filter: {
                  type: "specific_users",
                  userIds: [user.id],
                },
                status: "scheduled",
                data: {
                  action: "navigate",
                  screen: "Home",
                },
              })
              .select()
              .single();

          if (!notificationError && notification) {
            await supabaseClient.from("notification_queue").insert({
              notification_id: notification.id,
              run_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Send 5 minutes after signup
              status: "pending",
            });

            notificationsCreated++;
            console.log(`✅ Created welcome notification for user ${user.id}`);
          }
        }
      }
    }

    // 3. Milestone notifications (user completed 50, 100, 500 questions)
    const milestones = [50, 100, 250, 500, 1000];

    for (const milestone of milestones) {
      // Find users who just reached this milestone
      const { data: usersAtMilestone } = await supabaseClient
        .rpc("get_users_at_question_milestone", { milestone_count: milestone })
        .catch(() => ({ data: [] })); // Ignore if function doesn't exist yet

      if (usersAtMilestone && usersAtMilestone.length > 0) {
        console.log(
          `🎯 Found ${usersAtMilestone.length} users who reached ${milestone} questions`,
        );

        for (const user of usersAtMilestone) {
          // Check if milestone notification already sent
          const { data: existing } = await supabaseClient
            .from("notifications")
            .select("id")
            .eq("notification_type", "milestone")
            .eq(
              "audience_filter",
              JSON.stringify({
                type: "specific_users",
                userIds: [user.user_id],
              }),
            )
            .eq("data->>milestone", milestone.toString());

          if (existing && existing.length > 0) {
            continue;
          }

          const { data: notification, error: notificationError } =
            await supabaseClient
              .from("notifications")
              .insert({
                title: `🎉 Milestone Achieved: ${milestone} Questions Completed!`,
                body: `Amazing progress! You've answered ${milestone} questions. Keep up the great work!`,
                notification_type: "milestone",
                audience_filter: {
                  type: "specific_users",
                  userIds: [user.user_id],
                },
                status: "scheduled",
                data: {
                  action: "navigate",
                  screen: "Progress",
                  milestone: milestone,
                },
              })
              .select()
              .single();

          if (!notificationError && notification) {
            await supabaseClient.from("notification_queue").insert({
              notification_id: notification.id,
              run_at: new Date().toISOString(),
              status: "pending",
            });

            notificationsCreated++;
          }
        }
      }
    }

    console.log(
      `✅ Automated notifications complete: ${notificationsCreated} created`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        notificationsCreated,
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
