import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TrialAnalyticsDashboard() {
  // Mock data
  const analyticsData = {
    totalTrialUsers: 1250,
    practiceUsers: 980,
    learningUsers: 750,
    examUsers: 620,
    completionRate: 45.2,
    avgScore: 72.5,
    conversionRate: 8.5,
    trialToPaidUsers: 106,
  }

  const dailyTrends = [
    { date: 'Nov 25', starts: 120, completions: 45 },
    { date: 'Nov 26', starts: 135, completions: 52 },
    { date: 'Nov 27', starts: 180, completions: 78 },
    { date: 'Nov 28', starts: 220, completions: 95 },
    { date: 'Nov 29', starts: 240, completions: 108 },
    { date: 'Nov 30', starts: 250, completions: 120 },
  ]

  const sectionPerformance = [
    { section: 'Practice', users: 980, avgScore: 75, completionRate: 82 },
    { section: 'Learning', users: 750, avgScore: 71, completionRate: 65 },
    { section: 'Mock Exam', users: 620, avgScore: 68, completionRate: 45 },
  ]

  const conversionFunnel = [
    { stage: 'Trial Started', users: 1250, percentage: 100 },
    { stage: 'Completed All 3 Sections', users: 562, percentage: 45 },
    { stage: 'Converted to Paid', users: 106, percentage: 8.5 },
  ]

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Trial Users
              </Typography>
              <Typography variant="h5">{analyticsData.totalTrialUsers.toLocaleString()}</Typography>
              <Typography variant="caption" color="success.main">
                ↑ +12% this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h5">{analyticsData.completionRate}%</Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={analyticsData.completionRate} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Score
              </Typography>
              <Typography variant="h5">{analyticsData.avgScore}</Typography>
              <Typography variant="caption" color="text.secondary">
                Out of 100
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Trial to Paid
              </Typography>
              <Typography variant="h5">{analyticsData.conversionRate}%</Typography>
              <Typography variant="caption" color="success.main">
                {analyticsData.trialToPaidUsers} users converted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trial Starts & Completions (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="starts"
                  stroke="#2196f3"
                  name="Trial Starts"
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#4caf50"
                  name="Completions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Section Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis yAxisId="left" label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg Score', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="users" fill="#2196f3" name="Users" />
                <Bar yAxisId="right" dataKey="avgScore" fill="#ff9800" name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Section Breakdown Table */}
      <Paper sx={{ mb: 3, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
          Detailed Section Breakdown
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Section</TableCell>
                <TableCell align="right">Users</TableCell>
                <TableCell align="right">Avg Score</TableCell>
                <TableCell align="right">Completion %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sectionPerformance.map((row) => (
                <TableRow key={row.section}>
                  <TableCell>{row.section}</TableCell>
                  <TableCell align="right">{row.users.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.avgScore}/100</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgress variant="determinate" value={row.completionRate} />
                      </Box>
                      <Typography variant="caption">{row.completionRate}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Conversion Funnel */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Conversion Funnel
        </Typography>
        {conversionFunnel.map((stage, index) => (
          <Box key={stage.stage} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">{stage.stage}</Typography>
              <Typography variant="caption" color="text.secondary">
                {stage.users.toLocaleString()} users ({stage.percentage}%)
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={stage.percentage} />
          </Box>
        ))}
      </Paper>
    </Box>
  )
}
