import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Divider
} from '@mui/material'
import {
  DownloadOutlined,
  PeopleOutlined,
  TrendingUpOutlined,
  AttachMoneyOutlined,
  VisibilityOutlined,
  PercentOutlined,
  AutoGraphOutlined
} from '@mui/icons-material'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAnalyticsData, useExportAnalytics } from '@/hooks/useAnalytics'
import { PageLoader } from '@/components/common'
import { format, subDays } from 'date-fns'

export const AnalyticsPage: React.FC = () => {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [initialLoad, setInitialLoad] = useState(true)
  
  const { data, isLoading, error } = useAnalyticsData({ startDate, endDate })
  const { exportToCSV } = useExportAnalytics()

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [isLoading, initialLoad])

  if (isLoading && initialLoad) {
    return <PageLoader />
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <Paper sx={{ p: 3, mt: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>Error loading analytics data</Typography>
        </Paper>
      </Box>
    )
  }

  const handleExport = () => {
    if (data) {
      exportToCSV(data, `analytics-${startDate}-to-${endDate}.csv`)
    }
  }

  const userMetrics = data?.userAnalytics
  const revenueMetrics = data?.revenueMetrics
  const contentMetrics = data?.contentPerformance

  const metricCards = [
    {
      title: 'Total Users',
      value: userMetrics?.totalUsers || 0,
      icon: <PeopleOutlined />,
      color: '#007aff',
      subtitle: `${userMetrics?.activeUsers || 0} active`
    },
    {
      title: 'Retention Rate',
      value: `${(userMetrics?.retentionRate || 0).toFixed(1)}%`,
      icon: <PercentOutlined />,
      color: '#34C759',
      subtitle: 'User retention'
    },
    {
      title: 'Total Revenue',
      value: `$${(revenueMetrics?.totalRevenue || 0).toFixed(2)}`,
      icon: <AttachMoneyOutlined />,
      color: '#FF9500',
      subtitle: `MRR: $${(revenueMetrics?.monthlyRecurringRevenue || 0).toFixed(2)}`
    },
    {
      title: 'Content Views',
      value: contentMetrics?.totalViews || 0,
      icon: <VisibilityOutlined />,
      color: '#5AC8FA',
      subtitle: `${contentMetrics?.totalCompletions || 0} completions`
    },
    {
      title: 'Avg Completion',
      value: `${(contentMetrics?.averageCompletionRate || 0).toFixed(1)}%`,
      icon: <TrendingUpOutlined />,
      color: '#AF52DE',
      subtitle: 'Completion rate'
    },
    {
      title: 'ARPU',
      value: `$${(revenueMetrics?.averageRevenuePerUser || 0).toFixed(2)}`,
      icon: <AutoGraphOutlined />,
      color: '#FF3B30',
      subtitle: 'Avg revenue per user'
    }
  ]

  return (
    <Box>
      {/* Header with Date Filter and Export */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Analytics</Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed insights and performance metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            onClick={handleExport}
            sx={{ height: 40 }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        {metricCards.map((metric) => (
          <Card key={metric.title} sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: `${metric.color}15`,
                    color: metric.color
                  }}
                >
                  {React.cloneElement(metric.icon, { sx: { fontSize: 28 } })}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
                {metric.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.75rem' }}>
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {metric.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Engagement Trends */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            User Engagement Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.engagementTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#007aff" name="Active Users" strokeWidth={2} />
              <Line type="monotone" dataKey="sessions" stroke="#34C759" name="Sessions" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Conversion Metrics
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.conversionMetrics || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="signups" fill="#007aff" name="Signups" />
              <Bar dataKey="conversions" fill="#34C759" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Top Performing Content */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Top Performing Content
        </Typography>
        <Box sx={{ mt: 2 }}>
          {contentMetrics?.topModules && contentMetrics.topModules.length > 0 ? (
            <Stack spacing={2}>
              {contentMetrics.topModules.map((module: any) => (
                <Box key={module.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {module.name}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                      {module.completionRate.toFixed(1)}% completion
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {module.views} views
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.completions} completions
                    </Typography>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No content data available for the selected period
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default AnalyticsPage
