import React from 'react'
import { Typography, Paper, Box } from '@mui/material'
import { useAuth } from '@/context'

export const ProfilePage: React.FC = () => {
  const { adminUser } = useAuth()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Email:</strong> {adminUser?.email}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Name:</strong> {adminUser?.full_name || 'Not set'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Role:</strong> {adminUser?.role}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> {adminUser?.is_active ? 'Active' : 'Inactive'}
        </Typography>
      </Paper>
    </Box>
  )
}
