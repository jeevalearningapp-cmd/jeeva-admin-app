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
  FormHelperText,
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
import { getApiUrl } from '@/config/api'

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

interface Price {
  id: string
  plan_name: string
  currency: string
  country_code: string
}

export const DiscountCouponsPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([])
  const [filteredCoupons, setFilteredCoupons] = useState<DiscountCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [prices, setPrices] = useState<Price[]>([])
  const [pricesLoading, setPricesLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()
  const apiUrl = getApiUrl()

  const fetchPrices = async () => {
    try {
      setPricesLoading(true)
      const response = await fetch(`${apiUrl}/stripe-admin/prices`)
      if (!response.ok) throw new Error('Failed to fetch prices')

      const priceData = await response.json()
      setPrices(priceData || [])
    } catch (err: any) {
      console.error('Failed to load prices:', err)
      enqueueSnackbar('Failed to load available plans', { variant: 'warning' })
    } finally {
      setPricesLoading(false)
    }
  }

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('discount_coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCoupons(data || [])
      filterCoupons(data || [], search)
    } catch (err: any) {
      setError(err.message)
      enqueueSnackbar(`Error loading coupons: ${err.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filterCoupons = (allCoupons: DiscountCoupon[], searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredCoupons(allCoupons)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = allCoupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(term) ||
        coupon.description?.toLowerCase().includes(term)
    )
    setFilteredCoupons(filtered)
  }

  useEffect(() => {
    fetchPrices()
    fetchCoupons()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    filterCoupons(coupons, newSearch)
    setPage(0)
  }

  const handleAddClick = () => {
    setEditingCoupon(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  const handleEditClick = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      applicable_plans: coupon.applicable_plans || [],
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active,
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCoupon(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.code.trim()) {
        enqueueSnackbar('Coupon code is required', { variant: 'warning' })
        return
      }

      if (!formData.discount_value) {
        enqueueSnackbar('Discount value is required', { variant: 'warning' })
        return
      }

      setSubmitting(true)

      const couponData = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        applicable_plans: formData.applicable_plans.length > 0 ? formData.applicable_plans : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
      }

      if (editingCoupon) {
        const { error: updateError } = await supabase
          .from('discount_coupons')
          .update(couponData)
          .eq('id', editingCoupon.id)

        if (updateError) throw updateError
        enqueueSnackbar('Coupon updated successfully', { variant: 'success' })
      } else {
        const { error: insertError } = await supabase
          .from('discount_coupons')
          .insert([couponData])

        if (insertError) throw insertError
        enqueueSnackbar('Coupon created successfully', { variant: 'success' })
      }

      handleCloseDialog()
      await fetchCoupons()
    } catch (err: any) {
      enqueueSnackbar(`Error saving coupon: ${err.message}`, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = async (coupon: DiscountCoupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return

    try {
      const { error: deleteError } = await supabase
        .from('discount_coupons')
        .delete()
        .eq('id', coupon.id)

      if (deleteError) throw deleteError
      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' })
      await fetchCoupons()
    } catch (err: any) {
      enqueueSnackbar(`Error deleting coupon: ${err.message}`, { variant: 'error' })
    }
  }

  if (loading) return <PageLoader />

  const displayCoupons = filteredCoupons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Discount Coupons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Create Coupon
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by code or description..."
          value={search}
          onChange={handleSearch}
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
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Code</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell align="center">Used / Limit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No coupons found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {coupon.code}
                      </Typography>
                      {coupon.description && (
                        <Typography variant="caption" color="textSecondary">
                          {coupon.description}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {coupon.valid_until ? (
                      <Typography variant="body2">
                        {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        No expiry
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {coupon.times_used}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.is_active ? 'Active' : 'Inactive'}
                      color={coupon.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(coupon)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(coupon)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCoupons.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Coupon Code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="SAVE20"
              disabled={!!editingCoupon}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Summer sale discount"
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value as 'percentage' | 'fixed_amount',
                  })
                }
                label="Discount Type"
              >
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="fixed_amount">Fixed Amount (₹)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Discount Value"
              type="number"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
            />

            <FormControl fullWidth>
              <InputLabel>Applicable to Plans</InputLabel>
              <Select
                multiple
                value={formData.applicable_plans}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicable_plans: typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : e.target.value,
                  })
                }
                label="Applicable to Plans"
              >
                {prices.map((price) => (
                  <MenuItem key={price.id} value={price.id}>
                    {price.plan_name} ({price.currency})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Leave empty to apply to all plans</FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              label="Usage Limit"
              type="number"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
              placeholder="Leave empty for unlimited"
              inputProps={{ min: '1' }}
            />

            <TextField
              fullWidth
              label="Valid From"
              type="date"
              value={formData.valid_from}
              onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Valid Until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty for no expiry"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : editingCoupon ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
