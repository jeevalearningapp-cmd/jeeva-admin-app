import React from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  Chip,
} from '@mui/material'
import {
  SaveOutlined,
  SettingsOutlined,
  EmailOutlined,
  NotificationsOutlined,
  SecurityOutlined,
} from '@mui/icons-material'

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

export const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0)
  const [settings, setSettings] = React.useState({
    // General Settings
    siteName: 'Jeeva Learning Platform',
    siteDescription: 'Comprehensive learning management system for students',
    contactEmail: 'contact@jeeva.com',
    supportEmail: 'support@jeeva.com',
    
    // Feature Toggles
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    
    // File Upload Settings
    maxFileUploadSize: 5, // MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    
    // Security Settings
    sessionTimeout: 60, // minutes
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    newUserSignup: true,
    contentSubmitted: true,
    contentApproved: true,
    contentRejected: true,
    subscriptionExpiring: true,
    subscriptionRenewed: true,
  })

  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value: string | boolean | number
    
    if (event.target.type === 'checkbox') {
      value = event.target.checked
    } else if (event.target.type === 'number') {
      value = parseFloat(event.target.value) || 0
    } else {
      value = event.target.value
    }
    
    setSettings({ ...settings, [field]: value })
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // TODO: Implement actual save to Supabase app_settings table
    console.log('Saving settings:', settings)
    
    setIsSaving(false)
    setSaveSuccess(true)
    
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Platform Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{ borderRadius: '12px' }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper sx={{ borderRadius: '16px' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<SettingsOutlined />} label="General" />
          <Tab icon={<SecurityOutlined />} label="Security" />
          <Tab icon={<NotificationsOutlined />} label="Notifications" />
          <Tab icon={<EmailOutlined />} label="Email Templates" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Site Name"
              value={settings.siteName}
              onChange={handleChange('siteName')}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <TextField
              label="Site Description"
              value={settings.siteDescription}
              onChange={handleChange('siteDescription')}
              fullWidth
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Contact Email"
                value={settings.contactEmail}
                onChange={handleChange('contactEmail')}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Support Email"
                value={settings.supportEmail}
                onChange={handleChange('supportEmail')}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Feature Toggles
            </Typography>
            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={handleChange('maintenanceMode')}
                />
              }
              label="Maintenance Mode (disables user access)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.registrationEnabled}
                  onChange={handleChange('registrationEnabled')}
                />
              }
              label="User Registration Enabled"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailVerificationRequired}
                  onChange={handleChange('emailVerificationRequired')}
                />
              }
              label="Email Verification Required"
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              File Upload Settings
            </Typography>
            <Divider />

            <TextField
              label="Max File Upload Size (MB)"
              type="number"
              value={settings.maxFileUploadSize}
              onChange={handleChange('maxFileUploadSize')}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allowed File Types
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {settings.allowedFileTypes.map((type) => (
                  <Chip key={type} label={type} size="small" />
                ))}
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Session Timeout (minutes)"
              type="number"
              value={settings.sessionTimeout}
              onChange={handleChange('sessionTimeout')}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Password Requirements
            </Typography>
            <Divider />

            <TextField
              label="Minimum Password Length"
              type="number"
              value={settings.passwordMinLength}
              onChange={handleChange('passwordMinLength')}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.passwordRequireUppercase}
                  onChange={handleChange('passwordRequireUppercase')}
                />
              }
              label="Require Uppercase Letters"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.passwordRequireLowercase}
                  onChange={handleChange('passwordRequireLowercase')}
                />
              }
              label="Require Lowercase Letters"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.passwordRequireNumbers}
                  onChange={handleChange('passwordRequireNumbers')}
                />
              }
              label="Require Numbers"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.passwordRequireSpecialChars}
                  onChange={handleChange('passwordRequireSpecialChars')}
                />
              }
              label="Require Special Characters"
            />
          </Box>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">
              Notification Channels
            </Typography>
            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={handleChange('pushNotifications')}
                />
              }
              label="Push Notifications"
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Event Notifications
            </Typography>
            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.newUserSignup}
                  onChange={handleChange('newUserSignup')}
                />
              }
              label="New User Signup"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.contentSubmitted}
                  onChange={handleChange('contentSubmitted')}
                />
              }
              label="Content Submitted for Approval"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.contentApproved}
                  onChange={handleChange('contentApproved')}
                />
              }
              label="Content Approved"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.contentRejected}
                  onChange={handleChange('contentRejected')}
                />
              }
              label="Content Rejected"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.subscriptionExpiring}
                  onChange={handleChange('subscriptionExpiring')}
                />
              }
              label="Subscription Expiring Soon"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.subscriptionRenewed}
                  onChange={handleChange('subscriptionRenewed')}
                />
              }
              label="Subscription Renewed"
            />
          </Box>
        </TabPanel>

        {/* Email Templates */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Email Templates
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Email template management coming soon. Configure templates for welcome emails, 
            password resets, content approvals, and subscription notifications.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  )
}
