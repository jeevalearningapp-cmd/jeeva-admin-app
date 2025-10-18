import React, { useState, useEffect } from 'react'
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material'
import {
  SearchOutlined as SearchIcon,
  VisibilityOutlined as VisibilityIcon,
  CloseOutlined as CloseIcon,
  DownloadOutlined as DownloadIcon,
  PersonOutlined as PersonIcon,
  SchoolOutlined as SchoolIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useSnackbar } from 'notistack'
import { PageLoader } from '@/components/common'
import { formatDistanceToNow } from 'date-fns'

interface StudentProfile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  current_country: string | null
  date_of_birth: string | null
  gender: string | null
  nmc_attempts: number | null
  uses_coaching: boolean | null
  profile_completed: boolean
  created_at: string
  oauth_provider: string | null
  subscription_status: string | null
  subscription_end_date: string | null
  days_remaining: number | null
}

export const StudentsPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc('get_student_details')

      if (rpcError) throw rpcError

      let enrichedStudents: StudentProfile[] = (data || []).map((student: any) => ({
        id: student.profile_id,
        user_id: student.user_id,
        full_name: student.full_name,
        email: student.email,
        phone_number: student.phone_number,
        current_country: student.current_country,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        nmc_attempts: student.nmc_attempts,
        uses_coaching: student.uses_coaching,
        profile_completed: student.profile_completed,
        created_at: student.created_at,
        oauth_provider: 'email',
        subscription_status: student.subscription_status,
        subscription_end_date: student.subscription_end_date,
        days_remaining: student.days_remaining
      }))

      if (search) {
        const searchLower = search.toLowerCase()
        enrichedStudents = enrichedStudents.filter(s =>
          s.full_name?.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower) ||
          s.phone_number?.includes(searchLower)
        )
      }

      if (filterProvider !== 'all') {
        enrichedStudents = enrichedStudents.filter(s => s.oauth_provider === filterProvider)
      }

      if (filterStatus !== 'all') {
        enrichedStudents = enrichedStudents.filter(s => s.subscription_status === filterStatus)
      }

      const from = page * rowsPerPage
      const to = from + rowsPerPage
      const paginatedStudents = enrichedStudents.slice(from, to)

      setStudents(paginatedStudents)
      setTotalCount(enrichedStudents.length)
    } catch (err: any) {
      setError(err.message)
      enqueueSnackbar('Failed to load students', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [page, rowsPerPage, search, filterProvider, filterStatus])

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

  const handleFilterProviderChange = (value: string) => {
    setFilterProvider(value)
    setPage(0)
  }

  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value)
    setPage(0)
  }

  const handleViewStudent = (student: StudentProfile) => {
    setSelectedStudent(student)
  }

  const handleCloseDrawer = () => {
    setSelectedStudent(null)
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Country', 'OAuth Provider', 'Profile Completed', 'Subscription Status', 'Days Remaining', 'Registered']
    const rows = students.map(s => [
      s.full_name || '-',
      s.email || '-',
      s.current_country || '-',
      s.oauth_provider || 'email',
      s.profile_completed ? 'Yes' : 'No',
      s.subscription_status || 'trial',
      s.days_remaining || '-',
      new Date(s.created_at).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    enqueueSnackbar('CSV exported successfully', { variant: 'success' })
  }

  const getSubscriptionStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'success'
      case 'trial': return 'info'
      case 'expired': return 'error'
      default: return 'default'
    }
  }

  if (loading && students.length === 0) {
    return <PageLoader />
  }

  if (error && students.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Student Users Management
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading students: {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Student Users</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage all registered students and their subscriptions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={students.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
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
            <InputLabel>OAuth Provider</InputLabel>
            <Select
              value={filterProvider}
              label="OAuth Provider"
              onChange={(e) => handleFilterProviderChange(e.target.value)}
            >
              <MenuItem value="all">All Providers</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="google">Google</MenuItem>
              <MenuItem value="apple">Apple</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Subscription</InputLabel>
            <Select
              value={filterStatus}
              label="Subscription"
              onChange={(e) => handleFilterStatusChange(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>OAuth Provider</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Subscription</TableCell>
              <TableCell>Days Left</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No students found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.full_name || '-'}</TableCell>
                  <TableCell>{student.email || '-'}</TableCell>
                  <TableCell>{student.current_country || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={student.oauth_provider || 'email'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.profile_completed ? 'Completed' : 'Incomplete'}
                      size="small"
                      color={student.profile_completed ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.subscription_status || 'trial'}
                      size="small"
                      color={getSubscriptionStatusColor(student.subscription_status)}
                    />
                  </TableCell>
                  <TableCell>
                    {student.days_remaining !== null ? (
                      <Typography 
                        variant="body2" 
                        color={student.days_remaining < 7 ? 'error' : 'text.primary'}
                      >
                        {student.days_remaining} days
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewStudent(student)}
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Drawer
        anchor="right"
        open={!!selectedStudent}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        {selectedStudent && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Student Details</Typography>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="overline" color="text.secondary">Personal Information</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1">{selectedStudent.full_name || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedStudent.email || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body1">{selectedStudent.phone_number || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body1">{selectedStudent.gender || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">
                      {selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current Country</Typography>
                    <Typography variant="body1">{selectedStudent.current_country || '-'}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">Nursing Information</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">NMC Attempts</Typography>
                    <Typography variant="body1">{selectedStudent.nmc_attempts || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Using Coaching</Typography>
                    <Typography variant="body1">{selectedStudent.uses_coaching ? 'Yes' : 'No'}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">Account Information</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">OAuth Provider</Typography>
                    <Chip 
                      label={selectedStudent.oauth_provider || 'email'} 
                      size="small" 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Profile Status</Typography>
                    <Chip
                      label={selectedStudent.profile_completed ? 'Completed' : 'Incomplete'}
                      size="small"
                      color={selectedStudent.profile_completed ? 'success' : 'warning'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Subscription Status</Typography>
                    <Chip
                      label={selectedStudent.subscription_status || 'trial'}
                      size="small"
                      color={getSubscriptionStatusColor(selectedStudent.subscription_status)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  {selectedStudent.subscription_end_date && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Subscription Ends</Typography>
                      <Typography variant="body1">
                        {new Date(selectedStudent.subscription_end_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({selectedStudent.days_remaining} days remaining)
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Registered</Typography>
                    <Typography variant="body1">
                      {formatDistanceToNow(new Date(selectedStudent.created_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}
