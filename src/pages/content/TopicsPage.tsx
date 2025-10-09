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
  SearchOutlined
} from '@mui/icons-material'
import { Alert } from '@mui/material'
import { useTopics, useCreateTopic, useUpdateTopic, useDeleteTopic } from '@/hooks/useTopics'
import { useModules } from '@/hooks/useModules'
import { PageLoader } from '@/components/common'
import { Topic, CreateTopicInput } from '@/types/content'

export const TopicsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [formData, setFormData] = useState<CreateTopicInput>({
    moduleId: '',
    title: '',
    description: '',
    isActive: true,
    displayOrder: 0
  })
  const [touched, setTouched] = useState({ moduleId: false, title: false, description: false })
  const [submitError, setSubmitError] = useState<string>('')
  const [initialLoad, setInitialLoad] = useState(true)

  const { data: topics, isLoading } = useTopics()
  const { data: modules } = useModules()
  const createMutation = useCreateTopic()
  const updateMutation = useUpdateTopic()
  const deleteMutation = useDeleteTopic()

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [isLoading, initialLoad])

  if (isLoading && initialLoad) {
    return <PageLoader />
  }

  const filteredTopics = topics?.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModule = moduleFilter === 'all' || topic.moduleId === moduleFilter
    return matchesSearch && matchesModule
  })

  const handleOpenDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic)
      setFormData({
        moduleId: topic.moduleId,
        title: topic.title,
        description: topic.description,
        isActive: topic.isActive,
        displayOrder: topic.displayOrder
      })
    } else {
      setEditingTopic(null)
      setFormData({
        moduleId: '',
        title: '',
        description: '',
        isActive: true,
        displayOrder: 0
      })
    }
    setTouched({ moduleId: false, title: false, description: false })
    setSubmitError('')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTopic(null)
    setTouched({ moduleId: false, title: false, description: false })
    setSubmitError('')
  }

  const validate = () => {
    return formData.moduleId.trim() !== '' && formData.title.trim() !== '' && formData.description.trim() !== ''
  }

  const getFieldError = (field: 'moduleId' | 'title' | 'description') => {
    if (!touched[field]) return ''
    if (field === 'moduleId' && !formData.moduleId) return 'Module is required'
    if (field === 'title' && !formData.title.trim()) return 'Title is required'
    if (field === 'description' && !formData.description.trim()) return 'Description is required'
    return ''
  }

  const handleSubmit = async () => {
    setTouched({ moduleId: true, title: true, description: true })
    if (!validate()) return

    setSubmitError('')
    try {
      if (editingTopic) {
        await updateMutation.mutateAsync({
          id: editingTopic.id,
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
    if (window.confirm('Are you sure you want to delete this topic? This will also delete all related lessons.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleActive = async (topic: Topic) => {
    await updateMutation.mutateAsync({
      id: topic.id,
      input: { isActive: !topic.isActive }
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Topics</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage topics within modules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: '12px' }}
        >
          Add Topic
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search topics..."
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
          <InputLabel>Filter by Module</InputLabel>
          <Select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            label="Filter by Module"
          >
            <MenuItem value="all">All Modules</MenuItem>
            {modules?.map(module => (
              <MenuItem key={module.id} value={module.id}>{module.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Topics Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTopics?.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {topic.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={modules?.find(m => m.id === topic.moduleId)?.title || 'Unknown'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {topic.description.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={topic.displayOrder} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={topic.isActive}
                    onChange={() => handleToggleActive(topic)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(topic)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(topic.id)}
                    color="error"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!filteredTopics || filteredTopics.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || moduleFilter !== 'all'
                      ? 'No topics found matching your filters.'
                      : 'No topics yet. Click "Add Topic" to create one.'}
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
          {editingTopic ? 'Edit Topic' : 'Add Topic'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}
            <FormControl 
              fullWidth 
              required 
              error={!!getFieldError('moduleId')}
            >
              <InputLabel>Module</InputLabel>
              <Select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                onBlur={() => setTouched({ ...touched, moduleId: true })}
                label="Module"
              >
                {modules?.filter(m => m.isActive).map(module => (
                  <MenuItem key={module.id} value={module.id}>{module.title}</MenuItem>
                ))}
              </Select>
              {getFieldError('moduleId') && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {getFieldError('moduleId')}
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
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => setTouched({ ...touched, description: true })}
              fullWidth
              multiline
              rows={3}
              required
              error={!!getFieldError('description')}
              helperText={getFieldError('description')}
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
            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingTopic ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
