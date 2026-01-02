import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { QuizOutlined } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'

// Fixed Practice Module structure
const PRACTICE_TOPICS = {
  NUMERACY: {
    name: 'Numeracy',
    subdivisions: [
      'Dosage Calculations',
      'Unit Conversions',
      'IV Flow Rate Calculations',
      'Fluid Balance'
    ]
  },
  CLINICAL_KNOWLEDGE: {
    name: 'Clinical Knowledge',
    subdivisions: [
      'Medical-Surgical Nursing',
      'Pharmacology',
      'Infection Control',
      'Wound Care',
      'Palliative Care'
    ]
  }
}

interface PracticeModuleTopicSelectorProps {
  onSelectionChange: (category: string, subdivision: string) => void
  selectedCategory?: string
  selectedSubdivision?: string
}

interface QuestionCount {
  subdivision: string
  count: number
}

export const PracticeModuleTopicSelector: React.FC<PracticeModuleTopicSelectorProps> = ({
  onSelectionChange,
  selectedCategory,
  selectedSubdivision
}) => {
  const [activeTab, setActiveTab] = useState<number>(0)
  const [questionCounts, setQuestionCounts] = useState<Record<string, QuestionCount[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine active tab based on selected category
  useEffect(() => {
    if (selectedCategory === PRACTICE_TOPICS.NUMERACY.name) {
      setActiveTab(0)
    } else if (selectedCategory === PRACTICE_TOPICS.CLINICAL_KNOWLEDGE.name) {
      setActiveTab(1)
    }
  }, [selectedCategory])

  // Fetch question counts for all subdivisions
  useEffect(() => {
    fetchQuestionCounts()
  }, [])

  const fetchQuestionCounts = async () => {
    try {
      setLoading(true)
      setError(null)

      const counts: Record<string, QuestionCount[]> = {}

      // Fetch counts for Numeracy
      const numeracyCounts = await Promise.all(
        PRACTICE_TOPICS.NUMERACY.subdivisions.map(async (subdivision) => {
          const { count, error } = await supabase
            .from('practice_questions')
            .select('*', { count: 'exact', head: true })
            .eq('category', PRACTICE_TOPICS.NUMERACY.name)
            .eq('subdivision', subdivision)
            .eq('is_active', true)

          if (error) throw error
          return { subdivision, count: count || 0 }
        })
      )
      counts[PRACTICE_TOPICS.NUMERACY.name] = numeracyCounts

      // Fetch counts for Clinical Knowledge
      const clinicalCounts = await Promise.all(
        PRACTICE_TOPICS.CLINICAL_KNOWLEDGE.subdivisions.map(async (subdivision) => {
          const { count, error } = await supabase
            .from('practice_questions')
            .select('*', { count: 'exact', head: true })
            .eq('category', PRACTICE_TOPICS.CLINICAL_KNOWLEDGE.name)
            .eq('subdivision', subdivision)
            .eq('is_active', true)

          if (error) throw error
          return { subdivision, count: count || 0 }
        })
      )
      counts[PRACTICE_TOPICS.CLINICAL_KNOWLEDGE.name] = clinicalCounts

      setQuestionCounts(counts)
    } catch (err) {
      console.error('Error fetching question counts:', err)
      setError('Failed to load question counts')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    const category = newValue === 0 ? PRACTICE_TOPICS.NUMERACY.name : PRACTICE_TOPICS.CLINICAL_KNOWLEDGE.name
    // Clear subdivision selection when changing category
    onSelectionChange(category, '')
  }

  const handleSubdivisionClick = (category: string, subdivision: string) => {
    onSelectionChange(category, subdivision)
  }

  const getQuestionCount = (category: string, subdivision: string): number => {
    const counts = questionCounts[category]
    if (!counts) return 0
    const found = counts.find(c => c.subdivision === subdivision)
    return found?.count || 0
  }

  const getCurrentCategory = () => {
    return activeTab === 0 ? PRACTICE_TOPICS.NUMERACY : PRACTICE_TOPICS.CLINICAL_KNOWLEDGE
  }

  const currentCategory = getCurrentCategory()

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#007aff15',
            color: '#007aff',
            mr: 2
          }}
        >
          <QuizOutlined />
        </Box>
        <Box>
          <Typography variant="h6">
            Practice Module Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a topic and subtopic to manage practice questions
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Topic Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Numeracy" />
        <Tab label="Clinical Knowledge" />
      </Tabs>

      {/* Subdivision List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
          {currentCategory.subdivisions.map((subdivision) => {
            const count = getQuestionCount(currentCategory.name, subdivision)
            const isSelected = selectedCategory === currentCategory.name && selectedSubdivision === subdivision

            return (
              <ListItem
                key={subdivision}
                disablePadding
                sx={{
                  mb: 1,
                  '&:last-child': { mb: 0 }
                }}
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleSubdivisionClick(currentCategory.name, subdivision)}
                  sx={{
                    borderRadius: 1,
                    border: 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: isSelected ? 'primary.50' : 'action.hover'
                    }
                  }}
                >
                  <ListItemText
                    primary={subdivision}
                    secondary={`${count} question${count !== 1 ? 's' : ''}`}
                  />
                  <Chip
                    label={count}
                    size="small"
                    color={count > 0 ? 'primary' : 'default'}
                    sx={{ ml: 2 }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      )}

      {!loading && selectedCategory && selectedSubdivision && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Selected: <strong>{selectedCategory}</strong> → <strong>{selectedSubdivision}</strong>
        </Alert>
      )}
    </Paper>
  )
}
