import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  InputAdornment,
  FormHelperText
} from '@mui/material'
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TrendingUpOutlined,
  PeopleOutlined,
  AttachMoneyOutlined,
  CancelOutlined
} from '@mui/icons-material'
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan
} from '@/hooks/useSubscriptionPlans'
import {
  useUserSubscriptions,
  useCreateUserSubscription,
  useUpdateUserSubscription,
  useDeleteUserSubscription,
  useSubscriptionAnalytics
} from '@/hooks/useUserSubscriptions'
import { PageLoader } from '@/components/common'
import { SubscriptionPlan, CreateSubscriptionPlanInput, UserSubscription, UpdateUserSubscriptionInput, CreateUserSubscriptionInput } from '@/types/subscription'
import { format } from 'date-fns'

export const SubscriptionsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<UserSubscription | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [planFormData, setPlanFormData] = useState<CreateSubscriptionPlanInput>({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    features: [],
    isActive: true,
    displayOrder: 0
  })

  const [subFormData, setSubFormData] = useState<CreateUserSubscriptionInput>({
    userId: '',
    planId: '',
    status: 'active',
    autoRenew: true,
    startDate: new Date().toISOString().split('T')[0]
  })
  
  const [featureInput, setFeatureInput] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)
  const [subFormTouched, setSubFormTouched] = useState(false)

  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const { data: subscriptions, isLoading: subsLoading } = useUserSubscriptions()
  const { data: analytics } = useSubscriptionAnalytics()
  const createPlanMutation = useCreateSubscriptionPlan()
  const updatePlanMutation = useUpdateSubscriptionPlan()
  const deletePlanMutation = useDeleteSubscriptionPlan()
  const createSubMutation = useCreateUserSubscription()
  const updateSubMutation = useUpdateUserSubscription()
  const deleteSubMutation = useDeleteUserSubscription()

  React.useEffect(() => {
    if (!plansLoading && !subsLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [plansLoading, subsLoading, initialLoad])

  if (plansLoading && subsLoading && initialLoad) {
    return <PageLoader />
  }

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = sub.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleOpenPlanDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan)
      setPlanFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features || [],
        maxUsers: plan.maxUsers,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder
      })
    } else {
      setEditingPlan(null)
      setPlanFormData({
        name: '',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        features: [],
        isActive: true,
        displayOrder: 0
      })
    }
    setPlanDialogOpen(true)
  }

  const handleClosePlanDialog = () => {
    setPlanDialogOpen(false)
    setEditingPlan(null)
    setFeatureInput('')
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setPlanFormData({
        ...planFormData,
        features: [...(planFormData.features || []), featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setPlanFormData({
      ...planFormData,
      features: planFormData.features?.filter((_, i) => i !== index) || []
    })
  }

  const handleSubmitPlan = async () => {
    if (editingPlan) {
      await updatePlanMutation.mutateAsync({
        id: editingPlan.id,
        input: planFormData
      })
    } else {
      await createPlanMutation.mutateAsync(planFormData)
    }
    handleClosePlanDialog()
  }

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      await deletePlanMutation.mutateAsync(id)
    }
  }

  const handleTogglePlanActive = async (plan: SubscriptionPlan) => {
    await updatePlanMutation.mutateAsync({
      id: plan.id,
      input: { isActive: !plan.isActive }
    })
  }

  const handleUpdateSubscriptionStatus = async (sub: UserSubscription, status: string) => {
    await updateSubMutation.mutateAsync({
      id: sub.id,
      input: { status: status as any }
    })
  }

  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubMutation.mutateAsync(id)
    }
  }

  const handleOpenSubDialog = (subscription?: UserSubscription) => {
    if (subscription) {
      setEditingSubscription(subscription)
      setSubFormData({
        userId: subscription.userId,
        planId: subscription.planId,
        status: subscription.status,
        autoRenew: subscription.autoRenew,
        startDate: subscription.startDate.split('T')[0],
        endDate: subscription.endDate?.split('T')[0],
        paymentMethod: subscription.paymentMethod
      })
    } else {
      setEditingSubscription(null)
      setSubFormData({
        userId: '',
        planId: '',
        status: 'active',
        autoRenew: true,
        startDate: new Date().toISOString().split('T')[0]
      })
    }
    setSubFormTouched(false)
    setSubDialogOpen(true)
  }

  const handleCloseSubDialog = () => {
    setSubDialogOpen(false)
    setEditingSubscription(null)
    setSubFormTouched(false)
  }

  const handleSubmitSubscription = async () => {
    // Validate required fields
    setSubFormTouched(true)
    if (!subFormData.userId || !subFormData.planId) {
      return
    }

    if (editingSubscription) {
      await updateSubMutation.mutateAsync({
        id: editingSubscription.id,
        input: {
          planId: subFormData.planId,
          status: subFormData.status,
          autoRenew: subFormData.autoRenew,
          startDate: subFormData.startDate,
          endDate: subFormData.endDate,
          paymentMethod: subFormData.paymentMethod
        }
      })
    } else {
      await createSubMutation.mutateAsync(subFormData)
    }
    handleCloseSubDialog()
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Subscriptions</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage subscription plans and user subscriptions
          </Typography>
        </Box>
        {tabValue === 0 ? (
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenPlanDialog()}
            sx={{ borderRadius: '12px' }}
          >
            Add Plan
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenSubDialog()}
            sx={{ borderRadius: '12px' }}
          >
            Add Subscription
          </Button>
        )}
      </Box>

      {/* Analytics Cards */}
      {analytics && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#007aff15',
                  color: '#007aff',
                  mb: 2
                }}
              >
                <PeopleOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Subscriptions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                {analytics.activeSubscriptions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {analytics.totalSubscriptions} total
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#34C75915',
                  color: '#34C759',
                  mb: 2
                }}
              >
                <AttachMoneyOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Monthly Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                ${(analytics?.monthlyRecurringRevenue || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MRR
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#FF950015',
                  color: '#FF9500',
                  mb: 2
                }}
              >
                <TrendingUpOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Avg Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                ${(analytics?.averageSubscriptionValue || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per subscription
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#FF3B3015',
                  color: '#FF3B30',
                  mb: 2
                }}
              >
                <CancelOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Churn Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                {(analytics?.churnRate || 0).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                cancellation rate
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Subscription Plans" />
          <Tab label="User Subscriptions" />
        </Tabs>
      </Paper>

      {/* Subscription Plans Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plan Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Billing Cycle</TableCell>
                <TableCell>Features</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans?.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plan.description}
                    </Typography>
                  </TableCell>
                  <TableCell>${(plan?.price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={plan.billingCycle} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {plan.features?.length || 0} features
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={plan.displayOrder} size="small" />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.isActive}
                      onChange={() => handleTogglePlanActive(plan)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenPlanDialog(plan)}
                      sx={{ mr: 1 }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePlan(plan.id)}
                      color="error"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!plans || plans.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No subscription plans yet. Click "Add Plan" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Subscriptions Tab */}
      {tabValue === 1 && (
        <>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search by user email or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Auto Renew</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {sub.user?.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sub.user?.firstName} {sub.user?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{sub.plan?.name}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={sub.status}
                          onChange={(e) => handleUpdateSubscriptionStatus(sub, e.target.value)}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="trial">Trial</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                          <MenuItem value="expired">Expired</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{format(new Date(sub.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {sub.endDate ? format(new Date(sub.endDate), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sub.autoRenew ? 'Yes' : 'No'} 
                        size="small"
                        color={sub.autoRenew ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenSubDialog(sub)}
                        sx={{ mr: 1 }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSubscription(sub.id)}
                        color="error"
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredSubscriptions || filteredSubscriptions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'No subscriptions found matching your filters.' 
                          : 'No user subscriptions yet.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Add/Edit Plan Dialog */}
      <Dialog open={planDialogOpen} onClose={handleClosePlanDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Plan Name"
              value={planFormData.name}
              onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={planFormData.description}
              onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Price"
              type="number"
              value={planFormData.price}
              onChange={(e) => setPlanFormData({ ...planFormData, price: parseFloat(e.target.value) || 0 })}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Billing Cycle</InputLabel>
              <Select
                value={planFormData.billingCycle}
                onChange={(e) => setPlanFormData({ ...planFormData, billingCycle: e.target.value as any })}
                label="Billing Cycle"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="lifetime">Lifetime</MenuItem>
              </Select>
            </FormControl>
            
            {/* Features */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Features
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add feature"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFeature()
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddFeature}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {planFormData.features?.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => handleRemoveFeature(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Max Users (optional)"
              type="number"
              value={planFormData.maxUsers || ''}
              onChange={(e) => setPlanFormData({ ...planFormData, maxUsers: parseInt(e.target.value) || undefined })}
              fullWidth
            />
            <TextField
              label="Display Order"
              type="number"
              value={planFormData.displayOrder}
              onChange={(e) => setPlanFormData({ ...planFormData, displayOrder: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={planFormData.isActive}
                  onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlanDialog} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button
            onClick={handleSubmitPlan}
            variant="contained"
            disabled={!planFormData.name || !planFormData.description || planFormData.price <= 0}
            sx={{ borderRadius: '12px' }}
          >
            {editingPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit User Subscription Dialog */}
      <Dialog open={subDialogOpen} onClose={handleCloseSubDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSubscription ? 'Edit User Subscription' : 'Add User Subscription'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="User ID"
              value={subFormData.userId}
              onChange={(e) => setSubFormData({ ...subFormData, userId: e.target.value })}
              fullWidth
              required
              disabled={!!editingSubscription}
              helperText={
                subFormTouched && !subFormData.userId 
                  ? 'User ID is required' 
                  : editingSubscription 
                    ? 'User cannot be changed' 
                    : 'Enter the user ID'
              }
              error={subFormTouched && !subFormData.userId}
            />
            <FormControl fullWidth required error={subFormTouched && !subFormData.planId}>
              <InputLabel>Subscription Plan</InputLabel>
              <Select
                value={subFormData.planId}
                onChange={(e) => setSubFormData({ ...subFormData, planId: e.target.value })}
                label="Subscription Plan"
              >
                {(!plans || plans.filter(p => p.isActive).length === 0) && (
                  <MenuItem disabled>No active plans available</MenuItem>
                )}
                {plans?.filter(p => p.isActive).map(plan => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price} / {plan.billingCycle}
                  </MenuItem>
                ))}
              </Select>
              {subFormTouched && !subFormData.planId && (
                <FormHelperText>Plan is required</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={subFormData.status}
                onChange={(e) => setSubFormData({ ...subFormData, status: e.target.value as any })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              value={subFormData.startDate}
              onChange={(e) => setSubFormData({ ...subFormData, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date (optional)"
              type="date"
              value={subFormData.endDate || ''}
              onChange={(e) => setSubFormData({ ...subFormData, endDate: e.target.value || undefined })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Payment Method (optional)"
              value={subFormData.paymentMethod || ''}
              onChange={(e) => setSubFormData({ ...subFormData, paymentMethod: e.target.value || undefined })}
              fullWidth
              placeholder="e.g., Credit Card, PayPal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={subFormData.autoRenew}
                  onChange={(e) => setSubFormData({ ...subFormData, autoRenew: e.target.checked })}
                />
              }
              label="Auto Renew"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubDialog} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button
            onClick={handleSubmitSubscription}
            variant="contained"
            disabled={!subFormData.userId || !subFormData.planId}
            sx={{ borderRadius: '12px' }}
          >
            {editingSubscription ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
