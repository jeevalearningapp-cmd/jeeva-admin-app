import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Platform settings coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
