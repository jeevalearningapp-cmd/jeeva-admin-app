import React from 'react'
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Toolbar,
  Divider,
  Box
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Subscriptions as SubscriptionsIcon,
  LibraryBooks as ContentIcon,
  CheckCircle as ApprovalsIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Star as HeroIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'

const drawerWidth = 260

interface MenuItem {
  title: string
  path: string
  icon: React.ReactElement
  roles: Array<'superadmin' | 'editor' | 'moderator'>
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['superadmin', 'editor', 'moderator'] },
  { title: 'Users', path: '/users', icon: <PeopleIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Admin Users', path: '/admin-users', icon: <AdminIcon />, roles: ['superadmin'] },
  { title: 'Subscriptions', path: '/subscriptions', icon: <SubscriptionsIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Content', path: '/content', icon: <ContentIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Approvals', path: '/approvals', icon: <ApprovalsIcon />, roles: ['superadmin', 'moderator'] },
  { title: 'Analytics', path: '/analytics', icon: <AnalyticsIcon />, roles: ['superadmin'] },
  { title: 'Dashboard Hero', path: '/dashboard-hero', icon: <HeroIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Settings', path: '/settings', icon: <SettingsIcon />, roles: ['superadmin'] },
]

interface SidebarNavProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { adminUser } = useAuth()

  const handleNavigation = (path: string) => {
    navigate(path)
    onMobileClose()
  }

  const filteredMenuItems = menuItems.filter(item => 
    adminUser && item.roles.includes(adminUser.role)
  )

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  )
}
