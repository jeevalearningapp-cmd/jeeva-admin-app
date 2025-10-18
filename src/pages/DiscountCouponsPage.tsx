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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material'
import {
  SearchOutlined as SearchIcon,
  AddOutlined as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  LocalOfferOutlined as CouponIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useSnackbar } from 'notistack'
import { PageLoader } from '@/components/common'
import { format } from 'date-fns'

interface DiscountCoupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  applicable_plans: string[] | null
  usage_limit: number | null
  times_used: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
}

interface CouponFormData {
  code: string
  description: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: string
  applicable_plans: string[]
  usage_limit: string
  valid_from: string
  valid_until: string
  is_active: boolean
}

const initialFormData: CouponFormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  applicable_plans: [],
  usage_limit: '',
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: '',
  is_active: true,
}

const SUBSCRIPTION_PLANS = [
  { id: 'plan_30_days', name: '30 Days - $49' },
  { id: 'plan_60_days', name: '60 Days - $89' },
  { id: 'plan_90_days', name: '90 Days - $119' },
  { id: 'plan_120_days', name: '120 Days - $149' },
]

export const DiscountCouponsPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('discount_coupons')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const from = page * rowsPerPage
      const to = from + rowsPerPage - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setCoupons(data || [])
      setTotalCount(count || 0)
    } catch (err: any) {
      setError(err.message)
      enqueueSnackbar('Failed to load coupons', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [page, rowsPerPage, search])

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

  const handleOpenDialog = (coupon?: DiscountCoupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        applicable_plans: coupon.applicable_plans || [],
        usage_limit: coupon.usage_limit?.toString() || '',
        valid_from: coupon.valid_from.split('T')[0],
        valid_until: coupon.valid_until?.split('T')[0] || '',
        is_active: coupon.is_active,
      })
    } else {
      setEditingCoupon(null)
      setFormData(initialFormData)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCoupon(null)
    setFormData(initialFormData)
  }

  const handleFormChange = (field: keyof CouponFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.code.trim()) {
      enqueueSnackbar('Coupon code is required', { variant: 'error' })
      return false
    }
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      enqueueSnackbar('Discount value must be greater than 0', { variant: 'error' })
      return false
    }
    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
      enqueueSnackbar('Percentage discount cannot exceed 100%', { variant: 'error' })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)

      const couponData = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description.trim() || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        applicable_plans: formData.applicable_plans.length > 0 ? formData.applicable_plans : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        is_active: formData.is_active,
      }

      if (editingCoupon) {
        const { error } = await supabase
          .from('discount_coupons')
          .update(couponData)
          .eq('id', editingCoupon.id)

        if (error) throw error
        enqueueSnackbar('Coupon updated successfully', { variant: 'success' })
      } else {
        const { error } = await supabase
          .from('discount_coupons')
          .insert([couponData])

        if (error) throw error
        enqueueSnackbar('Coupon created successfully', { variant: 'success' })
      }

      handleCloseDialog()
      fetchCoupons()
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to save coupon', { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return

    try {
      const { error } = await supabase
        .from('discount_coupons')
        .delete()
        .eq('id', id)

      if (error) throw error

      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' })
      fetchCoupons()
    } catch (err: any) {
      enqueueSnackbar('Failed to delete coupon', { variant: 'error' })
    }
  }

  const handleToggleActive = async (coupon: DiscountCoupon) => {
    try {
      const { error } = await supabase
        .from('discount_coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id)

      if (error) throw error

      enqueueSnackbar(
        `Coupon ${!coupon.is_active ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      )
      fetchCoupons()
    } catch (err: any) {
      enqueueSnackbar('Failed to update coupon status', { variant: 'error' })
    }
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  if (loading && coupons.length === 0) {
    return <PageLoader />
  }

  if (error && coupons.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Discount Coupons
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading coupons: {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Discount Coupons</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create and manage discount codes for subscription plans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Coupon
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by code or description..."
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
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No coupons found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {coupon.code}
                    </Typography>
                    {coupon.description && (
                      <Typography variant="caption" color="text.secondary">
                        {coupon.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {coupon.times_used}
                      {coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                    </Typography>
                    {coupon.usage_limit && coupon.times_used >= coupon.usage_limit && (
                      <Chip label="Limit Reached" size="small" color="warning" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.valid_until ? (
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                        </Typography>
                        {isExpired(coupon.valid_until) && (
                          <Chip label="Expired" size="small" color="error" sx={{ mt: 0.5 }} />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No expiry</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.is_active}
                      onChange={() => handleToggleActive(coupon)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(coupon)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(coupon.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Coupon Code"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                placeholder="FIRST20"
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discount_type}
                  label="Discount Type"
                  onChange={(e) => handleFormChange('discount_type', e.target.value)}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed_amount">Fixed Amount (USD)</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="First-time user discount"
              multiline
              rows={2}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Discount Value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => handleFormChange('discount_value', e.target.value)}
                placeholder={formData.discount_type === 'percentage' ? '20' : '10'}
                required
                InputProps={{
                  endAdornment: formData.discount_type === 'percentage' ? '%' : 'USD'
                }}
              />
              <TextField
                fullWidth
                label="Usage Limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => handleFormChange('usage_limit', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </Stack>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Applicable Plans</InputLabel>
                <Select
                  multiple
                  value={formData.applicable_plans}
                  label="Applicable Plans"
                  onChange={(e) => handleFormChange('applicable_plans', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const plan = SUBSCRIPTION_PLANS.find(p => p.id === value)
                        return <Chip key={value} label={plan?.name} size="small" />
                      })}
                    </Box>
                  )}
                >
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Leave empty to apply to all plans
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Valid From"
                type="date"
                value={formData.valid_from}
                onChange={(e) => handleFormChange('valid_from', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Valid Until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => handleFormChange('valid_until', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.valid_from }}
              />
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
