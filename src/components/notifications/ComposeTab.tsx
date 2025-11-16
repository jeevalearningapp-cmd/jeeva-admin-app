import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material'
import {
  SendOutlined,
  ScheduleOutlined,
  PeopleOutlined,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useCreateNotification } from '@/hooks/useNotifications'
import { useUserTargetingOptions } from '@/hooks/useNotifications'
import type { CreateNotificationInput, AudienceFilter } from '@/types/notifications'

export const ComposeTab: React.FC = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [targetingType, setTargetingType] = useState<string>('all')
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null)

  const { data: targetingOptions, isLoading: loadingOptions } = useUserTargetingOptions()
  const createMutation = useCreateNotification()

  const handleSendNow = () => {
    if (!title || !body) {
      return
    }

    const audienceFilter: AudienceFilter = getAudienceFilter()

    const input: CreateNotificationInput = {
      title,
      body,
      imageUrl: imageUrl || undefined,
      audienceFilter,
      notificationType: 'manual',
    }

    createMutation.mutate(input, {
      onSuccess: () => {
        setTitle('')
        setBody('')
        setImageUrl('')
        setTargetingType('all')
      },
    })
  }

  const handleSchedule = () => {
    if (!title || !body || !scheduledFor) {
      return
    }

    const audienceFilter: AudienceFilter = getAudienceFilter()

    const input: CreateNotificationInput = {
      title,
      body,
      imageUrl: imageUrl || undefined,
      audienceFilter,
      scheduledFor: scheduledFor.toISOString(),
      notificationType: 'manual',
    }

    createMutation.mutate(input, {
      onSuccess: () => {
        setTitle('')
        setBody('')
        setImageUrl('')
        setTargetingType('all')
        setScheduledFor(null)
      },
    })
  }

  const getAudienceFilter = (): AudienceFilter => {
    if (targetingType === 'all') {
      return { type: 'all' }
    }
    
    if (targetingType.startsWith('subscription_')) {
      const planName = targetingType.replace('subscription_', '')
      return {
        type: 'subscription_tier',
        subscriptionTier: planName,
      }
    }

    if (targetingType === 'active_30_days') {
      return { type: 'active_users' }
    }

    return { type: 'all' }
  }

  const getRecipientCount = () => {
    if (loadingOptions || !targetingOptions) return 0
    const option = targetingOptions.find(opt => {
      if (targetingType === 'all') return opt.id === 'all'
      return opt.id === targetingType
    })
    return option?.count || 0
  }

  const isFormValid = title && body

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Compose New Notification
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Create and send push notifications to your mobile app users
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        <TextField
          label="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          placeholder="Welcome to Jeeva Learning!"
          inputProps={{ maxLength: 65 }}
          helperText={`${title.length}/65 characters`}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
        />

        <TextField
          label="Message Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
          required
          multiline
          rows={4}
          placeholder="Start your journey to becoming a certified nurse in the UK!"
          inputProps={{ maxLength: 240 }}
          helperText={`${body.length}/240 characters`}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
        />

        <TextField
          label="Image URL (Optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          placeholder="https://example.com/image.jpg"
          helperText="Image will be displayed in the notification (recommended: 1024x500px)"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
        />

        <FormControl fullWidth>
          <InputLabel>Target Audience</InputLabel>
          <Select
            value={targetingType}
            onChange={(e) => setTargetingType(e.target.value)}
            label="Target Audience"
            sx={{ borderRadius: 0 }}
          >
            {loadingOptions ? (
              <MenuItem value="all">Loading...</MenuItem>
            ) : (
              targetingOptions?.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option.label}</span>
                    <Chip label={`${option.count} users`} size="small" />
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleOutlined color="primary" />
            <Typography variant="body2" color="text.secondary">
              This notification will be sent to <strong>{getRecipientCount()} users</strong>
            </Typography>
          </Box>
        </Paper>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Schedule For (Optional)"
            value={scheduledFor}
            onChange={(newValue) => setScheduledFor(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: 'Leave empty to send immediately',
                sx: { '& .MuiOutlinedInput-root': { borderRadius: 0 } },
              },
            }}
            minDateTime={new Date()}
          />
        </LocalizationProvider>

        {!isFormValid && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Please fill in the title and message body to send a notification
          </Alert>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SendOutlined />}
            onClick={handleSendNow}
            disabled={!isFormValid || createMutation.isPending || !!scheduledFor}
            sx={{ borderRadius: 0, flex: 1 }}
          >
            {createMutation.isPending ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Sending...
              </>
            ) : (
              'Send Now'
            )}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ScheduleOutlined />}
            onClick={handleSchedule}
            disabled={!isFormValid || !scheduledFor || createMutation.isPending}
            sx={{ borderRadius: 0, flex: 1 }}
          >
            {createMutation.isPending ? 'Scheduling...' : 'Schedule'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
