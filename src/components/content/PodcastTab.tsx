import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import {
  SaveOutlined,
  PodcastsOutlined,
  CloudUploadOutlined,
} from '@mui/icons-material'
import { Subtopic } from '@/api/subtopics'
import { subtopicsAPI } from '@/api/subtopics'
import { lessonContentAPI } from '@/api/lessonContent'
import { useSnackbar } from 'notistack'

interface PodcastTabProps {
  subtopic: Subtopic
  onUpdate: () => void
}

export const PodcastTab: React.FC<PodcastTabProps> = ({ subtopic, onUpdate }) => {
  const [podcastUrl, setPodcastUrl] = useState(subtopic.podcastUrl || '')
  const [duration, setDuration] = useState(subtopic.duration || 0)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const { enqueueSnackbar } = useSnackbar()

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')

      // Update main lesson (subtopic)
      await subtopicsAPI.update(subtopic.id, {
        podcastUrl,
        duration,
        contentType: 'audio',
      })

      // Update or create audio content record
      await lessonContentAPI.upsert(subtopic.id, 'audio', {
        title: 'Podcast',
        contentUrl: podcastUrl,
        durationSeconds: duration,
        isActive: true
      })

      enqueueSnackbar('Podcast saved successfully', { variant: 'success' })
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to save podcast')
      enqueueSnackbar('Failed to save podcast', { variant: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const isValidUrl = (url: string) => {
    if (!url) return true // Optional field
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Podcast (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add an optional audio podcast for this subtopic
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={isSaving || !isValidUrl(podcastUrl)}
          sx={{ borderRadius: '12px' }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Podcasts are optional. They provide an alternative learning format for students who prefer audio content.
      </Alert>

      {/* Podcast URL Field */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <Typography variant="subtitle2" gutterBottom>
          Podcast URL
        </Typography>
        <TextField
          value={podcastUrl}
          onChange={(e) => setPodcastUrl(e.target.value)}
          fullWidth
          placeholder="https://example.com/podcast.mp3"
          helperText="Enter a direct audio URL (MP3, WAV, etc.)"
          InputProps={{
            startAdornment: <PodcastsOutlined sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ mb: 2 }}
        />

        {/* Duration Field */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Duration (seconds)
        </Typography>
        <TextField
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
          fullWidth
          placeholder="e.g., 1080 for 18 minutes"
          helperText={duration > 0 ? `Duration: ${formatDuration(duration)}` : 'Enter duration in seconds'}
        />
      </Paper>

      {/* Audio Preview */}
      {isValidUrl(podcastUrl) && podcastUrl && (
        <Paper sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
          <Typography variant="subtitle2" gutterBottom>
            Audio Preview
          </Typography>
          <Box
            component="audio"
            controls
            src={podcastUrl}
            sx={{
              width: '100%',
              borderRadius: '8px',
            }}
          >
            Your browser does not support the audio element.
          </Box>
        </Paper>
      )}

      {/* Upload Instructions */}
      {!podcastUrl && (
        <Paper sx={{ p: 3, border: '1px dashed #E5E7EB', borderRadius: '16px', textAlign: 'center' }}>
          <CloudUploadOutlined sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No podcast uploaded yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload your audio file to a hosting service (AWS S3, Cloudinary, etc.) and paste the URL above
          </Typography>
        </Paper>
      )}

      {/* Status Indicator */}
      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        {podcastUrl ? (
          <Chip
            icon={<PodcastsOutlined />}
            label="Podcast Added"
            color="info"
            variant="outlined"
          />
        ) : (
          <Chip
            icon={<PodcastsOutlined />}
            label="No Podcast"
            color="default"
            variant="outlined"
          />
        )}
        <Chip label="Optional" color="default" size="small" />
      </Box>
    </Box>
  )
}
