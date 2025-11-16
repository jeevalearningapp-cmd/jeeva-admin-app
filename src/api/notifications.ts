import { supabase } from '@/lib/supabase'
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationStats,
  UserTargetingOption,
  NotificationFilters,
  PushToken,
  RegisterPushTokenInput,
  UpdatePushTokenInput,
  NotificationTarget,
} from '@/types/notifications'

export const notificationsAPI = {
  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.type && filters.type.length > 0) {
      query = query.in('notification_type', filters.type)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,body.ilike.%${filters.searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`)
    }

    return data.map(transformNotificationFromDB)
  },

  async getNotificationById(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch notification: ${error.message}`)
    }

    return transformNotificationFromDB(data)
  },

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: input.title,
        body: input.body,
        image_url: input.imageUrl,
        data: input.data || {},
        audience_filter: input.audienceFilter,
        scheduled_for: input.scheduledFor,
        notification_type: input.notificationType || 'manual',
        status: input.scheduledFor ? 'scheduled' : 'draft',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`)
    }

    return transformNotificationFromDB(data)
  },

  async updateNotification(id: string, input: UpdateNotificationInput): Promise<Notification> {
    const updateData: Record<string, any> = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.body !== undefined) updateData.body = input.body
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.data !== undefined) updateData.data = input.data
    if (input.audienceFilter !== undefined) updateData.audience_filter = input.audienceFilter
    if (input.scheduledFor !== undefined) updateData.scheduled_for = input.scheduledFor
    if (input.status !== undefined) updateData.status = input.status

    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update notification: ${error.message}`)
    }

    return transformNotificationFromDB(data)
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`)
    }
  },

  async getNotificationStats(id: string): Promise<NotificationStats> {
    const { data, error } = await supabase.rpc('get_notification_stats', {
      notification_id_param: id,
    })

    if (error) {
      const targets = await this.getNotificationTargets(id)
      
      const totalRecipients = targets.length
      const totalSent = targets.filter(t => ['sent', 'delivered', 'read'].includes(t.deliveryStatus)).length
      const totalDelivered = targets.filter(t => ['delivered', 'read'].includes(t.deliveryStatus)).length
      const totalFailed = targets.filter(t => t.deliveryStatus === 'failed').length
      const totalRead = targets.filter(t => t.deliveryStatus === 'read').length

      return {
        totalRecipients,
        totalSent,
        totalDelivered,
        totalFailed,
        totalRead,
        deliveryRate: totalRecipients > 0 ? (totalDelivered / totalRecipients) * 100 : 0,
        openRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
      }
    }

    const stats = data[0]
    return {
      totalRecipients: Number(stats.total_recipients || 0),
      totalSent: Number(stats.total_sent || 0),
      totalDelivered: Number(stats.total_delivered || 0),
      totalFailed: Number(stats.total_failed || 0),
      totalRead: Number(stats.total_read || 0),
      deliveryRate: stats.total_recipients > 0 ? (stats.total_delivered / stats.total_recipients) * 100 : 0,
      openRate: stats.total_delivered > 0 ? (stats.total_read / stats.total_delivered) * 100 : 0,
    }
  },

  async getUserTargetingOptions(): Promise<UserTargetingOption[]> {
    const options: UserTargetingOption[] = []

    try {
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      options.push({
        id: 'all',
        label: 'All Users',
        count: totalUsers || 0,
        type: 'all',
      })

      const { data: subscriptionCounts } = await supabase
        .from('subscriptions')
        .select('plan_name')
        .eq('status', 'active')

      if (subscriptionCounts) {
        const planCounts: Record<string, number> = {}
        subscriptionCounts.forEach(sub => {
          planCounts[sub.plan_name] = (planCounts[sub.plan_name] || 0) + 1
        })

        Object.entries(planCounts).forEach(([planName, count]) => {
          options.push({
            id: `subscription_${planName}`,
            label: `${planName} Subscribers`,
            count,
            type: 'subscription',
          })
        })
      }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString())

      options.push({
        id: 'active_30_days',
        label: 'Active in Last 30 Days',
        count: activeUsers || 0,
        type: 'activity',
      })

      return options
    } catch (error) {
      console.error('Failed to fetch user targeting options:', error)
      return options
    }
  },

  async scheduleNotification(id: string, scheduledFor: string): Promise<Notification> {
    return this.updateNotification(id, {
      scheduledFor,
      status: 'scheduled',
    })
  },

  async cancelScheduledNotification(id: string): Promise<Notification> {
    return this.updateNotification(id, {
      status: 'cancelled',
    })
  },

  async retryFailedNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notification_targets')
      .update({ delivery_status: 'pending' })
      .eq('notification_id', id)
      .eq('delivery_status', 'failed')

    if (error) {
      throw new Error(`Failed to retry notification: ${error.message}`)
    }

    await this.updateNotification(id, { status: 'scheduled' })
  },

  async getNotificationTargets(notificationId: string): Promise<NotificationTarget[]> {
    const { data, error } = await supabase
      .from('notification_targets')
      .select('*')
      .eq('notification_id', notificationId)

    if (error) {
      throw new Error(`Failed to fetch notification targets: ${error.message}`)
    }

    return data.map(transformNotificationTargetFromDB)
  },

  async registerPushToken(userId: string, input: RegisterPushTokenInput): Promise<PushToken> {
    const existingToken = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('expo_push_token', input.expoPushToken)
      .maybeSingle()

    if (existingToken.data) {
      const { data, error } = await supabase
        .from('push_tokens')
        .update({
          is_active: true,
          last_seen_at: new Date().toISOString(),
          device_id: input.deviceId,
          platform: input.platform,
        })
        .eq('id', existingToken.data.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update push token: ${error.message}`)
      }

      return transformPushTokenFromDB(data)
    }

    const { data, error } = await supabase
      .from('push_tokens')
      .insert({
        user_id: userId,
        expo_push_token: input.expoPushToken,
        device_id: input.deviceId,
        platform: input.platform,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to register push token: ${error.message}`)
    }

    return transformPushTokenFromDB(data)
  },

  async updatePushToken(id: string, input: UpdatePushTokenInput): Promise<PushToken> {
    const updateData: Record<string, any> = {}

    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.lastSeenAt !== undefined) updateData.last_seen_at = input.lastSeenAt

    const { data, error } = await supabase
      .from('push_tokens')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update push token: ${error.message}`)
    }

    return transformPushTokenFromDB(data)
  },

  async getUserPushTokens(userId: string): Promise<PushToken[]> {
    const { data, error} = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      throw new Error(`Failed to fetch push tokens: ${error.message}`)
    }

    return data.map(transformPushTokenFromDB)
  },

  async getUserNotifications(userId: string, limit = 50, offset = 0): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_user_notifications_with_read_status', {
      user_id_param: userId,
      limit_param: limit,
      offset_param: offset,
    })

    if (error) {
      throw new Error(`Failed to fetch user notifications: ${error.message}`)
    }

    return data || []
  },

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notification_reads')
      .insert({
        user_id: userId,
        notification_id: notificationId,
      })

    if (error && !error.message.includes('duplicate key')) {
      throw new Error(`Failed to mark notification as read: ${error.message}`)
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const unreadNotifications = await this.getUserNotifications(userId, 1000, 0)
    
    const unread = unreadNotifications
      .filter((n: any) => !n.is_read)
      .map((n: any) => ({
        user_id: userId,
        notification_id: n.id,
      }))

    if (unread.length === 0) return

    const { error } = await supabase
      .from('user_notification_reads')
      .insert(unread)

    if (error && !error.message.includes('duplicate key')) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`)
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      user_id_param: userId,
    })

    if (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }

    return data || 0
  },

  async getNotificationPreferences(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch notification preferences: ${error.message}`)
    }

    if (!data) {
      const { data: newPrefs, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: userId })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to create notification preferences: ${insertError.message}`)
      }

      return transformNotificationPreferencesFromDB(newPrefs)
    }

    return transformNotificationPreferencesFromDB(data)
  },

  async updateNotificationPreferences(userId: string, preferences: any): Promise<any> {
    const updateData: Record<string, any> = {}

    if (preferences.pushEnabled !== undefined) updateData.push_enabled = preferences.pushEnabled
    if (preferences.emailEnabled !== undefined) updateData.email_enabled = preferences.emailEnabled
    if (preferences.inAppEnabled !== undefined) updateData.in_app_enabled = preferences.inAppEnabled
    if (preferences.subscriptionExpiringEnabled !== undefined) 
      updateData.subscription_expiring_enabled = preferences.subscriptionExpiringEnabled
    if (preferences.contentApprovedEnabled !== undefined) 
      updateData.content_approved_enabled = preferences.contentApprovedEnabled
    if (preferences.welcomeEnabled !== undefined) updateData.welcome_enabled = preferences.welcomeEnabled
    if (preferences.milestonesEnabled !== undefined) updateData.milestones_enabled = preferences.milestonesEnabled
    if (preferences.marketingEnabled !== undefined) updateData.marketing_enabled = preferences.marketingEnabled
    if (preferences.quietHours !== undefined) updateData.quiet_hours = preferences.quietHours

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update notification preferences: ${error.message}`)
    }

    return transformNotificationPreferencesFromDB(data)
  },
}

