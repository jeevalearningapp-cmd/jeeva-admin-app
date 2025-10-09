import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

export const ApprovalsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Content Approvals
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Content approval features coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
