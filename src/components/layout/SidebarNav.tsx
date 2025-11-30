import React from 'react'
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Box,
  Tooltip,
  Typography
} from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  CardMembershipOutlined as PlansIcon,
  LibraryBooksOutlined as ContentIcon,
  CheckCircleOutlined as ApprovalsIcon,
  SettingsOutlined as SettingsIcon,
  AnalyticsOutlined as AnalyticsIcon,
  StarOutlined as HeroIcon,
  SchoolOutlined as StudentsIcon,
  LocalOfferOutlined as CouponIcon,
  NotificationsOutlined as NotificationsIcon,
  CreditCardOutlined as PaymentsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'
import logoHeader from '@/assets/logo-header.png'

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
  { title: 'Mobile App Users', path: '/mobile-app-users', icon: <PeopleIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Admin Users', path: '/admin-users', icon: <AdminIcon />, roles: ['superadmin'] },
  { title: 'Subscription Plans', path: '/subscription-plans', icon: <PlansIcon />, roles: ['superadmin'] },
  { title: 'Discount Coupons', path: '/discount-coupons', icon: <CouponIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Payments', path: '/payments', icon: <PaymentsIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Content', path: '/content', icon: <ContentIcon />, roles: ['superadmin', 'editor'] },
  { title: 'Approvals', path: '/approvals', icon: <ApprovalsIcon />, roles: ['superadmin', 'moderator'] },
  { title: 'Analytics', path: '/analytics', icon: <AnalyticsIcon />, roles: ['superadmin'] },
  { title: 'Push Notifications', path: '/notifications', icon: <NotificationsIcon />, roles: ['superadmin', 'editor'] },
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
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ 
        p: collapsed ? 2 : 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 80,
        gap: 1.5
      }}>
        <Box
          component="img"
          src={logoHeader}
          alt="Jeeva Logo"
          sx={{ width: 40, height: 40, flexShrink: 0 }}
        />
        {!collapsed && (
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Jeeva Admin
          </Typography>
        )}
      </Box>
      
      <List sx={{ pt: 3, px: 1.5, flexGrow: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          
          const listItemButton = (
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
                py: collapsed ? 1.5 : 1,
                my: collapsed ? 1 : 0.5,
                mx: 0,
                borderRadius: 0,
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
              {!collapsed && (
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              )}
            </ListItemButton>
          )
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: collapsed ? 0 : 0 }}>
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
            borderRadius: 0,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  )
}