function transformNotificationFromDB(data: any): Notification {
  return {
    id: data.id,
    title: data.title,
    body: data.body,
    imageUrl: data.image_url,
    data: data.data,
    audienceFilter: data.audience_filter,
    scheduledFor: data.scheduled_for,
    sentAt: data.sent_at,
    status: data.status,
    notificationType: data.notification_type,
    totalRecipients: data.total_recipients || 0,
    totalSent: data.total_sent || 0,
    totalDelivered: data.total_delivered || 0,
    totalFailed: data.total_failed || 0,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformNotificationTargetFromDB(data: any): NotificationTarget {
  return {
    id: data.id,
    notificationId: data.notification_id,
    userId: data.user_id,
    pushTokenId: data.push_token_id,
    deliveryStatus: data.delivery_status,
    expoTicketId: data.expo_ticket_id,
    expoReceiptId: data.expo_receipt_id,
    sentAt: data.sent_at,
    deliveredAt: data.delivered_at,
    readAt: data.read_at,
    errorCode: data.error_code,
    errorMessage: data.error_message,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformPushTokenFromDB(data: any): PushToken {
  return {
    id: data.id,
    userId: data.user_id,
    expoPushToken: data.expo_push_token,
    deviceId: data.device_id,
    platform: data.platform,
    isActive: data.is_active,
    lastSeenAt: data.last_seen_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformNotificationPreferencesFromDB(data: any): any {
  return {
    id: data.id,
    userId: data.user_id,
    pushEnabled: data.push_enabled,
    emailEnabled: data.email_enabled,
    inAppEnabled: data.in_app_enabled,
    subscriptionExpiringEnabled: data.subscription_expiring_enabled,
    contentApprovedEnabled: data.content_approved_enabled,
    welcomeEnabled: data.welcome_enabled,
    milestonesEnabled: data.milestones_enabled,
    marketingEnabled: data.marketing_enabled,
    quietHours: data.quiet_hours,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
