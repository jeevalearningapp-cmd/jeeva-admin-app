import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Upload,
  Download,
  Close,
  CheckCircle,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material'
import { parseCSV, CSVTemplate, downloadCSV } from '@/utils/csvTemplates'

export interface CSVUploadProps {
  template: CSVTemplate
  onUpload: (data: Record<string, string>[]) => Promise<boolean>
  contentType: 'lesson' | 'question' | 'flashcard'
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export const CSVUpload: React.FC<CSVUploadProps> = ({
  template,
  onUpload,
  contentType
}) => {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<string[][]>([])
  const [validatedData, setValidatedData] = useState<Record<string, string>[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadSuccess(false)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const data = parseCSV(text)
        setParsedData(data)
        validateData(data)
      }
      reader.readAsText(selectedFile)
    }
  }

  const validateData = (data: string[][]) => {
    if (data.length === 0) {
      setErrors([{ row: 0, field: 'file', message: 'CSV file is empty' }])
      return
    }

    const csvHeaders = data[0].map(h => h.trim())
    const expectedHeaders = template.headers
    const newErrors: ValidationError[] = []
    const validated: Record<string, string>[] = []

    // Create case-insensitive header mapping
    const headerMap = new Map<string, string>()
    csvHeaders.forEach((csvHeader, index) => {
      const matchingTemplate = expectedHeaders.find(
        th => th.toLowerCase() === csvHeader.toLowerCase()
      )
      if (matchingTemplate) {
        headerMap.set(matchingTemplate, csvHeader)
      }
    })

    // Validate headers
    const missingHeaders = expectedHeaders.filter(
      h => !Array.from(headerMap.keys()).includes(h)
    )
    if (missingHeaders.length > 0) {
      newErrors.push({
        row: 0,
        field: 'headers',
        message: `Missing required columns: ${missingHeaders.join(', ')}`
      })
    }

    // Validate data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const rowData: Record<string, string> = {}

      // Initialize all template columns with empty strings
      template.headers.forEach(templateHeader => {
        const csvHeader = headerMap.get(templateHeader)
        const csvIndex = csvHeader ? csvHeaders.indexOf(csvHeader) : -1
        rowData[templateHeader] = csvIndex >= 0 ? (row[csvIndex] || '') : ''
      })

      // Type-specific validation
      if (contentType === 'question') {
        if (!rowData.question_text) {
          newErrors.push({ row: i, field: 'question_text', message: 'Question text is required' })
        }
        if (!['multiple_choice', 'true_false', 'short_answer'].includes(rowData.question_type)) {
          newErrors.push({ row: i, field: 'question_type', message: 'Invalid question type' })
        }
        if (!['easy', 'medium', 'hard'].includes(rowData.difficulty)) {
          newErrors.push({ row: i, field: 'difficulty', message: 'Invalid difficulty level' })
        }

        // Validate options based on question type
        if (rowData.question_type === 'multiple_choice' || rowData.question_type === 'true_false') {
          let hasCorrect = false
          let hasOptions = false
          for (let j = 1; j <= 4; j++) {
            if (rowData[`option_${j}`]) {
              hasOptions = true
              if (rowData[`option_${j}_correct`]?.toLowerCase() === 'true') {
                hasCorrect = true
              }
            }
          }
          if (!hasOptions) {
            newErrors.push({ row: i, field: 'options', message: 'At least one option is required' })
          }
          if (!hasCorrect) {
            newErrors.push({ row: i, field: 'options', message: 'At least one option must be marked as correct' })
          }
        } else if (rowData.question_type === 'short_answer') {
          if (!rowData.option_1) {
            newErrors.push({ row: i, field: 'option_1', message: 'Correct answer is required for short answer questions' })
          }
        }
      } else if (contentType === 'flashcard') {
        if (!rowData.front) {
          newErrors.push({ row: i, field: 'front', message: 'Front text is required' })
        }
        if (!rowData.back) {
          newErrors.push({ row: i, field: 'back', message: 'Back text is required' })
        }
      } else if (contentType === 'lesson') {
        if (!rowData.title) {
          newErrors.push({ row: i, field: 'title', message: 'Lesson title is required' })
        }
        if (!rowData.content) {
          newErrors.push({ row: i, field: 'content', message: 'Lesson content is required' })
        }
      }

      validated.push(rowData)
    }

    setErrors(newErrors)
    setValidatedData(validated)
  }

  const handleUpload = async () => {
    if (errors.length > 0) return

    setUploading(true)
    try {
      const success = await onUpload(validatedData)
      if (success) {
        setUploadSuccess(true)
        setTimeout(() => {
          setOpen(false)
          resetState()
        }, 2000)
      } else {
        setErrors([{ row: 0, field: 'upload', message: 'Upload failed. Please check the console for details.' }])
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      setErrors([{ row: 0, field: 'upload', message: error?.message || 'Upload failed. Please try again.' }])
    } finally {
      setUploading(false)
    }
  }

  const resetState = () => {
    setFile(null)
    setParsedData([])
    setValidatedData([])
    setErrors([])
    setUploadSuccess(false)
  }

  const handleClose = () => {
    setOpen(false)
    resetState()
  }

  const getContentTypeLabel = () => {
    return contentType.charAt(0).toUpperCase() + contentType.slice(1) + 's'
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Upload />}
        onClick={() => setOpen(true)}
      >
        Bulk Upload CSV
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Bulk Upload {getContentTypeLabel()}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box mb={3}>
            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2" mb={1}>
                <strong>Step 1:</strong> Download the CSV template below
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Step 2:</strong> Fill in your data following the sample format
              </Typography>
              <Typography variant="body2">
                <strong>Step 3:</strong> Upload the completed CSV file
              </Typography>
            </Alert>
          </Box>

          <Box mb={3} display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => downloadCSV(template)}
            >
              Download CSV Template
            </Button>

            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              disabled={uploading}
            >
              {file ? file.name : 'Choose CSV File'}
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {errors.length > 0 && (
            <Box mb={3}>
              <Alert severity="error" icon={<ErrorIcon />}>
                <Typography variant="subtitle2" mb={1}>
                  <strong>Validation Errors:</strong>
                </Typography>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2">
                    Row {error.row}: {error.field} - {error.message}
                  </Typography>
                ))}
              </Alert>
            </Box>
          )}

          {uploadSuccess && (
            <Box mb={3}>
              <Alert severity="success" icon={<CheckCircle />}>
                Upload successful! {validatedData.length} {getContentTypeLabel().toLowerCase()} added.
              </Alert>
            </Box>
          )}

          {parsedData.length > 0 && (
            <Box>
              <Typography variant="subtitle2" mb={2}>
                Preview ({parsedData.length - 1} rows)
                {errors.length === 0 && (
                  <Chip
                    label="Valid"
                    color="success"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {parsedData[0]?.map((header, index) => (
                        <TableCell key={index}>
                          <strong>{header}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.slice(1, 11).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell.length > 50 ? cell.substring(0, 50) + '...' : cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {parsedData.length > 11 && (
                <Typography variant="caption" color="text.secondary" mt={1}>
                  Showing first 10 rows of {parsedData.length - 1} total rows
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || errors.length > 0 || uploading || uploadSuccess}
            startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
          >
            {uploading ? 'Uploading...' : `Upload ${validatedData.length} Items`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
