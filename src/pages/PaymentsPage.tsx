import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  SearchOutlined,
  GetAppOutlined,
  MoneyOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { usePayments } from '@/hooks/usePayments'
import { ExportDialog } from '@/components/payments/ExportDialog'
import type { PaymentFilters, Payment, PaymentStatus, PaymentGateway } from '@/types/payments'
import type { StatementData } from '@/types/export'
import { format } from 'date-fns'
import { DownloadOutlined } from '@mui/icons-material'

const statuses: PaymentStatus[] = ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded']
const gateways: PaymentGateway[] = ['stripe']

export const PaymentsPage: React.FC = () => {
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const { payments, summary, isLoading, refund, isRefunding } = usePayments(filters)

  const prepareStatementData = (): StatementData => {
    return {
      payments: filteredPayments,
      subscriptions: [],
      summary,
      refunds: [],
      generatedAt: new Date().toISOString(),
      dateRange: {
        from: filters.dateFrom || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        to: filters.dateTo || format(new Date(), 'yyyy-MM-dd'),
      },
    }
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'succeeded': return 'success'
      case 'failed': return 'error'
      case 'pending': return 'warning'
      case 'refunded': return 'info'
      default: return 'default'
    }
  }

  const getGatewayLabel = (gateway: PaymentGateway) => {
    return gateway.charAt(0).toUpperCase() + gateway.slice(1)
  }

  const filteredPayments = payments.filter(p =>
    !searchQuery || 
    p.id.includes(searchQuery) || 
    p.userId.includes(searchQuery)
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Payment Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all payment transactions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadOutlined />}
          onClick={() => setExportOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Export Statement
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Payments
            </Typography>
            <Typography variant="h5">
              {summary.totalPayments}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h5">
              ${summary.totalAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Successful
            </Typography>
            <Typography variant="h5" sx={{ color: '#4caf50' }}>
              {summary.successfulPayments}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Failed
            </Typography>
            <Typography variant="h5" sx={{ color: '#f44336' }}>
              {summary.failedPayments}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Search"
            placeholder="Payment ID or User ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <SearchOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              multiple
              value={filters.status || []}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as PaymentStatus[] })}
            >
              {statuses.map(s => (
                <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Gateway</InputLabel>
            <Select
              label="Gateway"
              multiple
              value={filters.gateway || []}
              onChange={(e) => setFilters({ ...filters, gateway: e.target.value as PaymentGateway[] })}
            >
              {gateways.map(g => (
                <MenuItem key={g} value={g}>{getGatewayLabel(g)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Payments Table */}
      <Paper sx={{ borderRadius: 0, overflowX: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPayments.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No payments found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Payment ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Gateway</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {payment.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{payment.userId.substring(0, 8)}...</TableCell>
                  <TableCell>${payment.finalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={getGatewayLabel(payment.gateway)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      size="small"
                      color={getStatusColor(payment.status) as any}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setDetailsOpen(true)
                        }}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {payment.status === 'succeeded' && (
                      <Tooltip title="Process Refund">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setRefundAmount(payment.finalAmount.toString())
                            setRefundOpen(true)
                          }}
                        >
                          <MoneyOffOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Details Dialog */}
      {selectedPayment && (
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Payment ID</Typography>
              <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {selectedPayment.id}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">User ID</Typography>
              <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {selectedPayment.userId}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Original Amount</Typography>
                <Typography>${selectedPayment.originalAmount.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Discount</Typography>
                <Typography>${selectedPayment.discountAmount.toFixed(2)}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Final Amount</Typography>
              <Typography variant="h6">${selectedPayment.finalAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Gateway</Typography>
                <Chip label={getGatewayLabel(selectedPayment.gateway)} size="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedPayment.status}
                  size="small"
                  color={getStatusColor(selectedPayment.status) as any}
                  variant="filled"
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Created</Typography>
              <Typography>{format(new Date(selectedPayment.createdAt), 'PPpp')}</Typography>
            </Box>
            {selectedPayment.failureMessage && (
              <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1 }}>
                <Typography variant="caption" color="error">Failure Message</Typography>
                <Typography variant="body2" color="error">
                  {selectedPayment.failureMessage}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        statementData={prepareStatementData()}
      />

      {/* Refund Dialog */}
      {selectedPayment && (
        <Dialog open={refundOpen} onClose={() => setRefundOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Payment Amount</Typography>
              <Typography variant="h6">${selectedPayment.finalAmount.toFixed(2)}</Typography>
            </Box>
            <TextField
              label="Refund Amount"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              fullWidth
              inputProps={{ step: '0.01' }}
            />
            <TextField
              label="Reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Why is this refund being issued?"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                refund({
                  paymentId: selectedPayment.id,
                  amount: parseFloat(refundAmount),
                  reason: refundReason,
                })
                setRefundOpen(false)
                setDetailsOpen(false)
              }}
              disabled={isRefunding || !refundAmount}
            >
              {isRefunding ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
