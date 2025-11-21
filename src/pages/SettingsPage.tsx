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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  SaveOutlined,
  SettingsOutlined,
  EmailOutlined,
  NotificationsOutlined,
  SecurityOutlined,
  DeleteOutlined,
  AddOutlined,
  EditOutlined,
} from '@mui/icons-material'
import { useSettings } from '@/hooks/useSettings'
import { useEmailTemplates } from '@/hooks/useEmailTemplates'
import type { UpdateSettingsInput, EmailTemplate } from '@/types'
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
  const { templates, create: createTemplate, update: updateTemplate, delete: deleteTemplate, isCreating } = useEmailTemplates()
  const [validationResult, setValidationResult] = useState<SettingsValidationResult>({ isValid: true, errors: [] })
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    variables: [] as string[],
    isActive: true,
  })
  
  const [localSettings, setLocalSettings] = React.useState<UpdateSettingsInput>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    logoUrl: '',
    faviconUrl: '',
    defaultNotificationImageUrl: '',
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
        logoUrl: backendSettings.logoUrl,
        faviconUrl: backendSettings.faviconUrl,
        defaultNotificationImageUrl: backendSettings.defaultNotificationImageUrl,
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
          sx={{ borderRadius: 0 }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 0 }}>
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
            <Alert severity="error" sx={{ borderRadius: 0, mb: 2 }}>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            
            <TextField
              label="Site Description"
              value={localSettings.siteDescription || ''}
              onChange={handleChange('siteDescription')}
              fullWidth
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <TextField
                label="Support Email"
                value={localSettings.supportEmail || ''}
                onChange={handleChange('supportEmail')}
                fullWidth
                type="email"
                error={!!getValidationErrorMessage('supportEmail', validationResult.errors)}
                helperText={getValidationErrorMessage('supportEmail', validationResult.errors)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Branding
            </Typography>
            <Divider />

            <TextField
              label="Logo URL"
              value={localSettings.logoUrl || ''}
              onChange={handleChange('logoUrl')}
              fullWidth
              placeholder="https://example.com/logo.png"
              helperText="URL to your company logo (used in admin portal)"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />

            <TextField
              label="Favicon URL"
              value={localSettings.faviconUrl || ''}
              onChange={handleChange('faviconUrl')}
              fullWidth
              placeholder="https://example.com/favicon.ico"
              helperText="URL to your favicon (small browser tab icon)"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Notification Settings
            </Typography>
            <Divider />

            <TextField
              label="Default Notification Image URL"
              value={localSettings.defaultNotificationImageUrl || ''}
              onChange={handleChange('defaultNotificationImageUrl')}
              fullWidth
              placeholder="https://example.com/notification-logo.png"
              helperText="Default image for push & in-app notifications (when no custom image is provided)"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />

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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allowed File Types
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {(localSettings.allowedFileTypes || []).map((type) => (
                  <Chip 
                    key={type} 
                    label={type} 
                    size="small"
                    onDelete={() => {
                      setLocalSettings({
                        ...localSettings,
                        allowedFileTypes: (localSettings.allowedFileTypes || []).filter(t => t !== type)
                      })
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Add new file type"
                  placeholder="e.g., image/webp"
                  size="small"
                  id="fileTypeInput"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddOutlined />}
                  onClick={() => {
                    const input = document.getElementById('fileTypeInput') as HTMLInputElement
                    if (input && input.value) {
                      setLocalSettings({
                        ...localSettings,
                        allowedFileTypes: [...(localSettings.allowedFileTypes || []), input.value]
                      })
                      input.value = ''
                    }
                  }}
                  sx={{ borderRadius: 0 }}
                >
                  Add
                </Button>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Email Templates
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => {
                setEditingTemplate(null)
                setTemplateForm({ name: '', subject: '', body: '', variables: [], isActive: true })
                setTemplateDialogOpen(true)
              }}
              sx={{ borderRadius: 0 }}
            >
              New Template
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {templates.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              No email templates created yet. Create templates for welcome emails, password resets, content approvals, and subscription notifications.
            </Alert>
          ) : (
            <Paper sx={{ borderRadius: 0, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Variables</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {template.variables.length > 0 ? (
                            template.variables.map((v) => (
                              <Chip key={v} label={`{{${v}}}}`} size="small" variant="outlined" />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">None</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {template.isActive ? (
                          <Chip label="Active" size="small" color="success" variant="filled" />
                        ) : (
                          <Chip label="Inactive" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingTemplate(template)
                              setTemplateForm({
                                name: template.name,
                                subject: template.subject,
                                body: template.body,
                                variables: template.variables,
                                isActive: template.isActive,
                              })
                              setTemplateDialogOpen(true)
                            }}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('Delete this template?')) {
                                deleteTemplate(template.id)
                              }
                            }}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          {/* Template Dialog */}
          <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                fullWidth
                placeholder="e.g., Welcome Email"
              />
              <TextField
                label="Email Subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                fullWidth
                placeholder="e.g., Welcome to {{APP_NAME}}"
              />
              <TextField
                label="Email Body (HTML)"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                fullWidth
                multiline
                rows={8}
                placeholder="<h1>Welcome {{USER_NAME}}!</h1><p>Your account has been created.</p>"
              />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Variables
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {templateForm.variables.map((v) => (
                    <Chip
                      key={v}
                      label={`{{${v}}}}`}
                      onDelete={() => {
                        setTemplateForm({
                          ...templateForm,
                          variables: templateForm.variables.filter(x => x !== v),
                        })
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Add variable"
                    size="small"
                    placeholder="e.g., USER_NAME"
                    id="varInput"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const input = document.getElementById('varInput') as HTMLInputElement
                      if (input && input.value && !templateForm.variables.includes(input.value)) {
                        setTemplateForm({
                          ...templateForm,
                          variables: [...templateForm.variables, input.value],
                        })
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={templateForm.isActive}
                    onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (editingTemplate) {
                    updateTemplate({ id: editingTemplate.id, template: templateForm })
                  } else {
                    createTemplate(templateForm)
                  }
                  setTemplateDialogOpen(false)
                }}
                disabled={isCreating || !templateForm.name || !templateForm.subject || !templateForm.body}
              >
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
      </Paper>
    </Box>
  )
}
