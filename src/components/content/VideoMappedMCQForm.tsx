import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Typography,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Divider,
} from '@mui/material'
import { DeleteOutlined, AddOutlined, ImageOutlined } from '@mui/icons-material'
import { Subtopic } from '@/api/subtopics'
import { learningQuestionsAPI, LearningQuestion } from '@/api/learningQuestions'
import { useSnackbar } from 'notistack'

interface VideoMappedMCQFormProps {
  open: boolean
  onClose: () => void
  subtopic: Subtopic
  editingQuestion?: LearningQuestion | null
  onSuccess: () => void
}

interface QuestionOption {
  optionText: string
  isCorrect: boolean
  displayOrder: number
}

export const VideoMappedMCQForm: React.FC<VideoMappedMCQFormProps> = ({
  open,
  onClose,
  subtopic,
  editingQuestion,
  onSuccess,
}) => {
  const [questionText, setQuestionText] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [explanation, setExplanation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [options, setOptions] = useState<QuestionOption[]>([
    { optionText: '', isCorrect: false, displayOrder: 0 },
    { optionText: '', isCorrect: false, displayOrder: 1 },
    { optionText: '', isCorrect: false, displayOrder: 2 },
    { optionText: '', isCorrect: false, displayOrder: 3 },
  ])
  const [touched, setTouched] = useState({ questionText: false })
  const [submitError, setSubmitError] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.questionText)
      setDifficulty(editingQuestion.difficulty)
      setExplanation(editingQuestion.explanation || '')
      setImageUrl(editingQuestion.imageUrl || '')
      setIsActive(editingQuestion.isActive)
      if (editingQuestion.options && editingQuestion.options.length > 0) {
        setOptions(
          editingQuestion.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            displayOrder: opt.displayOrder,
          }))
        )
      }
    } else {
      // Reset form
      setQuestionText('')
      setDifficulty('medium')
      setExplanation('')
      setImageUrl('')
      setIsActive(true)
      setOptions([
        { optionText: '', isCorrect: false, displayOrder: 0 },
        { optionText: '', isCorrect: false, displayOrder: 1 },
        { optionText: '', isCorrect: false, displayOrder: 2 },
        { optionText: '', isCorrect: false, displayOrder: 3 },
      ])
    }
    setTouched({ questionText: false })
    setSubmitError('')
  }, [editingQuestion, open])

  const validate = () => {
    if (!questionText.trim()) return false
    if (options.length < 2) return false
    if (!options.some((opt) => opt.isCorrect)) return false
    if (options.some((opt) => !opt.optionText.trim())) return false
    return true
  }

  const handleSubmit = async () => {
    setTouched({ questionText: true })
    if (!validate()) {
      setSubmitError('Please fill in all required fields and select a correct answer')
      return
    }

    setSubmitError('')
    setIsSaving(true)

    try {
      if (editingQuestion) {
        // Update existing question
        await learningQuestionsAPI.update(editingQuestion.id, {
          questionText,
          difficulty,
          explanation,
          imageUrl,
          isActive,
        })
        // Update options
        await learningQuestionsAPI.updateOptions(editingQuestion.id, options)
        enqueueSnackbar('Question updated successfully', { variant: 'success' })
      } else {
        // Create new question
        await learningQuestionsAPI.create({
          topicId: subtopic.topicId,
          subtopicId: subtopic.id,
          videoLessonId: subtopic.id,
          questionText,
          questionType: 'multiple_choice',
          difficulty,
          explanation,
          imageUrl,
          isActive,
          options,
        })
        enqueueSnackbar('Question created successfully', { variant: 'success' })
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.')
      enqueueSnackbar('Failed to save question', { variant: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([
        ...options,
        { optionText: '', isCorrect: false, displayOrder: options.length },
      ])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((_, i) => i !== index)
      // Reorder
      updatedOptions.forEach((opt, i) => {
        opt.displayOrder = i
      })
      setOptions(updatedOptions)
    }
  }

  const handleUpdateOption = (index: number, field: keyof QuestionOption, value: any) => {
    const updatedOptions = [...options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setOptions(updatedOptions)
  }

  const handleSetCorrectAnswer = (index: number) => {
    const updatedOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setOptions(updatedOptions)
  }

  const correctAnswerIndex = options.findIndex((opt) => opt.isCorrect)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingQuestion ? 'Edit Video-Mapped MCQ' : 'Add Video-Mapped MCQ'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          {/* Video Lesson Info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Mapped to:</strong> {subtopic.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This question will be shown after students watch this video lesson
            </Typography>
          </Alert>

          {/* Question Text */}
          <TextField
            label="Question Text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onBlur={() => setTouched({ ...touched, questionText: true })}
            fullWidth
            multiline
            rows={3}
            required
            error={touched.questionText && !questionText.trim()}
            helperText={
              touched.questionText && !questionText.trim()
                ? 'Question text is required'
                : ''
            }
          />

          {/* Difficulty */}
          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              label="Difficulty"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          {/* Image URL */}
          <TextField
            label="Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            placeholder="https://example.com/image.jpg"
            InputProps={{
              startAdornment: <ImageOutlined sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />

          <Divider />

          {/* Options */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">
                Answer Options (Select the correct answer)
              </Typography>
              <Button
                size="small"
                startIcon={<AddOutlined />}
                onClick={handleAddOption}
                disabled={options.length >= 6}
              >
                Add Option
              </Button>
            </Box>

            <RadioGroup value={correctAnswerIndex} onChange={(e) => handleSetCorrectAnswer(parseInt(e.target.value))}>
              {options.map((option, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: option.isCorrect ? 'success.main' : '#E5E7EB',
                    bgcolor: option.isCorrect ? 'success.lighter' : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <FormControlLabel
                      value={index}
                      control={<Radio />}
                      label=""
                      sx={{ m: 0 }}
                    />
                    <TextField
                      value={option.optionText}
                      onChange={(e) =>
                        handleUpdateOption(index, 'optionText', e.target.value)
                      }
                      fullWidth
                      placeholder={`Option ${index + 1}`}
                      size="small"
                      required
                      error={!option.optionText.trim()}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= 2}
                      color="error"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </RadioGroup>

            {correctAnswerIndex === -1 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Please select the correct answer
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Explanation */}
          <TextField
            label="Explanation (Optional)"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Explain why the correct answer is correct"
          />

          {/* Active Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving} sx={{ borderRadius: '12px' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!validate() || isSaving}
          sx={{ borderRadius: '12px' }}
        >
          {isSaving ? 'Saving...' : editingQuestion ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
