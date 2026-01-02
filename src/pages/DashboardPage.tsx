import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Stack,
} from '@mui/material'
import {
  PeopleOutlined,
  SubscriptionsOutlined,
  LibraryBooksOutlined,
  TrendingUpOutlined,
  PersonAddOutlined,
  AddOutlined,
} from '@mui/icons-material'
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboardData } from '@/hooks/useDashboard'
import { PageLoader } from '@/components/common'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

const COLORS = ['#007aff', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA']

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [initialLoad, setInitialLoad] = React.useState(true)
  const { data, isLoading, error } = useDashboardData()

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
          Dashboard
        </Typography>
        <Paper sx={{ p: 3, mt: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>Error loading dashboard data</Typography>
        </Paper>
      </Box>
    )
  }

  const metrics = data?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalContent: 0,
    dailyActiveUsers: 0,
  }

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      icon: <PeopleOutlined sx={{ fontSize: 40 }} />,
      color: '#007aff',
      subtitle: `${metrics.activeUsers} active`,
    },
    {
      title: 'Active Subscriptions',
      value: metrics.activeSubscriptions,
      icon: <SubscriptionsOutlined sx={{ fontSize: 40 }} />,
      color: '#34C759',
      subtitle: `of ${metrics.totalSubscriptions} total`,
    },
    {
      title: 'Content Items',
      value: metrics.totalContent,
      icon: <LibraryBooksOutlined sx={{ fontSize: 40 }} />,
      color: '#FF9500',
      subtitle: 'Modules & Lessons',
    },
    {
      title: 'Daily Active Users',
      value: metrics.dailyActiveUsers,
      icon: <TrendingUpOutlined sx={{ fontSize: 40 }} />,
      color: '#5AC8FA',
      subtitle: 'Today',
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {format(new Date(), 'PPp')}
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        {metricCards.map((metric) => (
          <Card key={metric.title} sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                mb: 2 
              }}>
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
                {metric.value.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {metric.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
        {/* User Growth Chart */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            User Growth (Last 7 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#007aff" name="Total Users" strokeWidth={2} />
              <Line type="monotone" dataKey="activeUsers" stroke="#34C759" name="Active Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Subscription Distribution */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Subscription Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.subscriptionDistribution as any || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.planType} (${entry.percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data?.subscriptionDistribution?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Content Engagement Chart */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Content Engagement
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.contentEngagement || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contentType" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#007aff" name="Views" />
              <Bar dataKey="completions" fill="#34C759" name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Quick Actions */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Stack spacing={2}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  borderColor: 'primary.main',
                }
              }}
              onClick={() => navigate('/admin-users')}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '10px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#007aff15',
                    color: 'primary.main'
                  }}
                >
                  <PersonAddOutlined sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Add Admin User
                </Typography>
              </CardContent>
            </Card>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  borderColor: 'primary.main',
                }
              }}
              onClick={() => navigate('/content')}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '10px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#34C75915',
                    color: '#34C759'
                  }}
                >
                  <AddOutlined sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Create Content
                </Typography>
              </CardContent>
            </Card>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  borderColor: 'primary.main',
                }
              }}
              onClick={() => navigate('/subscriptions')}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '10px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#FF950015',
                    color: '#FF9500'
                  }}
                >
                  <SubscriptionsOutlined sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Manage Subscriptions
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Recent Activity */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activity</Typography>
            <Chip label={data?.recentActivity?.length || 0} size="small" color="primary" />
          </Box>
          <List>
            {data?.recentActivity?.slice(0, 5).map((activity) => (
              <ListItem key={activity.id} divider>
                <ListItemText
                  primary={activity.message}
                  secondary={format(new Date(activity.timestamp), 'PPp')}
                />
              </ListItem>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <ListItem>
                <ListItemText
                  primary="No recent activity"
                  secondary="Activity will appear here as users interact with the platform"
                />
              </ListItem>
            )}
          </List>
        </Paper>

        {/* System Status */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            System Status
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Server Status
              </Typography>
              <Chip label="Online" color="success" size="small" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Database
              </Typography>
              <Chip label="Connected" color="success" size="small" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Backup
              </Typography>
              <Typography variant="body2">
                {format(new Date(), 'PPp')}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export default DashboardPage
