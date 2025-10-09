import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const UsersPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          User management features coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
