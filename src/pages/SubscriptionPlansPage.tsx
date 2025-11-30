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
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import { InfoOutlined as InfoIcon } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useSnackbar } from 'notistack'
import { PageLoader } from '@/components/common'
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

interface PriceGroup {
  country: string
  countryCode: string
  currency: string
  prices: Price[]
}

export const SubscriptionPlansPage: React.FC = () => {
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([])
  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()
  const apiUrl = getApiUrl()

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const url = `${apiUrl}/api/stripe-admin/prices`
      console.log('📍 Fetching prices from:', url)
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch prices`)

      const prices = await response.json()

      // Group by country
      const grouped = prices.reduce(
        (acc: { [key: string]: Price[] }, price: Price) => {
          if (!acc[price.country_code]) {
            acc[price.country_code] = []
          }
          acc[price.country_code].push(price)
          return acc
        },
        {}
      )

      // Fetch country names
      const { data: countries } = await supabase
        .from('country_currency_map')
        .select('country_code, country_name, currency')

      const countryMap = new Map(
        countries?.map((c) => [
          c.country_code,
          { name: c.country_name, currency: c.currency },
        ]) || []
      )

      const groups: PriceGroup[] = Object.entries(grouped)
        .map(([countryCode, prices]) => ({
          country: countryMap.get(countryCode)?.name || countryCode,
          countryCode,
          currency: prices[0]?.currency || countryMap.get(countryCode)?.currency || 'USD',
          prices: prices.sort((a, b) => a.plan_duration_days - b.plan_duration_days),
        }))
        .sort((a, b) => {
          const order = { IN: 1, GB: 2, US: 3 }
          return (order[a.countryCode as keyof typeof order] || 999) -
            (order[b.countryCode as keyof typeof order] || 999)
        })

      setPriceGroups(groups)
    } catch (err: any) {
      console.error('❌ Failed to load prices:', err)
      enqueueSnackbar(err.message || 'Failed to load subscription prices', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  if (loading) return <PageLoader />

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Subscription Plans by Country
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Multi-currency pricing managed through Stripe. Tax rates auto-calculated per country.
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 4 }}>
        To add new plans or modify prices, visit{' '}
        <Typography component="span" sx={{ fontWeight: 600 }}>
          Payments → Stripe Products
        </Typography>
      </Alert>

      {priceGroups.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No pricing plans configured yet</Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {priceGroups.map((group) => (
            <Paper key={group.countryCode} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">
                    {group.country}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Currency: {group.currency}
                  </Typography>
                </Box>
                <Chip label={`${group.prices.length} plans`} color="primary" variant="outlined" />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Plan Name</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Stripe Price ID</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.prices.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {price.plan_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {group.currency} {(price.amount / 100).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {price.plan_duration_days} days
                            {price.plan_duration_days === 30 && ' (Monthly)'}
                            {price.plan_duration_days === 90 && ' (Quarterly)'}
                            {price.plan_duration_days === 365 && ' (Annual)'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              color: 'textSecondary',
                              display: 'block',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={price.stripe_price_id}
                          >
                            {price.stripe_price_id.slice(0, 20)}...
                          </Typography>
                        </TableCell>
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
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  )
}
