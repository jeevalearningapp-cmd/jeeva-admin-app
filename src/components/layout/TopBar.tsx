import React from 'react'
import { AppBar, Toolbar, IconButton, Box, Avatar, Menu, MenuItem } from '@mui/material'
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

  const sidebarWidth = sidebarCollapsed ? 72 : 260

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: { xs: '100%', sm: `calc(100% - ${sidebarWidth}px)` },
        ml: { xs: 0, sm: `${sidebarWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        borderBottom: (theme) => theme.palette.mode === 'light' 
          ? '1px solid rgba(193, 199, 208, 0.5)' 
          : '1px solid rgba(44, 49, 66, 0.5)',
        borderRadius: 0,
        transition: 'margin 0.3s, width 0.3s',
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
