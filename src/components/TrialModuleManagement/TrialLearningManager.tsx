import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material'
import { DeleteOutlined, EditOutlined, AddOutlined } from '@mui/icons-material'

interface LessonContent {
  id: string
  type: 'video' | 'audio' | 'text' | 'flashcard' | 'mcq' | 'assessment'
  title: string
  url?: string
  text?: string
  duration?: number
}

interface Lesson {
  id: string
  name: string
  unlockThreshold: number
  content: LessonContent[]
}

interface LearningManagerProps {
  onStatusChange: (status: 'idle' | 'loading' | 'success' | 'error') => void
}

export default function TrialLearningManager({ onStatusChange }: LearningManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: '1', name: 'Patient Safety Fundamentals', unlockThreshold: 60, content: [] },
    { id: '2', name: 'Infection Prevention & Control', unlockThreshold: 60, content: [] },
  ])
  const [selectedLessonId, setSelectedLessonId] = useState<string>('1')
  const [openContentDialog, setOpenContentDialog] = useState(false)
  const [contentFormData, setContentFormData] = useState({
    type: 'video' as LessonContent['type'],
    title: '',
    url: '',
    text: '',
    duration: 0,
  })

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId)

  const handleAddContent = async () => {
    onStatusChange('loading')
    try {
      const newContent: LessonContent = {
        id: Date.now().toString(),
        type: contentFormData.type,
        title: contentFormData.title,
        url: contentFormData.url,
        text: contentFormData.text,
        duration: contentFormData.duration,
      }

      setLessons(
        lessons.map((l) =>
          l.id === selectedLessonId
            ? { ...l, content: [...l.content, newContent] }
            : l
        )
      )

      setOpenContentDialog(false)
      setContentFormData({
        type: 'video',
        title: '',
        url: '',
        text: '',
        duration: 0,
      })
      onStatusChange('success')
    } catch (error) {
      onStatusChange('error')
    }
  }

  const handleDeleteContent = (contentId: string) => {
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId
          ? { ...l, content: l.content.filter((c) => c.id !== contentId) }
          : l
      )
    )
  }

  if (!selectedLesson) return null

  const contentCounts = {
    video: selectedLesson.content.filter((c) => c.type === 'video').length,
    audio: selectedLesson.content.filter((c) => c.type === 'audio').length,
    text: selectedLesson.content.filter((c) => c.type === 'text').length,
    flashcard: selectedLesson.content.filter((c) => c.type === 'flashcard').length,
    assessment: selectedLesson.content.filter((c) => c.type === 'assessment').length,
  }

  return (
    <Box>
      {/* Lesson Selection Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedLessonId}
          onChange={(e, value) => setSelectedLessonId(value)}
          aria-label="Trial learning lessons"
        >
          {lessons.map((lesson) => (
            <Tab
              key={lesson.id}
              label={lesson.name}
              value={lesson.id}
              id={`lesson-tab-${lesson.id}`}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Lesson Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {selectedLesson.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Unlock Threshold
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Box flex={1}>
                  <LinearProgress
                    variant="determinate"
                    value={selectedLesson.unlockThreshold}
                  />
                </Box>
                <Typography variant="body2">{selectedLesson.unlockThreshold}%</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content Type Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(
          ['video', 'audio', 'text', 'flashcard', 'assessment'] as const
        ).map((type) => (
          <Grid xs={12} sm={6} md={4} lg={2.4} key={type}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" variant="caption">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Typography>
                <Typography variant="h6">
                  {contentCounts[type]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Content Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setOpenContentDialog(true)}
        >
          Add Content
        </Button>
      </Box>

      {/* Content List */}
      <Paper>
        {selectedLesson.content.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No content added for this lesson. Click "Add Content" to get started.
            </Typography>
          </Box>
        ) : (
          <List>
            {selectedLesson.content.map((content, index) => (
              <React.Fragment key={content.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle2">{content.title}</Typography>
                        <Chip
                          label={content.type}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      content.duration
                        ? `Duration: ${content.duration} seconds`
                        : undefined
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteContent(content.id)}
                      title="Delete"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Add Content Dialog */}
      <Dialog open={openContentDialog} onClose={() => setOpenContentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Content</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={contentFormData.type}
              onChange={(e) =>
                setContentFormData({
                  ...contentFormData,
                  type: e.target.value as LessonContent['type'],
                })
              }
              label="Content Type"
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="flashcard">Flashcard</MenuItem>
              <MenuItem value="assessment">Assessment (MCQ)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Title"
            value={contentFormData.title}
            onChange={(e) =>
              setContentFormData({ ...contentFormData, title: e.target.value })
            }
            fullWidth
          />

          {(contentFormData.type === 'video' || contentFormData.type === 'audio') && (
            <>
              <TextField
                label="URL"
                value={contentFormData.url}
                onChange={(e) =>
                  setContentFormData({ ...contentFormData, url: e.target.value })
                }
                fullWidth
                placeholder="https://..."
              />
              <TextField
                label="Duration (seconds)"
                type="number"
                value={contentFormData.duration}
                onChange={(e) =>
                  setContentFormData({
                    ...contentFormData,
                    duration: parseInt(e.target.value),
                  })
                }
                fullWidth
              />
            </>
          )}

          {contentFormData.type === 'text' && (
            <TextField
              label="Content"
              multiline
              rows={4}
              value={contentFormData.text}
              onChange={(e) =>
                setContentFormData({ ...contentFormData, text: e.target.value })
              }
              fullWidth
            />
          )}

          {(contentFormData.type === 'flashcard' || contentFormData.type === 'assessment') && (
            <TextField
              label="Content (JSON format)"
              multiline
              rows={4}
              value={contentFormData.text}
              onChange={(e) =>
                setContentFormData({ ...contentFormData, text: e.target.value })
              }
              fullWidth
              placeholder='{"cards": [...]}'
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddContent} variant="contained">
            Add Content
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
