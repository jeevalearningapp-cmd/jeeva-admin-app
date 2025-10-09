import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const AnalyticsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Analytics dashboard coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
