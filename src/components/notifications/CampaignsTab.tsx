import React, { useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  Stack,
  LinearProgress,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  MoreVertOutlined,
  RefreshOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  CancelOutlined,
  SendOutlined,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useNotifications, useRetryNotification, useCancelNotification } from '@/hooks/useNotifications'
import type { Notification, NotificationStatus, NotificationType } from '@/types/notifications'

const STATUS_CONFIG = {
  draft: { color: 'default' as const, icon: <ScheduleOutlined fontSize="small" /> },
  scheduled: { color: 'info' as const, icon: <ScheduleOutlined fontSize="small" /> },
  sending: { color: 'warning' as const, icon: <SendOutlined fontSize="small" /> },
  sent: { color: 'success' as const, icon: <CheckCircleOutlined fontSize="small" /> },
  failed: { color: 'error' as const, icon: <ErrorOutlined fontSize="small" /> },
  cancelled: { color: 'default' as const, icon: <CancelOutlined fontSize="small" /> },
}

export const CampaignsTab: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const { data: notifications, isLoading, refetch } = useNotifications(
    statusFilter !== 'all' ? { status: [statusFilter], searchQuery } : { searchQuery }
  )
  
  const retryMutation = useRetryNotification()
  const cancelMutation = useCancelNotification()

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    setAnchorEl(event.currentTarget)
    setSelectedNotification(notification)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedNotification(null)
  }

  const handleRetry = () => {
    if (selectedNotification) {
      retryMutation.mutate(selectedNotification.id, {
        onSuccess: () => refetch(),
      })
    }
    handleMenuClose()
  }

  const handleCancel = () => {
    if (selectedNotification) {
      cancelMutation.mutate(selectedNotification.id, {
        onSuccess: () => refetch(),
      })
    }
    handleMenuClose()
  }

  const getDeliveryRate = (notification: Notification) => {
    if (notification.totalRecipients === 0) return 0
    return (notification.totalDelivered / notification.totalRecipients) * 100
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6">
            Notification Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage sent notifications
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={() => refetch()}
          sx={{ borderRadius: 0 }}
        >
          Refresh
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | 'all')}
            label="Status"
            sx={{ borderRadius: 0 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="sending">Sending</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {!notifications || notifications.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          No notifications found. Create your first notification in the Compose tab.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Delivery Rate</TableCell>
                <TableCell>Sent At</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => {
                const deliveryRate = getDeliveryRate(notification)
                const statusConfig = STATUS_CONFIG[notification.status]

                return (
                  <TableRow key={notification.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {notification.body.substring(0, 50)}
                        {notification.body.length > 50 && '...'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={notification.status}
                        color={statusConfig.color}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {notification.totalRecipients}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={deliveryRate}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={deliveryRate > 80 ? 'success' : deliveryRate > 50 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption">
                          {deliveryRate.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {notification.totalDelivered} delivered
                        {notification.totalFailed > 0 && `, ${notification.totalFailed} failed`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {notification.sentAt ? (
                        <Tooltip title={format(new Date(notification.sentAt), 'PPpp')}>
                          <Typography variant="body2">
                            {format(new Date(notification.sentAt), 'MMM dd, HH:mm')}
                          </Typography>
                        </Tooltip>
                      ) : notification.scheduledFor ? (
                        <Tooltip title={format(new Date(notification.scheduledFor), 'PPpp')}>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(notification.scheduledFor), 'MMM dd, HH:mm')}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.notificationType.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification)}
                      >
                        <MoreVertOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification?.status === 'failed' && (
          <MenuItem onClick={handleRetry}>
            <RefreshOutlined fontSize="small" sx={{ mr: 1 }} />
            Retry Failed
          </MenuItem>
        )}
        {selectedNotification?.status === 'scheduled' && (
          <MenuItem onClick={handleCancel}>
            <CancelOutlined fontSize="small" sx={{ mr: 1 }} />
            Cancel
          </MenuItem>
        )}
        {(!selectedNotification || (selectedNotification.status !== 'failed' && selectedNotification.status !== 'scheduled')) && (
          <MenuItem disabled>No actions available</MenuItem>
        )}
      </Menu>
    </Box>
  )
}
