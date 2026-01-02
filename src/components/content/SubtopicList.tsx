import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoLibraryOutlined,
  PodcastsOutlined,
  QuizOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
} from '@mui/icons-material'
import { subtopicsAPI, Subtopic, SubtopicValidationStatus } from '@/api/subtopics'
import { useSnackbar } from 'notistack'

interface SubtopicListProps {
  topicId: string
  onEditSubtopic: (subtopic: Subtopic) => void
}

export const SubtopicList: React.FC<SubtopicListProps> = ({ topicId, onEditSubtopic }) => {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [validationStatuses, setValidationStatuses] = useState<
    Record<string, SubtopicValidationStatus>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    loadSubtopics()
  }, [topicId])

  const loadSubtopics = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await subtopicsAPI.getByTopicId(topicId)
      setSubtopics(data)

      // Load validation status for each subtopic
      const statuses: Record<string, SubtopicValidationStatus> = {}
      for (const subtopic of data) {
        try {
          const status = await subtopicsAPI.getValidationStatus(subtopic.id)
          statuses[subtopic.id] = status
        } catch (err) {
          console.error(`Failed to load validation status for ${subtopic.id}`, err)
        }
      }
      setValidationStatuses(statuses)
    } catch (err: any) {
      setError(err.message || 'Failed to load subtopics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData({ title: '', description: '' })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'error' })
      return
    }

    try {
      await subtopicsAPI.create({
        topicId,
        title: formData.title,
        description: formData.description,
        isMandatory: true,
        contentType: 'video',
        displayOrder: subtopics.length,
      })
      enqueueSnackbar('Subtopic created successfully', { variant: 'success' })
      handleCloseDialog()
      loadSubtopics()
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to create subtopic', { variant: 'error' })
    }
  }

  const handleDelete = async (subtopic: Subtopic) => {
    const confirmMessage = `Are you sure you want to delete "${subtopic.title}"? This will permanently delete:
- Video lesson
- Podcast (if any)
- All video-mapped MCQs

This action cannot be undone.`

    if (window.confirm(confirmMessage)) {
      try {
        await subtopicsAPI.delete(subtopic.id)
        enqueueSnackbar('Subtopic deleted successfully', { variant: 'success' })
        loadSubtopics()
      } catch (err: any) {
        enqueueSnackbar(err.message || 'Failed to delete subtopic', { variant: 'error' })
      }
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Subtopics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage subtopics with video lessons, podcasts, and MCQs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: '12px' }}
        >
          Add Subtopic
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Subtopics List */}
      <Paper
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {subtopics.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No subtopics yet. Click "Add Subtopic" to create one.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {subtopics.map((subtopic, index) => {
              const validation = validationStatuses[subtopic.id]

              return (
                <ListItem
                  key={subtopic.id}
                  sx={{
                    borderBottom: '1px solid #E5E7EB',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {subtopic.title}
                        </Typography>
                        {!subtopic.isActive && (
                          <Chip label="Inactive" size="small" color="default" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {subtopic.description}
                        </Typography>

                        {/* Content Status */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            icon={<VideoLibraryOutlined />}
                            label={validation?.hasVideo ? 'Video' : 'No Video'}
                            size="small"
                            color={validation?.hasVideo ? 'success' : 'default'}
                            variant="outlined"
                          />
                          <Chip
                            icon={<PodcastsOutlined />}
                            label={validation?.hasPodcast ? 'Podcast' : 'No Podcast'}
                            size="small"
                            color={validation?.hasPodcast ? 'info' : 'default'}
                            variant="outlined"
                          />
                          <Chip
                            icon={<QuizOutlined />}
                            label={`${validation?.mcqCount || 0} MCQs`}
                            size="small"
                            color={
                              validation?.mcqCount && validation.mcqCount >= 5 && validation.mcqCount <= 10
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </Box>

                        {/* Validation Status */}
                        {validation && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {validation.isValid ? (
                              <Chip
                                icon={<CheckCircleOutlined />}
                                label="Valid"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                icon={<ErrorOutlined />}
                                label="Incomplete"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            {validation.errors.length > 0 && (
                              <Typography variant="caption" color="error">
                                {validation.errors.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => onEditSubtopic(subtopic)}
                      sx={{ mr: 1 }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(subtopic)}
                      color="error"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Subtopic</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.title.trim()}
            sx={{ borderRadius: '12px' }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
