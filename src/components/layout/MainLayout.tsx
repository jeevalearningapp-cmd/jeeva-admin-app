import React, { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { TopBar } from './TopBar'
import { SidebarNav } from './SidebarNav'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar onMenuClick={handleDrawerToggle} />
      <SidebarNav mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', sm: `calc(100% - 260px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          mt: '64px',
          ml: { xs: 0, sm: '260px' },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
