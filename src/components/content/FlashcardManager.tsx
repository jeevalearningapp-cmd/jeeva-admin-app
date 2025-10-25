import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  EditOutlined,
  DeleteOutlined,
  AddOutlined,
  FlipOutlined
} from '@mui/icons-material'
import { Flashcard, CreateFlashcardInput } from '@/types/content'
import {
  useFlashcardsByCategory,
  useCreateFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard
} from '@/hooks/useFlashcards'

interface FlashcardManagerProps {
  category: string
  onFlashcardAdded?: () => void
}

export const FlashcardManager: React.FC<FlashcardManagerProps> = ({
  category,
  onFlashcardAdded
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateFlashcardInput>({
    category,
    front: '',
    back: '',
    imageUrl: '',
    isActive: true,
    displayOrder: 0
  })

  const { data: flashcards = [], isLoading } = useFlashcardsByCategory(category)
  const createMutation = useCreateFlashcard()
  const updateMutation = useUpdateFlashcard()
  const deleteMutation = useDeleteFlashcard()

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category
    }))
  }, [category])

  const handleOpenDialog = (flashcard?: Flashcard) => {
    if (flashcard) {
      setEditingFlashcard(flashcard)
      setFormData({
        category: flashcard.category || category,
        front: flashcard.front,
        back: flashcard.back,
        imageUrl: flashcard.imageUrl,
        isActive: flashcard.isActive,
        displayOrder: flashcard.displayOrder
      })
    } else {
      setEditingFlashcard(null)
      setFormData({
        category,
        front: '',
        back: '',
        imageUrl: '',
        isActive: true,
        displayOrder: flashcards.length
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingFlashcard(null)
  }

  const handleSubmit = async () => {
    if (editingFlashcard) {
      await updateMutation.mutateAsync({
        id: editingFlashcard.id,
        input: formData
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
    handleCloseDialog()
    onFlashcardAdded?.()
  }

  const handleDeleteClick = (flashcardId: string) => {
    setFlashcardToDelete(flashcardId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (flashcardToDelete) {
      await deleteMutation.mutateAsync(flashcardToDelete)
      setDeleteConfirmOpen(false)
      setFlashcardToDelete(null)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">
            Flashcards for {category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create memorization cards to help students review key concepts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Add Flashcard
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : flashcards.length === 0 ? (
        <Alert severity="info" icon={<FlipOutlined />}>
          No flashcards found for this topic.
          <br />
          Click "Add Flashcard" to create your first flashcard or use bulk upload to add multiple at once.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40%">Front (Question/Term)</TableCell>
                <TableCell width="40%">Back (Answer/Definition)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flashcards.map((flashcard) => (
                <TableRow key={flashcard.id}>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {flashcard.front.length > 80
                      ? `${flashcard.front.substring(0, 80)}...`
                      : flashcard.front}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {flashcard.back.length > 80
                      ? `${flashcard.back.substring(0, 80)}...`
                      : flashcard.back}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={flashcard.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={flashcard.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(flashcard)}>
                      <EditOutlined />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(flashcard.id)}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Flashcard Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFlashcard ? 'Edit Flashcard' : 'Add New Flashcard'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              <strong>Front:</strong> The question or term students see first<br />
              <strong>Back:</strong> The answer or definition revealed when flipped
            </Alert>

            <TextField
              label="Front (Question/Term)"
              multiline
              rows={3}
              value={formData.front}
              onChange={(e) => setFormData({ ...formData, front: e.target.value })}
              fullWidth
              required
              placeholder="e.g., What is the NMC Code?"
            />

            <TextField
              label="Back (Answer/Definition)"
              multiline
              rows={4}
              value={formData.back}
              onChange={(e) => setFormData({ ...formData, back: e.target.value })}
              fullWidth
              required
              placeholder="e.g., A set of professional standards that nurses must uphold..."
            />

            <TextField
              label="Image URL (Optional)"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              fullWidth
              placeholder="https://example.com/image.png"
              helperText="Add an image to make the flashcard more memorable"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active (visible to students)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.front || !formData.back}
          >
            {editingFlashcard ? 'Update' : 'Create'} Flashcard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
