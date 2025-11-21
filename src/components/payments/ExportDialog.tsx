import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  RadioGroup,
  Radio,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import { exportService } from '@/services/exportService'
import type { ExportOptions, ExportContentType, StatementData } from '@/types/export'
import { format } from 'date-fns'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  statementData: StatementData
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, statementData }) => {
  const [format_type, setFormatType] = useState<'csv' | 'pdf'>('pdf')
  const [selectedContent, setSelectedContent] = useState<ExportContentType[]>(['payments', 'summary'])
  const [includeHeader, setIncludeHeader] = useState(true)
  const [includeFooter, setIncludeFooter] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [dateFrom, setDateFrom] = useState(statementData.dateRange.from)
  const [dateTo, setDateTo] = useState(statementData.dateRange.to)

  const handleContentChange = (content: ExportContentType) => {
    setSelectedContent(prev =>
      prev.includes(content) ? prev.filter(c => c !== content) : [...prev, content]
    )
  }

  const handleExport = async () => {
    if (selectedContent.length === 0) {
      alert('Please select at least one content type to export')
      return
    }

    setIsExporting(true)
    try {
      const options: ExportOptions = {
        format: format_type,
        contentTypes: selectedContent,
        dateFrom,
        dateTo,
        includeHeader,
        includeFooter,
      }

      if (format_type === 'csv') {
        await exportService.exportToCSV(statementData, options)
      } else {
        await exportService.exportToPDF(statementData, options)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export statement. Please try again.')
    } finally {
      setIsExporting(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Payment Statement</DialogTitle>
      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Date Range */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Period Selector
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>
        </Box>

        {/* Content Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Content to Include
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedContent.includes('payments')}
                  onChange={() => handleContentChange('payments')}
                />
              }
              label="Payment Transactions"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedContent.includes('subscriptions')}
                  onChange={() => handleContentChange('subscriptions')}
                />
              }
              label="Subscription Details"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedContent.includes('summary')}
                  onChange={() => handleContentChange('summary')}
                />
              }
              label="Financial Summary"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedContent.includes('refunds')}
                  onChange={() => handleContentChange('refunds')}
                />
              }
              label="Refund Records"
            />
          </FormGroup>
        </Box>

        {/* Format Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Export Format
          </Typography>
          <RadioGroup
            value={format_type}
            onChange={(e) => setFormatType(e.target.value as 'csv' | 'pdf')}
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label="PDF (With Branding & Header)"
            />
            <FormControlLabel value="csv" control={<Radio />} label="CSV (Spreadsheet)" />
          </RadioGroup>
        </Box>

        {/* Additional Options */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Options
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                />
              }
              label="Include Jeeva Header & Logo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeFooter}
                  onChange={(e) => setIncludeFooter(e.target.checked)}
                />
              }
              label="Include Footer with Contact Info"
            />
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadOutlined />}
          onClick={handleExport}
          disabled={isExporting || selectedContent.length === 0}
        >
          {isExporting ? 'Exporting...' : `Export as ${format_type.toUpperCase()}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
