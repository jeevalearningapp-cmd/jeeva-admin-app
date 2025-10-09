import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const ContentPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Content Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Content management features coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
