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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material'
import { DeleteOutlined, EditOutlined, AddOutlined } from '@mui/icons-material'

interface Question {
  id: string
  type: 'numerical' | 'clinical'
  text: string
  category: string
  difficulty: 'easy' | 'medium'
  answer: string
  explanation: string
}

interface PracticeManagerProps {
  onStatusChange: (status: 'idle' | 'loading' | 'success' | 'error') => void
}

export default function TrialPracticeManager({ onStatusChange }: PracticeManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'numerical' as 'numerical' | 'clinical',
    text: '',
    category: '',
    difficulty: 'easy' as 'easy' | 'medium',
    answer: '',
    explanation: '',
  })

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setFormData({
        type: question.type,
        text: question.text,
        category: question.category,
        difficulty: question.difficulty,
        answer: question.answer,
        explanation: question.explanation,
      })
      setEditingId(question.id)
    } else {
      setFormData({
        type: 'numerical',
        text: '',
        category: '',
        difficulty: 'easy',
        answer: '',
        explanation: '',
      })
      setEditingId(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
  }

  const handleSaveQuestion = async () => {
    onStatusChange('loading')
    try {
      if (editingId) {
        // Update existing
        setQuestions(
          questions.map((q) =>
            q.id === editingId ? { ...q, ...formData } : q
          )
        )
      } else {
        // Add new
        const newQuestion: Question = {
          id: Date.now().toString(),
          ...formData,
        }
        setQuestions([...questions, newQuestion])
      }
      handleCloseDialog()
      onStatusChange('success')
    } catch (error) {
      onStatusChange('error')
    }
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const numericalCount = questions.filter((q) => q.type === 'numerical').length
  const clinicalCount = questions.filter((q) => q.type === 'clinical').length

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Numerical Questions
              </Typography>
              <Typography variant="h5">{numericalCount}/3</Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={(numericalCount / 3) * 100} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Clinical Questions
              </Typography>
              <Typography variant="h5">{clinicalCount}/3</Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={(clinicalCount / 3) * 100} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Questions
              </Typography>
              <Typography variant="h5">{questions.length}/6</Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={(questions.length / 6) * 100} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Time Limit
              </Typography>
              <Typography variant="h5">Unlimited</Typography>
              <Typography variant="caption" color="text.secondary">
                No time restriction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </Button>
      </Box>

      {/* Questions List */}
      <Paper>
        {questions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No questions added yet. Click "Add Question" to get started.</Typography>
          </Box>
        ) : (
          <List>
            {questions.map((question, index) => (
              <React.Fragment key={question.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1">{index + 1}. {question.text}</Typography>
                        <Chip
                          label={question.type === 'numerical' ? 'Numerical' : 'Clinical'}
                          size="small"
                          color={question.type === 'numerical' ? 'primary' : 'success'}
                          variant="outlined"
                        />
                        <Chip
                          label={question.difficulty}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Answer: {question.answer}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(question)}
                      title="Edit"
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteQuestion(question.id)}
                      title="Delete"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < questions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'numerical' | 'clinical' })}
              label="Question Type"
            >
              <MenuItem value="numerical">Numerical</MenuItem>
              <MenuItem value="clinical">Clinical</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Question Text"
            multiline
            rows={3}
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            fullWidth
          />

          <TextField
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            fullWidth
            placeholder="e.g., Dosage Calculations, Patient Safety"
          />

          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' })}
              label="Difficulty"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Correct Answer"
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            fullWidth
            placeholder="e.g., 10, B, True"
          />

          <TextField
            label="Explanation"
            multiline
            rows={4}
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            fullWidth
            placeholder="Detailed explanation including why correct and key concepts"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuestion} variant="contained">
            {editingId ? 'Update' : 'Add'} Question
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// LinearProgress component from MUI
import { LinearProgress } from '@mui/material'
