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
} from '@mui/material'
import { AddOutlined as AddIcon } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useSnackbar } from 'notistack'

interface Price {
  id: string
  stripe_product_id: string
  stripe_price_id: string
  currency: string
  amount: number
  country_code: string
  plan_name: string
  is_active: boolean
}

interface Country {
  country_code: string
  country_name: string
  currency: string
}

export const StripeProductsPage: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    stripe_product_id: '',
    country_code: '',
    amount: '',
    plan_name: '',
    plan_duration_days: '30',
  })
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchPrices()
    fetchCountries()
  }, [])

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .order('plan_name', { ascending: true })

      if (error) throw error
      setPrices(data || [])
    } catch (err: any) {
      enqueueSnackbar('Failed to load prices', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('country_currency_map')
        .select('country_code, country_name, currency')

      if (error) throw error
      setCountries(data || [])
    } catch (err: any) {
      console.error('Failed to load countries:', err)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.stripe_product_id || !formData.country_code || !formData.amount) {
        enqueueSnackbar('Please fill all required fields', { variant: 'warning' })
        return
      }

      const { data, error } = await supabase
        .from('prices')
        .insert({
          stripe_product_id: formData.stripe_product_id,
          country_code: formData.country_code,
          currency: countries.find(c => c.country_code === formData.country_code)?.currency || 'USD',
          amount: parseFloat(formData.amount),
          plan_name: formData.plan_name,
          plan_duration_days: parseInt(formData.plan_duration_days),
          is_active: true,
        })
        .select()

      if (error) throw error
      enqueueSnackbar('Price added successfully', { variant: 'success' })
      setPrices([...prices, data[0]])
      setDialogOpen(false)
      setFormData({
        stripe_product_id: '',
        country_code: '',
        amount: '',
        plan_name: '',
        plan_duration_days: '30',
      })
    } catch (err: any) {
      enqueueSnackbar('Failed to add price: ' + err.message, { variant: 'error' })
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Stripe Products & Prices</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Price
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Product ID</TableCell>
              <TableCell>Plan Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.map((price) => (
              <TableRow key={price.id}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {price.stripe_product_id.slice(0, 12)}...
                </TableCell>
                <TableCell>{price.plan_name}</TableCell>
                <TableCell>{price.country_code}</TableCell>
                <TableCell align="right">{price.amount}</TableCell>
                <TableCell>{price.currency}</TableCell>
                <TableCell>
                  <Chip
                    label={price.is_active ? 'Active' : 'Inactive'}
                    color={price.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Price</DialogTitle>
        <DialogContent sx={{ minWidth: '400px', pt: 2 }}>
          <TextField
            fullWidth
            label="Stripe Product ID"
            margin="normal"
            value={formData.stripe_product_id}
            onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
            placeholder="prod_xxx"
          />
          <TextField
            fullWidth
            label="Plan Name"
            margin="normal"
            value={formData.plan_name}
            onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Country</InputLabel>
            <Select
              value={formData.country_code}
              onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
            >
              {countries.map((c) => (
                <MenuItem key={c.country_code} value={c.country_code}>
                  {c.country_name} ({c.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Amount"
            margin="normal"
            type="number"
            inputProps={{ step: '0.01' }}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Duration</InputLabel>
            <Select
              value={formData.plan_duration_days}
              onChange={(e) => setFormData({ ...formData, plan_duration_days: e.target.value })}
            >
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="90">90 Days</MenuItem>
              <MenuItem value="365">365 Days</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Price
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
