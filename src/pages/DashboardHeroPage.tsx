import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const DashboardHeroPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Hero
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Dashboard hero management coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
