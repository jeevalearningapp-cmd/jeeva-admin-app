import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material'
import { UploadFileOutlined, DownloadOutlined, CheckCircleOutlined } from '@mui/icons-material'
import { CreateFlashcardInput } from '@/types/content'
import { flashcardsAPI } from '@/api/flashcards'
import { useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import Papa from 'papaparse'

interface FlashcardCSVUploadProps {
  category: string
}

interface ParsedFlashcard {
  front: string
  back: string
  imageUrl?: string
}

export const FlashcardCSVUpload: React.FC<FlashcardCSVUploadProps> = ({ category }) => {
  const [parsedFlashcards, setParsedFlashcards] = useState<ParsedFlashcard[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  const handleDownloadTemplate = () => {
    const csvContent = `front,back,image_url
"What is the NMC Code?","The NMC Code is a set of professional standards that nurses and midwives must uphold to ensure patient safety and quality care.",""
"Define Mental Capacity","Mental capacity is a person's ability to make a specific decision at the time it needs to be made.",""
"What is Duty of Candour?","A legal duty to be open and honest with patients when something goes wrong with their care.",""`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = 'flashcards_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string): ParsedFlashcard[] => {
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`)
    }

    if (!parseResult.data || parseResult.data.length === 0) {
      throw new Error('CSV file is empty or missing data')
    }

    const flashcards: ParsedFlashcard[] = []

    parseResult.data.forEach((row: any, index: number) => {
      if (!row.front || !row.back) {
        console.warn(`Skipping row ${index + 2}: missing front or back`)
        return
      }

      flashcards.push({
        front: row.front,
        back: row.back,
        imageUrl: row.image_url || undefined
      })
    })

    return flashcards
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess(false)
    setParsedFlashcards([])

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const flashcards = parseCSV(text)
        setParsedFlashcards(flashcards)
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const handleBulkUpload = async () => {
    if (parsedFlashcards.length === 0) {
      setError('No flashcards to upload')
      return
    }

    setUploading(true)
    setError('')

    try {
      const flashcardsToCreate: CreateFlashcardInput[] = parsedFlashcards.map((flashcard, index) => ({
        category,
        front: flashcard.front,
        back: flashcard.back,
        imageUrl: flashcard.imageUrl,
        isActive: true,
        displayOrder: index
      }))

      for (const flashcard of flashcardsToCreate) {
        await flashcardsAPI.create(flashcard)
      }

      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['flashcards', 'category', category] })
      
      setSuccess(true)
      enqueueSnackbar(`${flashcardsToCreate.length} flashcards uploaded successfully`, { variant: 'success' })
      setParsedFlashcards([])
    } catch (err: any) {
      setError(err.message || 'Failed to upload flashcards')
      enqueueSnackbar('Failed to upload flashcards', { variant: 'error' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bulk Upload Flashcards via CSV
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload multiple flashcards at once using a CSV file. Download the template to get started.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>CSV Format Requirements:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li><strong>front</strong> (required): The question or term</li>
          <li><strong>back</strong> (required): The answer or definition</li>
          <li><strong>image_url</strong> (optional): URL of an image</li>
        </ul>
        All flashcards will be assigned to: <strong>{category}</strong>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleOutlined />}>
          Flashcards uploaded successfully! They are now available in the Flashcards tab.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </Button>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileOutlined />}
        >
          Upload CSV
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {uploading && <LinearProgress sx={{ mb: 3 }} />}

      {parsedFlashcards.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              Preview: {parsedFlashcards.length} flashcard(s) parsed
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkUpload}
              disabled={uploading}
            >
              Upload {parsedFlashcards.length} Flashcard(s)
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">#</TableCell>
                  <TableCell width="40%">Front</TableCell>
                  <TableCell width="40%">Back</TableCell>
                  <TableCell width="15%">Image</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedFlashcards.map((flashcard, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {flashcard.front.length > 100
                        ? `${flashcard.front.substring(0, 100)}...`
                        : flashcard.front}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {flashcard.back.length > 100
                        ? `${flashcard.back.substring(0, 100)}...`
                        : flashcard.back}
                    </TableCell>
                    <TableCell>
                      {flashcard.imageUrl ? (
                        <Chip label="Yes" size="small" color="success" />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}
