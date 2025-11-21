import express, { Request, Response } from 'express'
import { notificationService } from '../services/notifications.js'

const router = express.Router()

/**
 * POST /api/notifications/process-queue
 * Process pending notifications and send via Expo Push
 */
router.post('/process-queue', async (req: Request, res: Response) => {
  try {
    console.log('📬 Processing notification queue...')
    const result = await notificationService.processNotificationQueue()
    res.json({
      success: true,
      message: 'Notification queue processed',
      ...result,
    })
  } catch (error) {
    console.error('Error processing queue:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process queue',
    })
  }
})

/**
 * POST /api/notifications/send
 * Send a single notification (for immediate sending from admin)
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.body

    if (!notificationId) {
      res.status(400).json({ success: false, error: 'notificationId is required' })
      return
    }

    // Create a queue item and process it
    const queueItem = {
      notification_id: notificationId,
      status: 'pending',
      run_at: new Date().toISOString(),
    }

    const result = await notificationService.sendNotification(queueItem)
    res.json({
      success: true,
      message: 'Notification sent',
      ...result,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    })
  }
})

/**
 * GET /api/notifications/check-receipts
 * Check delivery receipts from Expo Push
 */
router.get('/check-receipts', async (req: Request, res: Response) => {
  try {
    console.log('📋 Checking notification receipts...')
    await notificationService.checkReceiptStatus()
    res.json({
      success: true,
      message: 'Receipt status updated',
    })
  } catch (error) {
    console.error('Error checking receipts:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check receipts',
    })
  }
})

/**
 * GET /api/notifications/health
 * Health check for notification service
 */
router.get('/health', (req: Request, res: Response) => {
  const expoConfigured = !!process.env.EXPO_ACCESS_TOKEN
  res.json({
    success: true,
    service: 'Notification Service',
    status: expoConfigured ? 'ready' : 'waiting-for-config',
    expoConfigured,
    message: expoConfigured
      ? 'Push notification service is ready'
      : 'EXPO_ACCESS_TOKEN not configured',
  })
})

export default router
