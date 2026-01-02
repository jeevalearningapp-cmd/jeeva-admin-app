import React, { useState, useEffect } from 'react'
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Subtopic } from '@/api/subtopics'
import { lessonContentAPI, LessonContent } from '@/api/lessonContent'
import { useSnackbar } from 'notistack'

interface LessonTextTabProps {
    subtopic: Subtopic
    onUpdate: () => void
}

export const LessonTextTab: React.FC<LessonTextTabProps> = ({ subtopic, onUpdate }) => {
    const [content, setContent] = useState<LessonContent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string>('')
    const { enqueueSnackbar } = useSnackbar()

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: 'Write the lesson content here...' }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            // Content updated
        },
    })

    useEffect(() => {
        loadContent()
    }, [subtopic.id])

    // Sync editor content when loaded
    useEffect(() => {
        if (editor && content?.contentText) {
            // Only set content if editor is empty or just loaded to avoid overwriting user
            if (editor.isEmpty) {
                editor.commands.setContent(content.contentText)
            }
        }
    }, [content, editor])

    const loadContent = async () => {
        try {
            setIsLoading(true)
            const data = await lessonContentAPI.getByType(subtopic.id, 'text')
            setContent(data)
            if (editor && data?.contentText) {
                editor.commands.setContent(data.contentText)
            }
        } catch (err: any) {
            console.error('Failed to load text content:', err)
            setError('Failed to load content')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!editor) return

        try {
            setIsSaving(true)
            setError('')
            const html = editor.getHTML()

            await lessonContentAPI.upsert(subtopic.id, 'text', {
                title: 'Core Readable Lesson',
                contentText: html,
                isActive: true
            })

            enqueueSnackbar('Lesson content saved successfully', { variant: 'success' })
            onUpdate()
        } catch (err: any) {
            setError(err.message || 'Failed to save content')
            enqueueSnackbar('Failed to save content', { variant: 'error' })
        } finally {
            setIsSaving(false)
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Core Readable Lesson
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Edit the text content for this lesson
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveOutlined />}
                    onClick={handleSave}
                    disabled={isSaving}
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

            <Paper sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
                <Box
                    sx={{
                        minHeight: 300,
                        '& .ProseMirror': {
                            minHeight: 300,
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
            </Paper>
        </Box>
    )
}
