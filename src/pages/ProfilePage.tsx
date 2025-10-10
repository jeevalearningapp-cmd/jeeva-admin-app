import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  IconButton,
  Stack,
  CircularProgress
} from '@mui/material'
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PersonOutlined,
  EmailOutlined,
  BadgeOutlined,
  CheckCircleOutlined
} from '@mui/icons-material'
import { useAuth } from '@/context'
import { useMutation } from '@tanstack/react-query'
import { adminUsersApi } from '@/api/adminUsers'
import { useSnackbar } from 'notistack'

export const ProfilePage: React.FC = () => {
  const { adminUser, checkAdminRole } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: adminUser?.full_name || '',
    email: adminUser?.email || ''
  })

  const updateMutation = useMutation({
    mutationFn: (data: { full_name: string }) => 
      adminUsersApi.updateAdminUser(adminUser!.id, data),
    onSuccess: async () => {
      await checkAdminRole()
      setIsEditing(false)
      enqueueSnackbar('Profile updated successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update profile', { variant: 'error' })
    }
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      fullName: adminUser?.full_name || '',
      email: adminUser?.email || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      fullName: adminUser?.full_name || '',
      email: adminUser?.email || ''
    })
  }

  const handleSave = () => {
    if (!adminUser) return
    updateMutation.mutate({
      full_name: formData.fullName
    })
  }

  const getInitials = (name?: string) => {
    if (!name) return adminUser?.email?.charAt(0).toUpperCase() || 'A'
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'error'
      case 'editor': return 'primary'
      case 'moderator': return 'warning'
      default: return 'default'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin'
      case 'editor': return 'Editor'
      case 'moderator': return 'Moderator'
      default: return role
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditOutlined />}
            onClick={handleEdit}
            sx={{ borderRadius: 0 }}
          >
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<CloseOutlined />}
              onClick={handleCancel}
              sx={{ borderRadius: 0 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />}
              onClick={handleSave}
              disabled={updateMutation.isPending}
              sx={{ borderRadius: 0 }}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { md: '0 0 350px' } }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 0,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main',
                border: 4,
                borderColor: 'background.default'
              }}
            >
              {getInitials(adminUser?.full_name)}
            </Avatar>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {adminUser?.full_name || 'Admin User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {adminUser?.email}
              </Typography>
            </Box>

            <Chip
              label={getRoleLabel(adminUser?.role || '')}
              color={getRoleColor(adminUser?.role || '')}
              sx={{ borderRadius: 0, fontWeight: 600 }}
            />

            {adminUser?.is_active && (
              <Chip
                icon={<CheckCircleOutlined />}
                label="Active Account"
                color="success"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 0 }}
              />
            )}
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 4, borderRadius: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Account Information
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Full Name
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {adminUser?.full_name || 'Not set'}
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Email Address
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                    disabled
                    helperText="Email cannot be changed"
                  />
                ) : (
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {adminUser?.email}
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BadgeOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Role & Permissions
                  </Typography>
                </Box>
                <Box sx={{ pl: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={getRoleLabel(adminUser?.role || '')}
                    color={getRoleColor(adminUser?.role || '')}
                    size="small"
                    sx={{ borderRadius: 0 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {adminUser?.role === 'superadmin' && 'Full system access'}
                    {adminUser?.role === 'editor' && 'Can create and edit content'}
                    {adminUser?.role === 'moderator' && 'Can review and approve content'}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Account Status
                  </Typography>
                </Box>
                <Box sx={{ pl: 0 }}>
                  <Chip
                    label={adminUser?.is_active ? 'Active' : 'Inactive'}
                    color={adminUser?.is_active ? 'success' : 'default'}
                    size="small"
                    sx={{ borderRadius: 0 }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
