import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const AdminUsersPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Users
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Admin user management features coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
