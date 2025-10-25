import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import YouTube from '@tiptap/extension-youtube'
import { Box, Button, ButtonGroup, Divider } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Write your lesson content here...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      YouTube.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addYouTube = () => {
    const url = window.prompt('Enter YouTube URL:')
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <ButtonGroup size="small" sx={{ mb: 0.5 }}>
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            variant={editor.isActive('bold') ? 'contained' : 'outlined'}
          >
            <FormatBold fontSize="small" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            variant={editor.isActive('italic') ? 'contained' : 'outlined'}
          >
            <FormatItalic fontSize="small" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleCode().run()}
            variant={editor.isActive('code') ? 'contained' : 'outlined'}
          >
            <Code fontSize="small" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: 'inline' }} />

        <ButtonGroup size="small" sx={{ mb: 0.5 }}>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
          >
            <FormatListBulleted fontSize="small" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
          >
            <FormatListNumbered fontSize="small" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            variant={editor.isActive('blockquote') ? 'contained' : 'outlined'}
          >
            <FormatQuote fontSize="small" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: 'inline' }} />

        <ButtonGroup size="small" sx={{ mb: 0.5 }}>
          <Button onClick={addLink}>
            <LinkIcon fontSize="small" />
          </Button>
          <Button onClick={addYouTube}>
            <YouTubeIcon fontSize="small" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: 'inline' }} />

        <ButtonGroup size="small" sx={{ mb: 0.5 }}>
          <Button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo fontSize="small" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo fontSize="small" />
          </Button>
        </ButtonGroup>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          p: 2,
          minHeight: '200px',
          '& .ProseMirror': {
            outline: 'none',
            minHeight: '150px',
            '& p.is-editor-empty:first-of-type::before': {
              color: '#adb5bd',
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
            '& h1': {
              fontSize: '2em',
              fontWeight: 'bold',
              marginTop: '0.67em',
              marginBottom: '0.67em',
            },
            '& h2': {
              fontSize: '1.5em',
              fontWeight: 'bold',
              marginTop: '0.83em',
              marginBottom: '0.83em',
            },
            '& h3': {
              fontSize: '1.17em',
              fontWeight: 'bold',
              marginTop: '1em',
              marginBottom: '1em',
            },
            '& ul, & ol': {
              paddingLeft: '1.5em',
              marginBottom: '1em',
            },
            '& blockquote': {
              borderLeft: '3px solid #ccc',
              paddingLeft: '1em',
              marginLeft: 0,
              fontStyle: 'italic',
            },
            '& code': {
              backgroundColor: '#f4f4f4',
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace',
            },
            '& a': {
              color: '#007aff',
              textDecoration: 'underline',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
}
