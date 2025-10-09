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
  VideoLibraryOutlined
} from '@mui/icons-material'
import { Alert } from '@mui/material'
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons'
import { useTopics } from '@/hooks/useTopics'
import { PageLoader } from '@/components/common'
import { Lesson, CreateLessonInput } from '@/types/content'

export const LessonsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [formData, setFormData] = useState<CreateLessonInput>({
    topicId: '',
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    isActive: true,
    displayOrder: 0
  })
  const [touched, setTouched] = useState({ topicId: false, title: false, content: false })
  const [submitError, setSubmitError] = useState<string>('')
  const [initialLoad, setInitialLoad] = useState(true)

  const { data: lessons, isLoading } = useLessons()
  const { data: topics } = useTopics()
  const createMutation = useCreateLesson()
  const updateMutation = useUpdateLesson()
  const deleteMutation = useDeleteLesson()

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [isLoading, initialLoad])

  if (isLoading && initialLoad) {
    return <PageLoader />
  }

  const filteredLessons = lessons?.filter((lesson: Lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTopic = topicFilter === 'all' || lesson.topicId === topicFilter
    return matchesSearch && matchesTopic
  })

  const handleOpenDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson)
      setFormData({
        topicId: lesson.topicId,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        isActive: lesson.isActive,
        displayOrder: lesson.displayOrder
      })
    } else {
      setEditingLesson(null)
      setFormData({
        topicId: '',
        title: '',
        content: '',
        videoUrl: '',
        duration: 0,
        isActive: true,
        displayOrder: 0
      })
    }
    setTouched({ topicId: false, title: false, content: false })
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingLesson(null)
    setTouched({ topicId: false, title: false, content: false })
    setSubmitError('')
  }

  const validate = () => {
    return formData.topicId.trim() !== '' && formData.title.trim() !== '' && formData.content.trim() !== ''
  }

  const getFieldError = (field: 'topicId' | 'title' | 'content') => {
    if (!touched[field]) return ''
    if (field === 'topicId' && !formData.topicId) return 'Topic is required'
    if (field === 'title' && !formData.title.trim()) return 'Title is required'
    if (field === 'content' && !formData.content.trim()) return 'Content is required'
    return ''
  }

  const handleSubmit = async () => {
    setTouched({ topicId: true, title: true, content: true })
    if (!validate()) return

    setSubmitError('')
    try {
      if (editingLesson) {
        await updateMutation.mutateAsync({
          id: editingLesson.id,
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
    if (window.confirm('Are you sure you want to delete this lesson? This will also delete all related questions and flashcards.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleActive = async (lesson: Lesson) => {
    await updateMutation.mutateAsync({
      id: lesson.id,
      input: { isActive: !lesson.isActive }
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Lessons</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage lesson content and videos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: '12px' }}
        >
          Add Lesson
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search lessons..."
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
          <InputLabel>Filter by Topic</InputLabel>
          <Select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            label="Filter by Topic"
          >
            <MenuItem value="all">All Topics</MenuItem>
            {topics?.map(topic => (
              <MenuItem key={topic.id} value={topic.id}>{topic.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lessons Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Video</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLessons?.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {lesson.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={topics?.find(t => t.id === lesson.topicId)?.title || 'Unknown'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={`${lesson.duration} min`} size="small" />
                </TableCell>
                <TableCell>
                  {lesson.videoUrl && (
                    <VideoLibraryOutlined fontSize="small" color="primary" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={lesson.displayOrder} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={lesson.isActive}
                    onChange={() => handleToggleActive(lesson)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(lesson)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(lesson.id)}
                    color="error"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!filteredLessons || filteredLessons.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || topicFilter !== 'all'
                      ? 'No lessons found matching your filters.'
                      : 'No lessons yet. Click "Add Lesson" to create one.'}
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
          {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}
            <FormControl fullWidth required error={!!getFieldError('topicId')}>
              <InputLabel>Topic</InputLabel>
              <Select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                onBlur={() => setTouched({ ...touched, topicId: true })}
                label="Topic"
              >
                {topics?.filter(t => t.isActive).map(topic => (
                  <MenuItem key={topic.id} value={topic.id}>{topic.title}</MenuItem>
                ))}
              </Select>
              {getFieldError('topicId') && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {getFieldError('topicId')}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={() => setTouched({ ...touched, title: true })}
              fullWidth
              required
              error={!!getFieldError('title')}
              helperText={getFieldError('title')}
            />
            <TextField
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              onBlur={() => setTouched({ ...touched, content: true })}
              fullWidth
              multiline
              rows={5}
              required
              error={!!getFieldError('content')}
              helperText={getFieldError('content')}
            />
            <TextField
              label="Video URL"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              fullWidth
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              fullWidth
            />
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
            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingLesson ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
