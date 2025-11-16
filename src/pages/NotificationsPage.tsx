import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material'
import {
  CampaignOutlined,
  EditNoteOutlined,
  AutoModeOutlined,
} from '@mui/icons-material'
import { ComposeTab } from '@/components/notifications/ComposeTab'
import { CampaignsTab } from '@/components/notifications/CampaignsTab'
import { AutomationTab } from '@/components/notifications/AutomationTab'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const NotificationsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Push Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send notifications to mobile app users
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 0 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<EditNoteOutlined />} label="Compose" />
          <Tab icon={<CampaignOutlined />} label="Campaigns" />
          <Tab icon={<AutoModeOutlined />} label="Automation" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ComposeTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CampaignsTab />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AutomationTab />
        </TabPanel>
      </Paper>
    </Box>
  )
}
