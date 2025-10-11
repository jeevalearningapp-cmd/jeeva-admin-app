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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ImageOutlined,
  UploadFileOutlined
} from '@mui/icons-material'
import { Alert } from '@mui/material'
import { useFlashcards, useCreateFlashcard, useUpdateFlashcard, useDeleteFlashcard, useUploadFlashcardImage } from '@/hooks/useFlashcards'
import { useLessons } from '@/hooks/useLessons'
import { PageLoader } from '@/components/common'
import { Flashcard, CreateFlashcardInput } from '@/types/content'
import { CSVUpload } from '@/components/common/CSVUpload'
import { flashcardTemplate } from '@/utils/csvTemplates'
import { useBulkUpload } from '@/hooks/useBulkUpload'

export const FlashcardsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [csvUploadOpen, setCsvUploadOpen] = useState(false)
  const [bulkLessonId, setBulkLessonId] = useState<string>('')
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lessonFilter, setLessonFilter] = useState<string>('all')
  const [formData, setFormData] = useState<CreateFlashcardInput>({
    lessonId: '',
    front: '',
    back: '',
    imageUrl: '',
    isActive: true,
    displayOrder: 0
  })
  const [uploading, setUploading] = useState(false)
  const [touched, setTouched] = useState({ lessonId: false, front: false, back: false })
  const [submitError, setSubmitError] = useState<string>('')
  const [initialLoad, setInitialLoad] = useState(true)

  const { data: flashcards, isLoading } = useFlashcards()
  const { data: lessons } = useLessons()
  const createMutation = useCreateFlashcard()
  const updateMutation = useUpdateFlashcard()
  const deleteMutation = useDeleteFlashcard()
  const uploadMutation = useUploadFlashcardImage()
  const { uploadFlashcards } = useBulkUpload()

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [isLoading, initialLoad])

  if (isLoading && initialLoad) {
    return <PageLoader />
  }

  const filteredFlashcards = flashcards?.filter((flashcard: Flashcard) => {
    const matchesSearch = flashcard.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flashcard.back.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLesson = lessonFilter === 'all' || flashcard.lessonId === lessonFilter
    return matchesSearch && matchesLesson
  })

  const handleOpenDialog = (flashcard?: Flashcard) => {
    if (flashcard) {
      setEditingFlashcard(flashcard)
      setFormData({
        lessonId: flashcard.lessonId,
        front: flashcard.front,
        back: flashcard.back,
        imageUrl: flashcard.imageUrl,
        isActive: flashcard.isActive,
        displayOrder: flashcard.displayOrder
      })
    } else {
      setEditingFlashcard(null)
      setFormData({
        lessonId: '',
        front: '',
        back: '',
        imageUrl: '',
        isActive: true,
        displayOrder: 0
      })
    }
    setTouched({ lessonId: false, front: false, back: false })
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingFlashcard(null)
    setTouched({ lessonId: false, front: false, back: false })
    setSubmitError('')
  }

  const validate = () => {
    return formData.lessonId.trim() !== '' && formData.front.trim() !== '' && formData.back.trim() !== ''
  }

  const getFieldError = (field: 'lessonId' | 'front' | 'back') => {
    if (!touched[field]) return ''
    if (field === 'lessonId' && !formData.lessonId) return 'Lesson is required'
    if (field === 'front' && !formData.front.trim()) return 'Front text is required'
    if (field === 'back' && !formData.back.trim()) return 'Back text is required'
    return ''
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadMutation.mutateAsync(file)
      setFormData({ ...formData, imageUrl: url })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setTouched({ lessonId: true, front: true, back: true })
    if (!validate()) return

    setSubmitError('')
    try {
      if (editingFlashcard) {
        await updateMutation.mutateAsync({
          id: editingFlashcard.id,
          input: formData
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      handleCloseDialog()
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleActive = async (flashcard: Flashcard) => {
    await updateMutation.mutateAsync({
      id: flashcard.id,
      input: { isActive: !flashcard.isActive }
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Flashcards</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage study flashcards for learning
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: '12px' }}
          >
            Add Flashcard
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlined />}
            onClick={() => setCsvUploadOpen(true)}
            sx={{ borderRadius: '12px' }}
          >
            Bulk Upload
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search flashcards..."
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Lesson</InputLabel>
          <Select
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            label="Filter by Lesson"
          >
            <MenuItem value="all">All Lessons</MenuItem>
            {lessons?.map(lesson => (
              <MenuItem key={lesson.id} value={lesson.id}>{lesson.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Flashcards Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Front</TableCell>
              <TableCell>Back</TableCell>
              <TableCell>Lesson</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFlashcards?.map((flashcard) => (
              <TableRow key={flashcard.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {flashcard.front.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {flashcard.back.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={lessons?.find(l => l.id === flashcard.lessonId)?.title || 'Unknown'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={flashcard.displayOrder} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={flashcard.isActive}
                    onChange={() => handleToggleActive(flashcard)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(flashcard)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(flashcard.id)}
                    color="error"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!filteredFlashcards || filteredFlashcards.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || lessonFilter !== 'all'
                      ? 'No flashcards found matching your filters.'
                      : 'No flashcards yet. Click "Add Flashcard" to create one.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFlashcard ? 'Edit Flashcard' : 'Add Flashcard'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}
            <FormControl fullWidth required error={!!getFieldError('lessonId')}>
              <InputLabel>Lesson</InputLabel>
              <Select
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                onBlur={() => setTouched({ ...touched, lessonId: true })}
                label="Lesson"
              >
                {lessons?.filter(l => l.isActive).map(lesson => (
                  <MenuItem key={lesson.id} value={lesson.id}>{lesson.title}</MenuItem>
                ))}
              </Select>
              {getFieldError('lessonId') && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {getFieldError('lessonId')}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Front (Question/Term)"
              value={formData.front}
              onChange={(e) => setFormData({ ...formData, front: e.target.value })}
              onBlur={() => setTouched({ ...touched, front: true })}
              fullWidth
              multiline
              rows={3}
              required
              error={!!getFieldError('front')}
              helperText={getFieldError('front')}
            />
            <TextField
              label="Back (Answer/Definition)"
              value={formData.back}
              onChange={(e) => setFormData({ ...formData, back: e.target.value })}
              onBlur={() => setTouched({ ...touched, back: true })}
              fullWidth
              multiline
              rows={3}
              required
              error={!!getFieldError('back')}
              helperText={getFieldError('back')}
            />

            {/* Image Upload */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageOutlined />}
                disabled={uploading}
                sx={{ borderRadius: '12px' }}
              >
                {uploading ? 'Uploading...' : formData.imageUrl ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {formData.imageUrl && (
                <TextField
                  label="Or enter image URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            <TextField
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!validate() || createMutation.isPending || updateMutation.isPending}
            sx={{ borderRadius: '12px' }}
          >
            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingFlashcard ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Bulk Upload - Lesson Selection */}
      <Dialog open={csvUploadOpen} onClose={() => { setCsvUploadOpen(false); setBulkLessonId('') }} maxWidth="sm" fullWidth>
        <DialogTitle>Select Lesson for Bulk Upload</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Choose which lesson these flashcards should be added to:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Lesson</InputLabel>
              <Select
                value={bulkLessonId}
                onChange={(e) => setBulkLessonId(e.target.value)}
                label="Lesson"
              >
                {lessons?.filter(l => l.isActive).map(lesson => (
                  <MenuItem key={lesson.id} value={lesson.id}>{lesson.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCsvUploadOpen(false); setBulkLessonId('') }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (bulkLessonId) {
                setCsvUploadOpen(false)
              }
            }}
            disabled={!bulkLessonId}
          >
            Continue to Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Bulk Upload Component - Shown after lesson selection */}
      {bulkLessonId && !csvUploadOpen && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <CSVUpload
            template={flashcardTemplate}
            onUpload={async (data) => {
              const result = await uploadFlashcards(data, bulkLessonId)
              if (result) {
                setBulkLessonId('') // Reset lesson after successful upload
              }
              return result
            }}
            contentType="flashcard"
          />
        </Box>
      )}
    </Box>
  )
}
