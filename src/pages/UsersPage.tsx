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
  Drawer,
  Button,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useUsers, useUpdateUserStatus } from '@/hooks'
import { UserWithProfile } from '@/types'
import { useSnackbar } from 'notistack'

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const { data, isLoading, error } = useUsers({
    search,
    page: page + 1,
    limit: rowsPerPage,
  })

  const updateStatus = useUpdateUserStatus()

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

  const handleViewUser = (user: UserWithProfile) => {
    setSelectedUser(user)
  }

  const handleCloseDrawer = () => {
    setSelectedUser(null)
  }

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatus.mutateAsync({
        id: userId,
        isActive: !currentStatus,
      })
      
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          is_active: !currentStatus,
        })
      }
      
      enqueueSnackbar(
        `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      )
    } catch (error) {
      enqueueSnackbar('Failed to update user status', { variant: 'error' })
    }
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Users Management
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading users: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Users Management</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by email..."
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
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.profile?.full_name || '-'}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewUser(user)}>
                      <VisibilityIcon />
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

      <Drawer
        anchor="right"
        open={!!selectedUser}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        {selectedUser && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">User Details</Typography>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">{selectedUser.profile?.full_name || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">{selectedUser.profile?.phone_number || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Chip label={selectedUser.role} size="small" color="primary" sx={{ mt: 0.5 }} />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Status
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedUser.is_active || false}
                      onChange={() => handleStatusToggle(selectedUser.id, selectedUser.is_active || false)}
                      disabled={updateStatus.isPending}
                    />
                  }
                  label={selectedUser.is_active ? 'Active' : 'Inactive'}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {selectedUser.id}
                </Typography>
              </Box>

              {selectedUser.created_at && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleCloseDrawer}
              sx={{ mt: 3 }}
            >
              Close
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}
