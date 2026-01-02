import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material'
import { 
  AddOutlined as AddIcon, 
  DeleteOutlined as DeleteIcon,
  PreviewOutlined as PreviewIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { getApiUrl } from '@/config/api'

interface Price {
  id: string
  stripe_product_id: string
  stripe_price_id: string
  currency: string
  amount: number
  country_code: string
  plan_name: string
  plan_duration_days: number
  is_active: boolean
}

interface StripeProduct {
  id: string
  name: string
  description?: string
}

export const StripeProductsPage: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([])
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    stripe_product_id: '',
    amount: '',
    plan_name: '',
    plan_duration_days: '30',
  })
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
  })
  const { enqueueSnackbar } = useSnackbar()
  const apiUrl = getApiUrl()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchPrices(), fetchStripeProducts()])
    } finally {
      setLoading(false)
    }
  }

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${apiUrl}/stripe-admin/prices`)
      if (!response.ok) throw new Error('Failed to fetch prices')
      const data = await response.json()
      setPrices(data || [])
    } catch (err: any) {
      enqueueSnackbar('Failed to load prices', { variant: 'error' })
    }
  }

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/stripe-admin/products`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setStripeProducts(data || [])
    } catch (err: any) {
      console.error('Failed to load Stripe products:', err)
    }
  }

  const handleCreateProduct = async () => {
    try {
      if (!productFormData.name.trim()) {
        enqueueSnackbar('Product name is required', { variant: 'warning' })
        return
      }

      setSubmitting(true)
      const response = await fetch(`${apiUrl}/stripe-admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productFormData.name,
          description: productFormData.description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create product')
      }

      const result = await response.json()
      enqueueSnackbar('Product created successfully', { variant: 'success' })
      setProductFormData({ name: '', description: '' })
      setCreateProductDialogOpen(false)
      await fetchStripeProducts()
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (
        !formData.stripe_product_id ||
        !formData.amount ||
        !formData.plan_name
      ) {
        enqueueSnackbar('Please fill all required fields', { variant: 'warning' })
        return
      }

      setSubmitting(true)
      const response = await fetch(`${apiUrl}/stripe-admin/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripe_product_id: formData.stripe_product_id,
          currency: 'gbp', // GBP-only for Adaptive Pricing
          amount: parseFloat(formData.amount),
          plan_name: formData.plan_name,
          plan_duration_days: parseInt(formData.plan_duration_days),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add price')
      }

      const result = await response.json()
      enqueueSnackbar('Price added successfully to Stripe & database', { variant: 'success' })
      setDialogOpen(false)
      setFormData({
        stripe_product_id: '',
        amount: '',
        plan_name: '',
        plan_duration_days: '30',
      })
      await fetchPrices()
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePreviewAdaptivePricing = async () => {
    // Find the first active GBP price to use for preview
    const gbpPrice = prices.find(p => p.currency.toUpperCase() === 'GBP' && p.is_active)
    
    if (!gbpPrice) {
      enqueueSnackbar('No active GBP price found. Create a GBP price first to preview Adaptive Pricing.', { variant: 'warning' })
      return
    }

    try {
      setPreviewLoading(true)
      const response = await fetch(`${apiUrl}/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planPriceIdGbp: gbpPrice.stripe_price_id,
          userId: 'preview-test-user',
          customerEmail: 'test+adaptive_preview@jeeva-app.com',
          successUrl: `${window.location.origin}/stripe-products?preview=success`,
          cancelUrl: `${window.location.origin}/stripe-products?preview=cancelled`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create preview session')
      }

      const { sessionUrl } = await response.json()
      
      // Open checkout in new tab for preview
      window.open(sessionUrl, '_blank')
      enqueueSnackbar('Preview checkout opened in new tab. Stripe will show local currency based on your location.', { variant: 'info' })
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDeletePrice = async (priceId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this price?')) return

    try {
      const response = await fetch(`${apiUrl}/stripe-admin/prices/${priceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete price')

      enqueueSnackbar('Price deactivated successfully', { variant: 'success' })
      await fetchPrices()
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Stripe Products & Prices</Typography>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Preview how Adaptive Pricing displays to customers">
            <Button
              variant="outlined"
              color="info"
              startIcon={previewLoading ? <CircularProgress size={18} /> : <PreviewIcon />}
              onClick={handlePreviewAdaptivePricing}
              disabled={previewLoading}
            >
              Preview Adaptive Pricing
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateProductDialogOpen(true)}
          >
            Create Product
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add GBP Price
          </Button>
        </Stack>
      </Box>

      {/* Adaptive Pricing Warning Banner */}
      <Alert 
        severity="warning" 
        icon={<WarningIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Adaptive Pricing Enabled
        </Typography>
        <Typography variant="body2">
          Do not create INR/USD Prices manually. Stripe Adaptive Pricing automatically converts GBP prices to local currencies (INR, USD, etc.) at checkout based on customer location.
        </Typography>
      </Alert>

      {/* Prices Table */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configured Prices
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Product ID</TableCell>
              <TableCell>Plan Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No prices configured yet</Typography>
                </TableCell>
              </TableRow>
            ) : (
              prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {price.stripe_product_id.slice(0, 12)}...
                  </TableCell>
                  <TableCell>{price.plan_name}</TableCell>
                  <TableCell>{price.country_code}</TableCell>
                  <TableCell align="right">{price.amount.toFixed(2)}</TableCell>
                  <TableCell>{price.currency}</TableCell>
                  <TableCell>{price.plan_duration_days} days</TableCell>
                  <TableCell>
                    <Chip
                      label={price.is_active ? 'Active' : 'Inactive'}
                      color={price.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeletePrice(price.id)}
                    >
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Available Stripe Products */}
      {stripeProducts.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Available Stripe Products ({stripeProducts.length})
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 4 }}>
            {stripeProducts.map((product) => (
              <Card key={product.id}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'textSecondary' }}>
                    {product.id}
                  </Typography>
                  {product.description && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'textSecondary' }}>
                      {product.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Add Price Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New GBP Price</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Prices are created in GBP only. Stripe Adaptive Pricing will automatically convert to local currencies at checkout.
          </Alert>
          <FormControl fullWidth margin="normal">
            <InputLabel>Stripe Product</InputLabel>
            <Select
              value={formData.stripe_product_id}
              onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
              label="Stripe Product"
            >
              {stripeProducts.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Plan Name"
            margin="normal"
            value={formData.plan_name}
            onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
            placeholder="Premium Monthly"
          />
          <TextField
            fullWidth
            label="Currency"
            margin="normal"
            value="GBP"
            disabled
            helperText="Only GBP prices are supported. Adaptive Pricing handles currency conversion."
          />
          <TextField
            fullWidth
            label="Amount (GBP)"
            margin="normal"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="25.00"
            helperText="Enter amount in GBP (e.g., 25.00 for £25)"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Duration</InputLabel>
            <Select
              value={formData.plan_duration_days}
              onChange={(e) => setFormData({ ...formData, plan_duration_days: e.target.value })}
              label="Duration"
            >
              <MenuItem value="30">30 Days (1 Month)</MenuItem>
              <MenuItem value="90">90 Days (3 Months)</MenuItem>
              <MenuItem value="365">365 Days (1 Year)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting} sx={{ minWidth: '100px' }}>
            {submitting ? <CircularProgress size={24} /> : 'Add GBP Price'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog
        open={createProductDialogOpen}
        onClose={() => !submitting && setCreateProductDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Stripe Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            margin="normal"
            value={productFormData.name}
            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
            placeholder="Premium Plan"
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            margin="normal"
            multiline
            rows={3}
            value={productFormData.description}
            onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
            placeholder="Add product description..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProductDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProduct}
            variant="contained"
            disabled={submitting}
            sx={{ minWidth: '100px' }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
