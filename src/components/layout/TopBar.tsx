import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Chip } from '@mui/material'
import { 
  MenuOutlined as MenuIcon, 
  AccountCircleOutlined as AccountCircle, 
  LogoutOutlined as Logout,
  WbSunnyOutlined as LightModeIcon,
  ContrastOutlined as DarkModeIcon,
  ChevronLeftOutlined as ChevronLeft,
  ChevronRightOutlined as ChevronRight,
} from '@mui/icons-material'
import { useAuth, useThemeMode } from '@/context'
import { useNavigate } from 'react-router-dom'
import logoHeader from '@/assets/logo-header.png'

interface TopBarProps {
  onMenuClick: () => void
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, onSidebarToggle, sidebarCollapsed }) => {
  const { adminUser, logout } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    navigate('/profile')
    handleMenuClose()
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
    handleMenuClose()
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <IconButton
          color="inherit"
          onClick={onSidebarToggle}
          sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 4 }}>
          <Box
            component="img"
            src={logoHeader}
            alt="Jeeva Logo"
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Jeeva Admin
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            sx={{ 
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              }
            }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Chip
            label={adminUser?.role || 'Admin'}
            size="small"
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              textTransform: 'capitalize',
              fontWeight: 600,
              bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
              color: mode === 'dark' ? 'primary.light' : 'primary.dark',
              borderRadius: '8px',
              px: 1,
            }}
          />
          
          <IconButton 
            onClick={handleMenuOpen} 
            sx={{ 
              p: 0.5,
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 36,
                height: 36,
              }}
            >
              <AccountCircle sx={{ fontSize: 24 }} />
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
