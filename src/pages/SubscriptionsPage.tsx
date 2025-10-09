import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const SubscriptionsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Subscriptions
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Subscription management features coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
