import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Alert,
  Chip
} from '@mui/material'
import {
  SchoolOutlined,
  QuizOutlined,
  TimerOutlined,
  SearchOutlined,
  AddOutlined,
  UploadFileOutlined
} from '@mui/icons-material'
import { 
  FIXED_MODULE_IDS,
  PRACTICE_CATEGORIES,
  NUMERACY_SUBDIVISIONS,
  CLINICAL_SUBDIVISIONS,
  LEARNING_TOPICS,
  ModuleType,
  ExamPart
} from '@/types/content'
import { QuestionManager, CSVBulkUpload, FlashcardManager, FlashcardCSVUpload } from '@/components/content'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export const ContentManagementPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleType>('practice')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedExamPart, setSelectedExamPart] = useState<'part_a' | 'part_b'>('part_a')
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const moduleOptions = [
    {
      value: 'practice' as ModuleType,
      label: 'Practice Module',
      icon: <QuizOutlined />,
      color: '#007aff',
      description: 'Topic-wise practice questions'
    },
    {
      value: 'learning' as ModuleType,
      label: 'Learning Module',
      icon: <SchoolOutlined />,
      color: '#34C759',
      description: 'Structured lessons with multimedia'
    },
    {
      value: 'mock_exam' as ModuleType,
      label: 'Mock Exams',
      icon: <TimerOutlined />,
      color: '#FF9500',
      description: 'Full exam simulator'
    }
  ]

  const selectedModuleInfo = moduleOptions.find(m => m.value === selectedModule)

  const getSubdivisions = () => {
    if (selectedCategory === PRACTICE_CATEGORIES.NUMERACY) {
      return NUMERACY_SUBDIVISIONS
    } else if (selectedCategory === PRACTICE_CATEGORIES.CLINICAL_KNOWLEDGE) {
      return CLINICAL_SUBDIVISIONS
    }
    return []
  }

  const handleModuleChange = (module: ModuleType) => {
    setSelectedModule(module)
    setSelectedCategory('')
    setSelectedSubdivision('')
    setSelectedTopic('')
    setTabValue(0)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Content Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage questions and content for NMC CBT exam preparation
        </Typography>
      </Box>

      {/* Module Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Module
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose the module you want to manage
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {moduleOptions.map((module) => (
            <Paper
              key={module.value}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: 2,
                borderColor: selectedModule === module.value ? module.color : 'transparent',
                bgcolor: selectedModule === module.value ? `${module.color}08` : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: module.color,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
              onClick={() => handleModuleChange(module.value)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ color: module.color, mr: 1.5 }}>
                  {module.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {module.label}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* Category/Topic Selectors */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${selectedModuleInfo?.color}15`,
              color: selectedModuleInfo?.color,
              mr: 2
            }}
          >
            {selectedModuleInfo?.icon}
          </Box>
          <Box>
            <Typography variant="h6">
              {selectedModuleInfo?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedModuleInfo?.description}
            </Typography>
          </Box>
        </Box>

        {/* Practice Module Selectors */}
        {selectedModule === 'practice' && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedSubdivision('')
                }}
                label="Category"
              >
                <MenuItem value={PRACTICE_CATEGORIES.NUMERACY}>
                  {PRACTICE_CATEGORIES.NUMERACY}
                </MenuItem>
                <MenuItem value={PRACTICE_CATEGORIES.CLINICAL_KNOWLEDGE}>
                  {PRACTICE_CATEGORIES.CLINICAL_KNOWLEDGE}
                </MenuItem>
              </Select>
            </FormControl>

            {selectedCategory && (
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel>Subdivision</InputLabel>
                <Select
                  value={selectedSubdivision}
                  onChange={(e) => setSelectedSubdivision(e.target.value)}
                  label="Subdivision"
                >
                  {getSubdivisions().map((subdivision) => (
                    <MenuItem key={subdivision} value={subdivision}>
                      {subdivision}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Learning Module Selector */}
        {selectedModule === 'learning' && (
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Topic</InputLabel>
            <Select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              label="Topic"
            >
              {LEARNING_TOPICS.map((topic) => (
                <MenuItem key={topic} value={topic}>
                  {topic}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Mock Exam Selector */}
        {selectedModule === 'mock_exam' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label="Part A: Numeracy (15 questions, 30 min)"
              onClick={() => setSelectedExamPart('part_a')}
              color={selectedExamPart === 'part_a' ? 'primary' : 'default'}
              sx={{ px: 2, py: 3 }}
            />
            <Chip
              label="Part B: Clinical (120 questions, 150 min)"
              onClick={() => setSelectedExamPart('part_b')}
              color={selectedExamPart === 'part_b' ? 'primary' : 'default'}
              sx={{ px: 2, py: 3 }}
            />
          </Box>
        )}

        {/* Info Alert */}
        {selectedModule === 'practice' && !selectedCategory && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Select a category to start managing practice questions
          </Alert>
        )}
        {selectedModule === 'learning' && !selectedTopic && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Select a topic to manage lessons and associated questions
          </Alert>
        )}
      </Paper>

      {/* Content Tabs */}
      {((selectedModule === 'practice' && selectedSubdivision) ||
        (selectedModule === 'learning' && selectedTopic) ||
        (selectedModule === 'mock_exam')) && (
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Questions" />
            {selectedModule === 'learning' && <Tab label="Flashcards" />}
            {selectedModule === 'learning' && <Tab label="Lessons" />}
            <Tab label="Bulk Upload" />
          </Tabs>

          {/* Questions Tab */}
          <TabPanel value={tabValue} index={0}>
            <QuestionManager
              moduleType={selectedModule}
              category={selectedCategory}
              subdivision={selectedSubdivision}
              examPart={selectedModule === 'mock_exam' ? selectedExamPart : undefined}
            />
          </TabPanel>

          {/* Flashcards Tab (Learning Module only) */}
          {selectedModule === 'learning' && (
            <TabPanel value={tabValue} index={1}>
              <FlashcardManager
                category={selectedTopic}
              />
              <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                <FlashcardCSVUpload category={selectedTopic} />
              </Box>
            </TabPanel>
          )}

          {/* Lessons Tab (Learning Module only) */}
          {selectedModule === 'learning' && (
            <TabPanel value={tabValue} index={2}>
              <Alert severity="info">
                Lesson management (video URL, audio URL, text content) will be here
              </Alert>
            </TabPanel>
          )}

          {/* Bulk Upload Tab */}
          <TabPanel value={tabValue} index={selectedModule === 'learning' ? 3 : 1}>
            <CSVBulkUpload
              moduleType={selectedModule}
              category={selectedCategory}
              subdivision={selectedSubdivision}
              examPart={selectedModule === 'mock_exam' ? selectedExamPart : undefined}
            />
          </TabPanel>
        </Paper>
      )}
    </Box>
  )
}
