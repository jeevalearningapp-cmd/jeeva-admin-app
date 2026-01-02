import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { PracticeModuleTopicSelector } from './PracticeModuleTopicSelector'
import { PracticeQuestionList } from './PracticeQuestionList'
import { PracticeQuestionForm } from './PracticeQuestionForm'
import { PracticeQuestionBulkImport } from './PracticeQuestionBulkImport'
import { supabase } from '@/lib/supabase'

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

export const PracticeModuleManager: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('')
  const [tabValue, setTabValue] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSelectionChange = (category: string, subdivision: string) => {
    setSelectedCategory(category)
    setSelectedSubdivision(subdivision)
    setTabValue(0) // Reset to questions tab
  }

  const handleCreateQuestion = () => {
    setEditingQuestion(null)
    setFormOpen(true)
  }

  const handleEditQuestion = async (question: any) => {
    // Fetch full question with options
    const { data, error } = await supabase
      .from('practice_questions')
      .select(`
        *,
        practice_question_options (
          id,
          option_text,
          is_correct,
          display_order
        )
      `)
      .eq('id', question.id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return
    }

    setEditingQuestion({
      ...data,
      options: data.practice_question_options
    })
    setFormOpen(true)
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!questionToDelete) return

    try {
      const { error } = await supabase
        .from('practice_questions')
        .delete()
        .eq('id', questionToDelete)

      if (error) throw error

      setRefreshTrigger(prev => prev + 1)
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    } catch (err) {
      console.error('Error deleting question:', err)
    }
  }

  const handleFormSave = () => {
    setFormOpen(false)
    setEditingQuestion(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Practice Module Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage practice questions for Numeracy and Clinical Knowledge topics
        </Typography>
      </Box>

      {/* Topic Selector */}
      <Box sx={{ mb: 3 }}>
        <PracticeModuleTopicSelector
          onSelectionChange={handleSelectionChange}
          selectedCategory={selectedCategory}
          selectedSubdivision={selectedSubdivision}
        />
      </Box>

      {/* Content Area - Only show when subdivision is selected */}
      {selectedCategory && selectedSubdivision && (
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Questions" />
            <Tab label="Bulk Import" />
          </Tabs>

          {/* Questions Tab */}
          <TabPanel value={tabValue} index={0}>
            <PracticeQuestionList
              category={selectedCategory}
              subdivision={selectedSubdivision}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
              onCreate={handleCreateQuestion}
              refreshTrigger={refreshTrigger}
            />
          </TabPanel>

          {/* Bulk Import Tab */}
          <TabPanel value={tabValue} index={1}>
            <PracticeQuestionBulkImport
              category={selectedCategory}
              subdivision={selectedSubdivision}
              onImportComplete={handleImportComplete}
            />
          </TabPanel>
        </Paper>
      )}

      {/* Question Form Dialog */}
      <PracticeQuestionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingQuestion(null)
        }}
        onSave={handleFormSave}
        category={selectedCategory}
        subdivision={selectedSubdivision}
        question={editingQuestion}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
