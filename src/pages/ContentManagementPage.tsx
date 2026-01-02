import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Chip
} from '@mui/material'
import {
  SchoolOutlined,
  QuizOutlined,
  TimerOutlined
} from '@mui/icons-material'
import { LearningModuleManagementPage } from './LearningModuleManagementPage'
import { PracticeModuleManagement } from '@/components/content/PracticeModuleManagement'
import { MockExamManagement } from '@/components/content/MockExamManagement'

type ModuleType = 'learning' | 'practice' | 'mock_exam'

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
  const [selectedModule, setSelectedModule] = useState<ModuleType>('learning')

  const moduleOptions = [
    {
      value: 'learning' as ModuleType,
      label: 'Learning Module',
      icon: <SchoolOutlined />,
      color: '#34C759',
      description: 'Manage topics with Core Notes, Flash Content, and Subtopics (Video, Podcast, MCQs)'
    },
    {
      value: 'practice' as ModuleType,
      label: 'Practice Module',
      icon: <QuizOutlined />,
      color: '#007aff',
      description: 'Topic-wise practice questions organized by category and subdivision'
    },
    {
      value: 'mock_exam' as ModuleType,
      label: 'Mock Exams',
      icon: <TimerOutlined />,
      color: '#FF9500',
      description: 'Full exam simulator with Part A (Numeracy) and Part B (Clinical)'
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Content Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all content for NMC CBT exam preparation
        </Typography>
      </Box>

      {/* Module Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Module Type
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose the module you want to manage
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2
          }}
        >
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
              onClick={() => setSelectedModule(module.value)}
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

      {/* Module Content */}
      <Box>
        {selectedModule === 'learning' && <LearningModuleManagementPage />}
        {selectedModule === 'practice' && <PracticeModuleManagement />}
        {selectedModule === 'mock_exam' && <MockExamManagement />}
      </Box>
    </Box>
  )
}

export default ContentManagementPage
