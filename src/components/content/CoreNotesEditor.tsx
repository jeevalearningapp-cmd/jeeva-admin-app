import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Alert,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  SaveOutlined,
  AddOutlined,
  DeleteOutlined,
  ArrowUpwardOutlined,
  ArrowDownwardOutlined,
} from '@mui/icons-material'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { coreNotesAPI, CoreNoteSection, TopicCoreNotes } from '@/api/coreNotes'
import { useSnackbar } from 'notistack'

interface CoreNotesEditorProps {
  topicId: string
}

export const CoreNotesEditor: React.FC<CoreNotesEditorProps> = ({ topicId }) => {
  const [coreNotes, setCoreNotes] = useState<TopicCoreNotes | null>(null)
  const [sections, setSections] = useState<CoreNoteSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  // Load core notes
  useEffect(() => {
    loadCoreNotes()
  }, [topicId])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const timer = setTimeout(() => {
      if (coreNotes) {
        handleSave(true) // Silent auto-save
      }
    }, 30000)

    setAutoSaveTimer(timer)

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [sections])

  const loadCoreNotes = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await coreNotesAPI.getByTopicId(topicId)
      setCoreNotes(data)
      if (data) {
        setSections(data.sections || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load core notes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (silent = false) => {
    try {
      setIsSaving(true)
      setError('')

      if (coreNotes) {
        // Update existing
        await coreNotesAPI.update(topicId, {
          sections,
        })
      } else {
        // Create new
        const newCoreNotes = await coreNotesAPI.create({
          topicId,
          sections,
        })
        setCoreNotes(newCoreNotes)
      }

      setLastSaved(new Date())
      if (!silent) {
        enqueueSnackbar('Core notes saved successfully', { variant: 'success' })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save core notes')
      if (!silent) {
        enqueueSnackbar('Failed to save core notes', { variant: 'error' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSection = () => {
    const newSection: CoreNoteSection = {
      title: `Section ${sections.length + 1}`,
      content: '',
      order: sections.length,
    }
    setSections([...sections, newSection])
  }

  const handleUpdateSection = (index: number, updates: Partial<CoreNoteSection>) => {
    const updatedSections = [...sections]
    updatedSections[index] = { ...updatedSections[index], ...updates }
    setSections(updatedSections)
  }

  const handleDeleteSection = (index: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      const updatedSections = sections.filter((_, i) => i !== index)
      // Reorder remaining sections
      updatedSections.forEach((section, i) => {
        section.order = i
      })
      setSections(updatedSections)
    }
  }

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return
    }

    const updatedSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[updatedSections[index], updatedSections[targetIndex]] = [
      updatedSections[targetIndex],
      updatedSections[index],
    ]

    // Update order
    updatedSections.forEach((section, i) => {
      section.order = i
    })

    setSections(updatedSections)
  }

  const getTotalWordCount = () => {
    return sections.reduce((total, section) => {
      const text = section.content.replace(/<[^>]*>/g, '') // Strip HTML tags
      const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
      return total + words.length
    }, 0)
  }

  const getTotalCharCount = () => {
    return sections.reduce((total, section) => {
      const text = section.content.replace(/<[^>]*>/g, '') // Strip HTML tags
      return total + text.length
    }, 0)
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
            Core Notes Editor
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${sections.length} sections`} size="small" />
            <Chip label={`${getTotalWordCount()} words`} size="small" />
            <Chip label={`${getTotalCharCount()} characters`} size="small" />
            {lastSaved && (
              <Typography variant="caption" color="text.secondary">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddOutlined />}
            onClick={handleAddSection}
            sx={{ borderRadius: '12px' }}
          >
            Add Section
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            onClick={() => handleSave(false)}
            disabled={isSaving}
            sx={{ borderRadius: '12px' }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No sections yet. Click "Add Section" to create one.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((section, index) => (
            <SectionEditor
              key={index}
              section={section}
              index={index}
              onUpdate={(updates) => handleUpdateSection(index, updates)}
              onDelete={() => handleDeleteSection(index)}
              onMoveUp={() => handleMoveSection(index, 'up')}
              onMoveDown={() => handleMoveSection(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < sections.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

interface SectionEditorProps {
  section: CoreNoteSection
  index: number
  onUpdate: (updates: Partial<CoreNoteSection>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your content here...',
      }),
    ],
    content: section.content,
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getHTML() })
    },
  })

  const getWordCount = () => {
    if (!editor) return 0
    const text = editor.getText()
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
    return words.length
  }

  return (
    <Paper sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          variant="standard"
          placeholder="Section Title"
          sx={{ flex: 1, mr: 2 }}
          InputProps={{
            sx: { fontSize: '1.1rem', fontWeight: 500 },
          }}
        />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={onMoveUp} disabled={!canMoveUp}>
            <ArrowUpwardOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onMoveDown} disabled={!canMoveDown}>
            <ArrowDownwardOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Rich Text Editor */}
      <Box
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          minHeight: 200,
          '& .ProseMirror': {
            padding: 2,
            minHeight: 200,
            outline: 'none',
            '& p.is-editor-empty:first-child::before': {
              color: '#adb5bd',
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Word Count */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="text.secondary">
          {getWordCount()} words
        </Typography>
      </Box>
    </Paper>
  )
}
