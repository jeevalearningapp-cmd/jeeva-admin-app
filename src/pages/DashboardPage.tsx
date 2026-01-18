import React from "react";
import { Box, Typography, Paper, Card, CardContent, Grid } from "@mui/material";
import {
  PeopleOutlined,
  SubscriptionsOutlined,
  PersonAddOutlined,
  AddOutlined,
  TrendingUpOutlined,
  AttachMoneyOutlined,
} from "@mui/icons-material";
import { LineChart, PieChart } from "@mui/x-charts";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { useDashboardData } from "@/hooks/useDashboard";
import { PageLoader } from "@/components/common";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const COLORS = [
  "#007aff",
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#AF52DE",
  "#5AC8FA",
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = React.useState(true);
  const { data, isLoading, error } = useDashboardData();

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  if (isLoading && initialLoad) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Paper
          sx={{
            p: 3,
            mt: 2,
            bgcolor: "error.light",
            color: "error.contrastText",
          }}
        >
          <Typography>Error loading dashboard data</Typography>
        </Paper>
      </Box>
    );
  }

  const metrics = data?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalContent: 0,
    dailyActiveUsers: 0,
  };

  // Generate sparkline data (last 7 days trend)
  const generateSparklineData = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) =>
      Math.max(0, baseValue * (0.7 + Math.random() * 0.6)),
    );
  };

  // Calculate trial and paid users
  const trialUsers = metrics.totalUsers - metrics.activeSubscriptions;
  const paidUsers = metrics.activeSubscriptions;

  const metricCards = [
    {
      title: "Active Users",
      value: metrics.totalUsers,
      icon: <PeopleOutlined sx={{ fontSize: 40 }} />,
      color: "#007aff",
      subtitle: `${metrics.activeUsers} active this month`,
      sparklineData: generateSparklineData(metrics.totalUsers),
    },
    {
      title: "Trial Users",
      value: trialUsers,
      icon: <TrendingUpOutlined sx={{ fontSize: 40 }} />,
      color: "#FF9500",
      subtitle: "Free tier users",
      sparklineData: generateSparklineData(trialUsers),
    },
    {
      title: "Paid / Subscribed Users",
      value: paidUsers,
      icon: <SubscriptionsOutlined sx={{ fontSize: 40 }} />,
      color: "#34C759",
      subtitle: `${metrics.totalSubscriptions} total subs`,
      sparklineData: generateSparklineData(paidUsers),
    },
  ];

  // Prepare chart data
  const userGrowthData =
    data?.userGrowth?.map((item) => ({
      date: format(new Date(item.date), "MMM dd"),
      users: item.users,
      activeUsers: item.activeUsers,
    })) || [];

  // Map subscription distribution to show plan names (Starter, Growth, Ultimate)
  const subscriptionData =
    data?.subscriptionDistribution?.map((item) => ({
      label: item.planType.charAt(0).toUpperCase() + item.planType.slice(1), // Capitalize first letter
      value: item.count,
    })) || [];

  const contentEngagementData =
    data?.contentEngagement?.map((item) => ({
      type: item.contentType,
      views: item.views,
      completions: item.completions,
    })) || [];

  // Stripe payments data
  const stripePaymentsData = data?.stripePaymentsThisMonth || [];
  const totalStripeRevenue = stripePaymentsData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalStripeTransactions = stripePaymentsData.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  // New users data
  const newUsersData = data?.newUsersThisMonth || [];
  const totalNewUsers = newUsersData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {format(new Date(), "PPp")}
        </Typography>
      </Box>

      {/* 1. Metric Cards - TOP */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {metricCards.map((metric) => (
          <Card key={metric.title} sx={{ bgcolor: "background.paper" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: "0.875rem" }}
              >
                {metric.title}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, fontSize: "1.75rem" }}
                >
                  {metric.value.toLocaleString()}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <SparkLineChart
                    data={metric.sparklineData}
                    height={30}
                    width={80}
                    color={metric.color}
                    showTooltip
                    showHighlight
                  />
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {metric.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 2. User Growth & Subscription Distribution */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            User Growth
          </Typography>
          <LineChart
            height={300}
            series={[
              {
                data: userGrowthData.map((d) => d.users),
                label: "Total Users",
                area: true,
                color: "#3B82F6", // Blue like in reference
                showMark: false,
                curve: "linear",
              },
              {
                data: userGrowthData.map((d) => d.activeUsers),
                label: "Active Users",
                area: true,
                color: "#F59E0B", // Orange/amber like in reference
                showMark: false,
                curve: "linear",
              },
            ]}
            xAxis={[
              {
                scaleType: "point",
                data: userGrowthData.map((d) => d.date),
              },
            ]}
            slotProps={{
              legend: {
                direction: "horizontal",
                position: { vertical: "top", horizontal: "center" },
              },
            }}
            sx={{
              "& .MuiAreaElement-root": {
                fillOpacity: 0.5,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 2,
              },
            }}
          />
        </Paper>

        <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Subscription Distribution
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <PieChart
              series={[
                {
                  data: subscriptionData,
                  outerRadius: 120,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  highlightScope: { highlight: "item", fade: "global" },
                },
              ]}
              colors={["#3B82F6", "#F59E0B", "#EF4444"]}
              height={300}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "bottom", horizontal: "center" },
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* 3. Quick Navigation + Stripe Payments + New Users - SAME ROW */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions & Monthly Stats
        </Typography>
        <Grid container spacing={3} columns={24}>
          {/* Quick Actions - ~42% width (stacked vertically) */}
          <Grid size={{ xs: 24, lg: 10 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate("/admin-users")}
              >
                <CardContent
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#007aff15",
                      color: "#007aff",
                    }}
                  >
                    <PersonAddOutlined sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Add Admin User
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate("/content")}
              >
                <CardContent
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#34C75915",
                      color: "#34C759",
                    }}
                  >
                    <AddOutlined sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Create Content
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate("/subscription-plans")}
              >
                <CardContent
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#FF950015",
                      color: "#FF9500",
                    }}
                  >
                    <SubscriptionsOutlined sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Manage Subscriptions
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Stripe Payments - ~29% width */}
          <Grid size={{ xs: 24, lg: 7 }}>
            <Paper sx={{ p: 2.5, bgcolor: "background.paper", height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Stripe Payments
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#007aff15",
                    color: "#007aff",
                  }}
                >
                  <AttachMoneyOutlined sx={{ fontSize: 22 }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                ${totalStripeRevenue.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2, display: "block" }}
              >
                {totalStripeTransactions} transactions
              </Typography>
              {stripePaymentsData.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <LineChart
                    height={120}
                    series={[
                      {
                        data: stripePaymentsData.map((d) => d.amount),
                        area: true,
                        color: "#007aff",
                        showMark: false,
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: stripePaymentsData.map((d) => d.date),
                      },
                    ]}
                    sx={{
                      "& .MuiAreaElement-root": {
                        fillOpacity: 0.2,
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* New Users - ~29% width */}
          <Grid size={{ xs: 24, lg: 7 }}>
            <Paper sx={{ p: 2.5, bgcolor: "background.paper", height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    New Users
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#34C75915",
                    color: "#34C759",
                  }}
                >
                  <PeopleOutlined sx={{ fontSize: 22 }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totalNewUsers.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2, display: "block" }}
              >
                new registrations
              </Typography>
              {newUsersData.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <LineChart
                    height={120}
                    series={[
                      {
                        data: newUsersData.map((d) => d.count),
                        area: true,
                        color: "#34C759",
                        showMark: false,
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: newUsersData.map((d) => d.date),
                      },
                    ]}
                    sx={{
                      "& .MuiAreaElement-root": {
                        fillOpacity: 0.2,
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
