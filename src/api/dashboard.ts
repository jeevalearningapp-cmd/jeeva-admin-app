import { supabase } from "@/lib/supabase";
import {
  DashboardData,
  DashboardMetrics,
  AnalyticsData,
} from "@/types/dashboard";

export const dashboardApi = {
  async getDashboardData(): Promise<DashboardData> {
    // Get metrics - use same RPC as mobile-app-users page for accurate count
    const [usersData, subscriptionsCount] = await Promise.all([
      supabase.rpc("get_student_details"),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true }),
    ]);

    const totalUsers = usersData.data?.length || 0;
    const totalSubscriptions = subscriptionsCount.count || 0;

    // Get active users from analytics_sessions using optimized RPC function
    const { data: activeUsersCount } = await supabase.rpc(
      "count_distinct_active_users",
      { days_ago: 30 },
    );

    // Get active subscriptions
    const { count: activeSubscriptionsCount } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    // Get total content (modules + lessons)
    const [modulesCount, lessonsCount] = await Promise.all([
      supabase.from("modules").select("id", { count: "exact", head: true }),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
    ]);

    const totalContent = (modulesCount.count || 0) + (lessonsCount.count || 0);

    // Get DAU (users with sessions today) using optimized RPC function
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const { data: dauCount } = await supabase.rpc(
      "count_distinct_users_by_day",
      { target_date: todayDate },
    );

    const metrics: DashboardMetrics = {
      totalUsers,
      activeUsers: activeUsersCount || 0,
      totalSubscriptions,
      activeSubscriptions: activeSubscriptionsCount || 0,
      totalContent,
      dailyActiveUsers: dauCount || 0,
    };

    // Get all student details once (used for total users count)
    const { data: allStudents } = await supabase.rpc("get_student_details");
    const allStudentsData = allStudents || [];

    // Get user growth data (last 90 days, aggregated by week for performance)
    const userGrowth = [];
    const now = new Date();

    // Calculate weekly user growth from student data
    for (let week = 12; week >= 0; week--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - week * 7);
      weekEnd.setHours(23, 59, 59, 999);

      // Count users created up to this week
      const usersUpToWeek = allStudentsData.filter((student: any) => {
        const createdAt = new Date(student.created_at);
        return createdAt <= weekEnd;
      }).length;

      // Get active users for this week
      const { data: weekActiveUsers } = await supabase.rpc(
        "count_distinct_active_users",
        { days_ago: week * 7 + 7 },
      );

      userGrowth.push({
        date: weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        users: usersUpToWeek,
        activeUsers: weekActiveUsers || 0,
      });
    }

    // Get subscription distribution from subscriptions table (same as Mobile App Users)
    const { data: subsData } = await supabase
      .from("subscriptions")
      .select("user_id, status, subscription_plans(name)")
      .eq("status", "active");

    // Count by subscription plan name (Starter, Growth, Ultimate)
    const planCounts: Record<string, number> = {};

    subsData?.forEach((sub: any) => {
      const planName = sub.subscription_plans?.name?.toLowerCase() || "";
      // Skip trial/free - only count paid plans
      if (
        planName.includes("trial") ||
        planName.includes("free") ||
        !planName
      ) {
        return;
      }
      if (planName.includes("starter")) {
        planCounts["Starter"] = (planCounts["Starter"] || 0) + 1;
      } else if (planName.includes("growth")) {
        planCounts["Growth"] = (planCounts["Growth"] || 0) + 1;
      } else if (planName.includes("ultimate")) {
        planCounts["Ultimate"] = (planCounts["Ultimate"] || 0) + 1;
      } else {
        // Include any other paid plan types
        const capitalizedPlan =
          planName.charAt(0).toUpperCase() + planName.slice(1);
        planCounts[capitalizedPlan] = (planCounts[capitalizedPlan] || 0) + 1;
      }
    });

    const total =
      Object.values(planCounts).reduce((sum, count) => sum + count, 0) || 1;
    const subscriptionDistribution = Object.entries(planCounts)
      .filter(([_, count]) => count > 0)
      .map(([planType, count]) => ({
        planType,
        count,
        percentage: Math.round((count / total) * 100),
      }));

    // Get real content engagement data using count queries (no large data fetches)
    const [
      totalLearningCount,
      completedLearningCount,
      totalPracticeCount,
      completedPracticeCount,
      totalMocksCount,
      completedMocksCount,
    ] = await Promise.all([
      supabase
        .from("learning_completions")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("learning_completions")
        .select("id", { count: "exact", head: true })
        .eq("is_completed", true),
      supabase
        .from("practice_sessions")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("practice_sessions")
        .select("id", { count: "exact", head: true })
        .not("completed_at", "is", null),
      supabase.from("mock_exams").select("id", { count: "exact", head: true }),
      supabase
        .from("mock_exams")
        .select("id", { count: "exact", head: true })
        .not("completed_at", "is", null),
    ]);

    const contentEngagement = [
      {
        contentType: "Lessons",
        views: totalLearningCount.count || 0,
        completions: completedLearningCount.count || 0,
      },
      {
        contentType: "Practice",
        views: totalPracticeCount.count || 0,
        completions: completedPracticeCount.count || 0,
      },
      {
        contentType: "Mock Exams",
        views: totalMocksCount.count || 0,
        completions: completedMocksCount.count || 0,
      },
    ];

    // Get recent activity
    const { data: recentUsers } = await supabase
      .from("users")
      .select("email, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const recentActivity =
      recentUsers?.map((user) => ({
        id: user.email,
        type: "user" as const,
        message: `New user registered: ${user.email}`,
        timestamp: user.created_at,
      })) || [];

    // Get Stripe payments this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    const { data: paymentsThisMonth } = await supabase
      .from("subscriptions")
      .select("created_at, amount_paid_usd")
      .gte("created_at", firstDayOfMonth.toISOString())
      .lte("created_at", lastDayOfMonth.toISOString())
      .eq("status", "active");

    // Group payments by day
    const paymentsByDay: Record<string, { amount: number; count: number }> = {};
    paymentsThisMonth?.forEach((payment) => {
      const date = new Date(payment.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!paymentsByDay[date]) {
        paymentsByDay[date] = { amount: 0, count: 0 };
      }
      paymentsByDay[date].amount += payment.amount_paid_usd || 0;
      paymentsByDay[date].count += 1;
    });

    const stripePaymentsThisMonth = Object.entries(paymentsByDay).map(
      ([date, data]) => ({
        date,
        amount: Math.round(data.amount),
        count: data.count,
      }),
    );

    // Get new users this month
    const { data: newUsersData } = await supabase
      .from("users")
      .select("created_at")
      .gte("created_at", firstDayOfMonth.toISOString())
      .lte("created_at", lastDayOfMonth.toISOString());

    // Group new users by day
    const usersByDay: Record<string, number> = {};
    newUsersData?.forEach((user) => {
      const date = new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      usersByDay[date] = (usersByDay[date] || 0) + 1;
    });

    const newUsersThisMonth = Object.entries(usersByDay).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return {
      metrics,
      userGrowth,
      subscriptionDistribution,
      contentEngagement,
      recentActivity,
      stripePaymentsThisMonth,
      newUsersThisMonth,
    };
  },

  async getAnalyticsData(): Promise<AnalyticsData> {
    // Get total signups
    const { count: totalSignups } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    // Calculate average engagement time using aggregation (no large data fetch)
    const { data: avgDurationData } = await supabase
      .from("analytics_sessions")
      .select("duration_seconds")
      .not("duration_seconds", "is", null)
      .limit(1000); // Limit to recent sessions for performance

    const avgEngagementTime =
      avgDurationData && avgDurationData.length > 0
        ? avgDurationData.reduce(
            (sum, s) => sum + (s.duration_seconds || 0),
            0,
          ) /
          avgDurationData.length /
          60 // Convert to minutes
        : 0;

    // Calculate retention rate using optimized RPC function (users active in last 7 days vs total users)
    const { data: activeUsersLast7Days } = await supabase.rpc(
      "count_distinct_active_users",
      { days_ago: 7 },
    );

    const retentionRate =
      totalSignups && totalSignups > 0
        ? ((activeUsersLast7Days || 0) / totalSignups) * 100
        : 0;

    // Calculate churn rate (subscriptions that expired or cancelled in last 30 days)
    const thirtyDaysAgoChurn = new Date();
    thirtyDaysAgoChurn.setDate(thirtyDaysAgoChurn.getDate() - 30);

    const { count: totalSubs } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true });

    const { count: churnedSubs } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["expired", "cancelled"])
      .gte("updated_at", thirtyDaysAgoChurn.toISOString());

    const safeTotalSubs = totalSubs && totalSubs > 0 ? totalSubs : 1;
    const churnRate = ((churnedSubs || 0) / safeTotalSubs) * 100;

    // Get real content performance using count queries
    const [modulesCount, lessonsCount, totalCompletionsCount, completedCount] =
      await Promise.all([
        supabase.from("modules").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase
          .from("learning_completions")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("learning_completions")
          .select("id", { count: "exact", head: true })
          .eq("is_completed", true),
      ]);

    const totalLessons = lessonsCount.count || 0;
    const totalCompletions = completedCount.count || 0;
    const totalAttempts = totalCompletionsCount.count || 0;
    const averageCompletion =
      totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0;

    // Get top performing lessons - limit to recent 500 completions for performance
    const { data: recentCompletions } = await supabase
      .from("learning_completions")
      .select("is_completed, lesson_id")
      .order("created_at", { ascending: false })
      .limit(500);

    const lessonCompletionMap: Record<
      string,
      { total: number; completed: number }
    > = {};
    recentCompletions?.forEach((c) => {
      if (!lessonCompletionMap[c.lesson_id]) {
        lessonCompletionMap[c.lesson_id] = { total: 0, completed: 0 };
      }
      lessonCompletionMap[c.lesson_id].total++;
      if (c.is_completed) lessonCompletionMap[c.lesson_id].completed++;
    });

    const topLessonIds = Object.entries(lessonCompletionMap)
      .filter(([_, stats]) => stats.total >= 3) // Only include lessons with at least 3 attempts
      .map(([id, stats]) => ({
        id,
        completionRate: (stats.completed / stats.total) * 100,
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    // Get lesson titles for top performers (only if we have lessons)
    let topPerformingContent: Array<{
      id: string;
      title: string;
      completionRate: number;
    }> = [];

    if (topLessonIds.length > 0) {
      const { data: topLessons } = await supabase
        .from("lessons")
        .select("id, title")
        .in(
          "id",
          topLessonIds.map((l) => l.id),
        );

      topPerformingContent = topLessonIds.map((lesson) => {
        const lessonData = topLessons?.find((l) => l.id === lesson.id);
        return {
          id: lesson.id,
          title: lessonData?.title || "Unknown Lesson",
          completionRate: Math.round(lesson.completionRate * 10) / 10, // Round to 1 decimal
        };
      });
    }

    // Get real revenue from active subscriptions with actual plan pricing
    const { data: activeSubscriptionsData } = await supabase
      .from("subscriptions")
      .select("plan_type, amount_paid_usd")
      .eq("status", "active");

    const totalRevenue =
      activeSubscriptionsData?.reduce(
        (sum, sub) => sum + (sub.amount_paid_usd || 0),
        0,
      ) || 0;
    const monthlyRecurringRevenue = totalRevenue; // For now, all active subs contribute to MRR

    const safeUserCountRevenue =
      totalSignups && totalSignups > 0 ? totalSignups : 1;
    const averageRevenuePerUser = totalRevenue / safeUserCountRevenue;

    // Revenue by plan type
    const planRevenue: Record<string, number> = {};
    activeSubscriptionsData?.forEach((sub) => {
      const planType = sub.plan_type || "Unknown";
      planRevenue[planType] =
        (planRevenue[planType] || 0) + (sub.amount_paid_usd || 0);
    });

    const revenueByPlan = Object.entries(planRevenue).map(
      ([plan, revenue]) => ({
        plan,
        revenue: Math.round(revenue),
      }),
    );

    return {
      userAnalytics: {
        totalSignups: totalSignups || 0,
        retentionRate: Math.round(retentionRate * 10) / 10,
        averageEngagementTime: Math.round(avgEngagementTime * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
      },
      contentPerformance: {
        totalModules: modulesCount.count || 0,
        totalLessons,
        averageCompletion: Math.round(averageCompletion * 10) / 10,
        topPerformingContent,
      },
      revenueMetrics: {
        totalRevenue: Math.round(totalRevenue),
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 10) / 10,
        revenueByPlan,
      },
    };
  },
};
