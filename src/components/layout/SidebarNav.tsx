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
  Box,
  Tooltip
} from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  SubscriptionsOutlined as SubscriptionsIcon,
  LibraryBooksOutlined as ContentIcon,
  CheckCircleOutlined as ApprovalsIcon,
  SettingsOutlined as SettingsIcon,
  AnalyticsOutlined as AnalyticsIcon,
  StarOutlined as HeroIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'

const expandedWidth = 260
const collapsedWidth = 72

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
  collapsed?: boolean
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ mobileOpen, onMobileClose, collapsed = false }) => {
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
          
          const listItemButton = (
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
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
              <ListItemIcon sx={{ 
                color: isActive ? 'inherit' : 'text.secondary',
                minWidth: collapsed ? 'auto' : 56,
                justifyContent: 'center'
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.title} />}
            </ListItemButton>
          )
          
          return (
            <ListItem key={item.path} disablePadding>
              {collapsed ? (
                <Tooltip title={item.title} placement="right" arrow>
                  {listItemButton}
                </Tooltip>
              ) : (
                listItemButton
              )}
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  const drawerWidth = collapsed ? collapsedWidth : expandedWidth

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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: expandedWidth },
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
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  )
}
