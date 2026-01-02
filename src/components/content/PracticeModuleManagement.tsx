import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert
} from '@mui/material'
import {
  PRACTICE_CATEGORIES,
  NUMERACY_SUBDIVISIONS,
  CLINICAL_SUBDIVISIONS
} from '@/types/content'
import { PracticeQuestionManager, PracticeCSVBulkUpload } from '@/components/content'

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

export const PracticeModuleManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('')
  const [tabValue, setTabValue] = useState(0)

  const getSubdivisions = () => {
    if (selectedCategory === PRACTICE_CATEGORIES.NUMERACY) {
      return NUMERACY_SUBDIVISIONS
    } else if (selectedCategory === PRACTICE_CATEGORIES.CLINICAL_KNOWLEDGE) {
      return CLINICAL_SUBDIVISIONS
    }
    return []
  }

  return (
    <Box>
      {/* Category/Subdivision Selectors */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Practice Category
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose category and subdivision to manage practice questions
        </Typography>

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

        {!selectedCategory && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Select a category to start managing practice questions
          </Alert>
        )}
      </Paper>

      {/* Content Tabs */}
      {selectedSubdivision && (
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Questions" />
            <Tab label="Bulk Upload" />
          </Tabs>

          {/* Questions Tab */}
          <TabPanel value={tabValue} index={0}>
            <PracticeQuestionManager
              category={selectedCategory}
              subdivision={selectedSubdivision}
            />
          </TabPanel>

          {/* Bulk Upload Tab */}
          <TabPanel value={tabValue} index={1}>
            <PracticeCSVBulkUpload
              category={selectedCategory}
              subdivision={selectedSubdivision}
            />
          </TabPanel>
        </Paper>
      )}
    </Box>
  )
}
