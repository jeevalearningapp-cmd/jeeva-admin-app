import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Welcome to the Jeeva Admin Portal Dashboard
        </Typography>
      </Paper>
    </Box>
  )
}
