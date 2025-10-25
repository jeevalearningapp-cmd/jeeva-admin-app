import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material'
import { UploadFileOutlined, DownloadOutlined, CheckCircleOutlined } from '@mui/icons-material'
import { ModuleType, ExamPart, CreateQuestionInput } from '@/types/content'
import { useBulkCreateQuestions } from '@/hooks/useQuestions'

interface CSVBulkUploadProps {
  moduleType: ModuleType
  category?: string
  subdivision?: string
  examPart?: ExamPart
}

interface ParsedQuestion {
  questionText: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctOption: number
  imageUrl?: string
}

export const CSVBulkUpload: React.FC<CSVBulkUploadProps> = ({
  moduleType,
  category,
  subdivision,
  examPart
}) => {
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const bulkCreateMutation = useBulkCreateQuestions()

  const getTemplateFilename = () => {
    if (moduleType === 'practice') {
      return `practice_questions_template.csv`
    } else if (moduleType === 'learning') {
      return `learning_questions_template.csv`
    } else {
      return `mock_exam_questions_template.csv`
    }
  }

  const handleDownloadTemplate = () => {
    const filename = getTemplateFilename()
    const templatePath = `/csv-templates/${filename}`
    const link = document.createElement('a')
    link.href = templatePath
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (text: string): ParsedQuestion[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing data')
    }

    const headers = lines[0].split(',').map(h => h.trim())
    const questions: ParsedQuestion[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length < 8) {
        console.warn(`Skipping row ${i + 1}: insufficient columns`)
        continue
      }

      const correctOption = parseInt(values[7])
      if (isNaN(correctOption) || correctOption < 1 || correctOption > 4) {
        console.warn(`Skipping row ${i + 1}: invalid correct option`)
        continue
      }

      questions.push({
        questionText: values[0],
        difficulty: (values[1] || 'medium') as 'easy' | 'medium' | 'hard',
        explanation: values[2],
        option1: values[3],
        option2: values[4],
        option3: values[5],
        option4: values[6],
        correctOption,
        imageUrl: values[8] || undefined
      })
    }

    return questions
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setParsedQuestions([])
    setSuccess(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const questions = parseCSV(text)
        
        if (questions.length === 0) {
          setError('No valid questions found in CSV file')
          return
        }

        setParsedQuestions(questions)
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (parsedQuestions.length === 0) return

    try {
      const questionInputs: CreateQuestionInput[] = parsedQuestions.map(q => ({
        questionText: q.questionText,
        questionType: 'multiple_choice',
        difficulty: q.difficulty,
        points: 1,
        explanation: q.explanation,
        imageUrl: q.imageUrl,
        isActive: true,
        moduleType,
        category,
        subdivision,
        examPart,
        options: [
          { optionText: q.option1, isCorrect: q.correctOption === 1, displayOrder: 0 },
          { optionText: q.option2, isCorrect: q.correctOption === 2, displayOrder: 1 },
          { optionText: q.option3, isCorrect: q.correctOption === 3, displayOrder: 2 },
          { optionText: q.option4, isCorrect: q.correctOption === 4, displayOrder: 3 }
        ]
      }))

      await bulkCreateMutation.mutateAsync(questionInputs)
      setSuccess(true)
      setParsedQuestions([])
    } catch (err: any) {
      setError(err.message || 'Failed to upload questions')
    }
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <UploadFileOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Bulk Upload Questions via CSV
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Download the CSV template, fill it with questions, and upload to add multiple questions at once
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
          >
            Download CSV Template
          </Button>
          <Button 
            variant="contained" 
            component="label"
            startIcon={<UploadFileOutlined />}
          >
            Upload CSV File
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircleOutlined />} sx={{ mb: 2, textAlign: 'left' }}>
            Questions uploaded successfully!
          </Alert>
        )}

        {parsedQuestions.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom textAlign="left">
              Preview: {parsedQuestions.length} Questions Found
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Options</TableCell>
                    <TableCell>Correct</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedQuestions.map((q, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {q.questionText.substring(0, 100)}
                        {q.questionText.length > 100 && '...'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={q.difficulty} 
                          size="small"
                          color={
                            q.difficulty === 'easy' ? 'success' :
                            q.difficulty === 'hard' ? 'error' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>4 options</TableCell>
                      <TableCell>Option {q.correctOption}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {bulkCreateMutation.isPending && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Uploading questions...
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setParsedQuestions([])}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpload}
                disabled={bulkCreateMutation.isPending}
              >
                Upload {parsedQuestions.length} Questions
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
