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
  TextField,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  SaveOutlined as SaveIcon,
  EditOutlined as EditIcon,
  CancelOutlined as CancelIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useSnackbar } from 'notistack'
import { PageLoader } from '@/components/common'

interface SubscriptionPlan {
  id: string
  name: string
  duration_days: number
  price_inr: number
  price_usd: number
  config: {
    ai_messages_per_day?: number
    [key: string]: any
  } | null
  is_active: boolean
  created_at: string
}

export const SubscriptionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('duration_days', { ascending: true })

      if (fetchError) throw fetchError

      setPlans(data || [])
    } catch (err: any) {
      setError(err.message)
      enqueueSnackbar(`Error loading plans: ${err.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEditValue(plan.config?.ai_messages_per_day || 0)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue(0)
  }

  const handleSave = async (planId: string) => {
    try {
      setSaving(true)

      if (!Number.isFinite(editValue) || editValue < 1) {
        enqueueSnackbar('AI message limit must be a positive integer (minimum 1)', { variant: 'error' })
        return
      }

      const plan = plans.find(p => p.id === planId)
      if (!plan) return

      const updatedConfig = {
        ...(plan.config || {}),
        ai_messages_per_day: editValue,
      }

      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ config: updatedConfig })
        .eq('id', planId)

      if (updateError) throw updateError

      await fetchPlans()

      enqueueSnackbar('AI message limit updated successfully', { variant: 'success' })
      setEditingId(null)
      setEditValue(0)
    } catch (err: any) {
      enqueueSnackbar(`Error updating plan: ${err.message}`, { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Subscription Plans
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage AI message limits and subscription plan settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Plan Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price (INR)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price (USD)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>AI Messages/Day</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No subscription plans found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {plan.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {plan.duration_days} days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {plan.price_inr != null ? `₹${plan.price_inr.toFixed(2)}` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {plan.price_usd != null ? `$${plan.price_usd.toFixed(2)}` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {editingId === plan.id ? (
                        <TextField
                          type="number"
                          value={editValue}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10)
                            setEditValue(Number.isNaN(val) ? 0 : val)
                          }}
                          size="small"
                          disabled={saving}
                          sx={{ width: 100 }}
                          inputProps={{ min: 1 }}
                        />
                      ) : (
                        <Typography variant="body2">
                          {plan.config?.ai_messages_per_day || 0}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.is_active ? 'Active' : 'Inactive'}
                        color={plan.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {editingId === plan.id ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Save">
                            <IconButton
                              size="small"
                              onClick={() => handleSave(plan.id)}
                              disabled={saving}
                              color="primary"
                            >
                              {saving ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              onClick={handleCancel}
                              disabled={saving}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="Edit AI Limit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(plan)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
