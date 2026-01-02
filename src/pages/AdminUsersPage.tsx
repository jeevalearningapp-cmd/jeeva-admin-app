import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Switch,
  FormControlLabel,
  Drawer,
} from '@mui/material'
import {
  SearchOutlined as SearchIcon,
  AddOutlined as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  CloseOutlined as CloseIcon,
} from '@mui/icons-material'
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser, useUpdateAdminUserStatus, useDeleteAdminUser } from '@/hooks'
import { AdminUser } from '@/types'
import { useSnackbar } from 'notistack'
import { PageLoader } from '@/components/common'

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    full_name: '',
    role: 'editor' as 'superadmin' | 'editor' | 'moderator',
  })
  const { enqueueSnackbar } = useSnackbar()

  const { data, isLoading, error } = useAdminUsers({
    search,
    role: roleFilter || undefined,
    page: page + 1,
    limit: rowsPerPage,
  })

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [isLoading, initialLoad])

  const createAdmin = useCreateAdminUser()
  const updateAdmin = useUpdateAdminUser()
  const updateStatus = useUpdateAdminUserStatus()
  const deleteAdmin = useDeleteAdminUser()

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value)
    setPage(0)
  }

  const handleCreateAdmin = async () => {
    try {
      await createAdmin.mutateAsync(newAdmin)
      setCreateDialogOpen(false)
      setNewAdmin({ email: '', full_name: '', role: 'editor' })
      enqueueSnackbar('Admin user created successfully', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to create admin user', { variant: 'error' })
    }
  }

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setEditDrawerOpen(true)
  }

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return

    try {
      await updateAdmin.mutateAsync({
        id: selectedAdmin.id,
        data: {
          full_name: selectedAdmin.full_name,
          role: selectedAdmin.role,
        },
      })
      setEditDrawerOpen(false)
      setSelectedAdmin(null)
      enqueueSnackbar('Admin user updated successfully', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to update admin user', { variant: 'error' })
    }
  }

  const handleStatusToggle = async (adminId: string, currentStatus: boolean) => {
    try {
      await updateStatus.mutateAsync({
        id: adminId,
        isActive: !currentStatus,
      })
      
      if (selectedAdmin && selectedAdmin.id === adminId) {
        setSelectedAdmin({
          ...selectedAdmin,
          is_active: !currentStatus,
        })
      }
      
      enqueueSnackbar(
        `Admin user ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      )
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to update status', { variant: 'error' })
    }
  }

  const handleDeleteClick = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return

    try {
      await deleteAdmin.mutateAsync(selectedAdmin.id)
      setDeleteDialogOpen(false)
      setSelectedAdmin(null)
      enqueueSnackbar('Admin user deleted successfully', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to delete admin user', { variant: 'error' })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'error'
      case 'editor':
        return 'primary'
      case 'moderator':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (isLoading && initialLoad) {
    return <PageLoader />
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Admin Users
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading admin users: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Users</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Admin User
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by email or name..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} onChange={handleRoleFilterChange} label="Role">
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="superadmin">Superadmin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data?.adminUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No admin users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.adminUsers.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.full_name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.role}
                      size="small"
                      color={getRoleColor(admin.role)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={admin.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditAdmin(admin)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(admin)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Admin User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              required
            />
            <TextField
              label="Full Name"
              fullWidth
              value={newAdmin.full_name}
              onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newAdmin.role}
                onChange={(e) =>
                  setNewAdmin({
                    ...newAdmin,
                    role: e.target.value as 'superadmin' | 'editor' | 'moderator',
                  })
                }
                label="Role"
              >
                <MenuItem value="superadmin">Superadmin</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAdmin}
            variant="contained"
            disabled={!newAdmin.email || createAdmin.isPending}
          >
            {createAdmin.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Admin Drawer */}
      <Drawer
        anchor="right"
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        {selectedAdmin && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Edit Admin User</Typography>
              <IconButton onClick={() => setEditDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedAdmin.email}</Typography>
              </Box>

              <TextField
                label="Full Name"
                fullWidth
                value={selectedAdmin.full_name || ''}
                onChange={(e) =>
                  setSelectedAdmin({ ...selectedAdmin, full_name: e.target.value })
                }
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedAdmin.role}
                  onChange={(e) =>
                    setSelectedAdmin({
                      ...selectedAdmin,
                      role: e.target.value as 'superadmin' | 'editor' | 'moderator',
                    })
                  }
                  label="Role"
                >
                  <MenuItem value="superadmin">Superadmin</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Status
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedAdmin.is_active}
                      onChange={() => handleStatusToggle(selectedAdmin.id, selectedAdmin.is_active)}
                      disabled={updateStatus.isPending}
                    />
                  }
                  label={selectedAdmin.is_active ? 'Active' : 'Inactive'}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Admin ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {selectedAdmin.id}
                </Typography>
              </Box>

              {selectedAdmin.created_at && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedAdmin.created_at).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" fullWidth onClick={() => setEditDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleUpdateAdmin}
                disabled={updateAdmin.isPending}
              >
                {updateAdmin.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete admin user{' '}
            <strong>{selectedAdmin?.email}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteAdmin.isPending}
          >
            {deleteAdmin.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminUsersPage
