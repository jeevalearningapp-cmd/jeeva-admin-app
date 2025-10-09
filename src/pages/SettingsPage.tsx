import React, { useEffect, useState } from 'react'
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
  CircularProgress,
} from '@mui/material'
import {
  SaveOutlined,
  SettingsOutlined,
  EmailOutlined,
  NotificationsOutlined,
  SecurityOutlined,
} from '@mui/icons-material'
import { useSettings } from '@/hooks/useSettings'
import type { UpdateSettingsInput } from '@/types'
import { validateSettings, getValidationErrorMessage, type SettingsValidationResult } from '@/utils/settingsValidation'

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
  const { settings: backendSettings, isLoading, updateSettings, isUpdating } = useSettings()
  const [validationResult, setValidationResult] = useState<SettingsValidationResult>({ isValid: true, errors: [] })
  
  const [localSettings, setLocalSettings] = React.useState<UpdateSettingsInput>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: 5,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    sessionTimeout: 60,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    emailNotifications: true,
    pushNotifications: false,
    newUserSignup: true,
    contentSubmitted: true,
    contentApproved: true,
    contentRejected: true,
    subscriptionExpiring: true,
    subscriptionRenewed: true,
  })

  // Sync backend settings to local state when loaded
  useEffect(() => {
    if (backendSettings) {
      setLocalSettings({
        siteName: backendSettings.siteName,
        siteDescription: backendSettings.siteDescription,
        contactEmail: backendSettings.contactEmail,
        supportEmail: backendSettings.supportEmail,
        maintenanceMode: backendSettings.maintenanceMode,
        registrationEnabled: backendSettings.registrationEnabled,
        emailVerificationRequired: backendSettings.emailVerificationRequired,
        maxFileUploadSize: backendSettings.maxFileUploadSize,
        allowedFileTypes: backendSettings.allowedFileTypes,
        sessionTimeout: backendSettings.sessionTimeout,
        passwordMinLength: backendSettings.passwordMinLength,
        passwordRequireUppercase: backendSettings.passwordRequireUppercase,
        passwordRequireLowercase: backendSettings.passwordRequireLowercase,
        passwordRequireNumbers: backendSettings.passwordRequireNumbers,
        passwordRequireSpecialChars: backendSettings.passwordRequireSpecialChars,
        emailNotifications: backendSettings.emailNotifications,
        pushNotifications: backendSettings.pushNotifications,
        newUserSignup: backendSettings.newUserSignup,
        contentSubmitted: backendSettings.contentSubmitted,
        contentApproved: backendSettings.contentApproved,
        contentRejected: backendSettings.contentRejected,
        subscriptionExpiring: backendSettings.subscriptionExpiring,
        subscriptionRenewed: backendSettings.subscriptionRenewed,
      })
    }
  }, [backendSettings])

  const handleChange = (field: keyof UpdateSettingsInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value: string | boolean | number | string[]
    
    if (event.target.type === 'checkbox') {
      value = event.target.checked
    } else if (event.target.type === 'number') {
      value = parseFloat(event.target.value) || 0
    } else {
      value = event.target.value
    }
    
    setLocalSettings({ ...localSettings, [field]: value })
  }

  const handleSave = () => {
    // Validate settings before saving
    const validation = validateSettings(localSettings)
    setValidationResult(validation)

    if (!validation.isValid) {
      return
    }

    if (backendSettings?.id) {
      updateSettings({
        id: backendSettings.id,
        input: localSettings,
      })
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
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
          disabled={isUpdating}
          sx={{ borderRadius: '12px' }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

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

          {!validationResult.isValid && (
            <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
              Please fix the validation errors before saving.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Site Name"
              value={localSettings.siteName || ''}
              onChange={handleChange('siteName')}
              fullWidth
              required
              error={!!getValidationErrorMessage('siteName', validationResult.errors)}
              helperText={getValidationErrorMessage('siteName', validationResult.errors)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <TextField
              label="Site Description"
              value={localSettings.siteDescription || ''}
              onChange={handleChange('siteDescription')}
              fullWidth
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Contact Email"
                value={localSettings.contactEmail || ''}
                onChange={handleChange('contactEmail')}
                fullWidth
                type="email"
                error={!!getValidationErrorMessage('contactEmail', validationResult.errors)}
                helperText={getValidationErrorMessage('contactEmail', validationResult.errors)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Support Email"
                value={localSettings.supportEmail || ''}
                onChange={handleChange('supportEmail')}
                fullWidth
                type="email"
                error={!!getValidationErrorMessage('supportEmail', validationResult.errors)}
                helperText={getValidationErrorMessage('supportEmail', validationResult.errors)}
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
                  checked={localSettings.maintenanceMode || false}
                  onChange={handleChange('maintenanceMode')}
                />
              }
              label="Maintenance Mode (disables user access)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.registrationEnabled || false}
                  onChange={handleChange('registrationEnabled')}
                />
              }
              label="User Registration Enabled"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.emailVerificationRequired || false}
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
              value={localSettings.maxFileUploadSize || 0}
              onChange={handleChange('maxFileUploadSize')}
              fullWidth
              inputProps={{ min: 1, max: 100 }}
              error={!!getValidationErrorMessage('maxFileUploadSize', validationResult.errors)}
              helperText={getValidationErrorMessage('maxFileUploadSize', validationResult.errors) || 'Range: 1-100 MB'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allowed File Types
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(localSettings.allowedFileTypes || []).map((type) => (
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
              value={localSettings.sessionTimeout || 0}
              onChange={handleChange('sessionTimeout')}
              fullWidth
              inputProps={{ min: 5, max: 1440 }}
              error={!!getValidationErrorMessage('sessionTimeout', validationResult.errors)}
              helperText={getValidationErrorMessage('sessionTimeout', validationResult.errors) || 'Range: 5-1440 minutes'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Password Requirements
            </Typography>
            <Divider />

            <TextField
              label="Minimum Password Length"
              type="number"
              value={localSettings.passwordMinLength || 0}
              onChange={handleChange('passwordMinLength')}
              fullWidth
              inputProps={{ min: 6, max: 128 }}
              error={!!getValidationErrorMessage('passwordMinLength', validationResult.errors)}
              helperText={getValidationErrorMessage('passwordMinLength', validationResult.errors) || 'Range: 6-128 characters'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.passwordRequireUppercase || false}
                  onChange={handleChange('passwordRequireUppercase')}
                />
              }
              label="Require Uppercase Letters"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.passwordRequireLowercase || false}
                  onChange={handleChange('passwordRequireLowercase')}
                />
              }
              label="Require Lowercase Letters"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.passwordRequireNumbers || false}
                  onChange={handleChange('passwordRequireNumbers')}
                />
              }
              label="Require Numbers"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.passwordRequireSpecialChars || false}
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
                  checked={localSettings.emailNotifications || false}
                  onChange={handleChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.pushNotifications || false}
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
                  checked={localSettings.newUserSignup || false}
                  onChange={handleChange('newUserSignup')}
                />
              }
              label="New User Signup"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.contentSubmitted || false}
                  onChange={handleChange('contentSubmitted')}
                />
              }
              label="Content Submitted for Approval"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.contentApproved || false}
                  onChange={handleChange('contentApproved')}
                />
              }
              label="Content Approved"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.contentRejected || false}
                  onChange={handleChange('contentRejected')}
                />
              }
              label="Content Rejected"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.subscriptionExpiring || false}
                  onChange={handleChange('subscriptionExpiring')}
                />
              }
              label="Subscription Expiring Soon"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.subscriptionRenewed || false}
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
