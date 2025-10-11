import React from 'react'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import { EmailOutlined } from '@mui/icons-material'

export const Footer: React.FC = () => {
  const handleEmailClick = () => {
    window.location.href = 'mailto:vollstek@gmail.com'
  }

  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        px: 3,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '11px',
          color: 'text.secondary',
        }}
      >
        Developed by vollstek Business solutions
      </Typography>

      <Tooltip title="Email Support">
        <IconButton
          size="small"
          onClick={handleEmailClick}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <EmailOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
