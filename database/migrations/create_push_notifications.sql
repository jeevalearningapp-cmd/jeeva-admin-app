-- =====================================================
-- Push Notifications System
-- =====================================================
-- Creates tables for Expo Push Notifications integration
-- Supports manual campaigns and automated triggers
-- Version: 1.0
-- Created: 2025-01-16
-- =====================================================

-- =====================================================
-- Table 1: push_tokens
-- Stores user device push notification tokens
-- =====================================================
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Token Information
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  device_id VARCHAR(255),
  platform VARCHAR(20) CHECK (platform IN ('ios', 'android')),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Key
  CONSTRAINT fk_push_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Indexes for push_tokens
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;
CREATE UNIQUE INDEX idx_push_tokens_device ON push_tokens(user_id, device_id) WHERE device_id IS NOT NULL;

-- Updated_at trigger for push_tokens
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- =====================================================
-- Table 2: notifications
-- Stores notification campaigns (manual and automated)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  
  -- Data payload for deep linking (JSONB)
  data JSONB DEFAULT '{}',
  
  -- Targeting
  audience_filter JSONB DEFAULT '{"type": "all"}',
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  
  -- Type
  notification_type VARCHAR(30) NOT NULL DEFAULT 'manual'
    CHECK (notification_type IN ('manual', 'subscription_expiring', 'content_approved', 'content_rejected', 'welcome', 'study_reminder')),
  
  -- Analytics
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  
  -- Created by
  created_by UUID,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_notifications_created_by
    FOREIGN KEY (created_by)
    REFERENCES admin_users(id)
    ON DELETE SET NULL
);

-- Indexes for notifications
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_notifications_created_by ON notifications(created_by);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Updated_at trigger for notifications
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- =====================================================
-- Table 3: notification_targets
-- Tracks delivery status for each user/notification
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL,
  push_token_id UUID,
  
  -- Delivery tracking
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  
  -- Expo Push Receipt
  expo_ticket_id VARCHAR(255),
  expo_receipt_id VARCHAR(255),
  
  -- Timing
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Error tracking
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_notification_targets_notification
    FOREIGN KEY (notification_id)
    REFERENCES notifications(id)
    ON DELETE CASCADE,
  
  CONSTRAINT fk_notification_targets_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_notification_targets_push_token
    FOREIGN KEY (push_token_id)
    REFERENCES push_tokens(id)
    ON DELETE SET NULL,
  
  -- Unique constraint: one target per user per notification
  UNIQUE(notification_id, user_id)
);

-- Indexes for notification_targets
CREATE INDEX idx_notification_targets_notification ON notification_targets(notification_id);
CREATE INDEX idx_notification_targets_user ON notification_targets(user_id);
CREATE INDEX idx_notification_targets_status ON notification_targets(delivery_status);
CREATE INDEX idx_notification_targets_ticket ON notification_targets(expo_ticket_id) WHERE expo_ticket_id IS NOT NULL;

-- Updated_at trigger for notification_targets
CREATE OR REPLACE FUNCTION update_notification_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_targets_updated_at
  BEFORE UPDATE ON notification_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_targets_updated_at();

-- =====================================================
-- Table 4: notification_queue
-- Manages scheduled and retry logic
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  notification_id UUID NOT NULL,
  
  -- Scheduling
  run_at TIMESTAMPTZ NOT NULL,
  
  -- Retry logic
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Error tracking
  last_error TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_notification_queue_notification
    FOREIGN KEY (notification_id)
    REFERENCES notifications(id)
    ON DELETE CASCADE
);

-- Indexes for notification_queue
CREATE INDEX idx_notification_queue_run_at ON notification_queue(run_at) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_notification ON notification_queue(notification_id);

-- Updated_at trigger for notification_queue
CREATE OR REPLACE FUNCTION update_notification_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_queue_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: push_tokens
-- =====================================================

-- Users can view and manage their own tokens
CREATE POLICY "Users can view own push tokens"
  ON push_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own push tokens"
  ON push_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own push tokens"
  ON push_tokens FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own push tokens"
  ON push_tokens FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all push tokens
CREATE POLICY "Admins can view all push tokens"
  ON push_tokens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- =====================================================
-- RLS: notifications
-- =====================================================

-- Admins can manage notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.role IN ('superadmin', 'editor')
    )
  );

CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.role IN ('superadmin', 'editor')
    )
  );

CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.role = 'superadmin'
    )
  );

-- =====================================================
-- RLS: notification_targets
-- =====================================================

-- Users can view their own notification history
CREATE POLICY "Users can view own notification targets"
  ON notification_targets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all targets
CREATE POLICY "Admins can view all notification targets"
  ON notification_targets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Service role can manage all targets (for Edge Functions)
CREATE POLICY "Service role can manage notification targets"
  ON notification_targets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS: notification_queue
-- =====================================================

-- Only service role (Edge Functions) can manage queue
CREATE POLICY "Service role can manage notification queue"
  ON notification_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view queue status
CREATE POLICY "Admins can view notification queue"
  ON notification_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get notification stats for a campaign
CREATE OR REPLACE FUNCTION get_notification_stats(notification_id_param UUID)
RETURNS TABLE (
  total_recipients BIGINT,
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  total_read BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_recipients,
    COUNT(*) FILTER (WHERE delivery_status IN ('sent', 'delivered', 'read'))::BIGINT as total_sent,
    COUNT(*) FILTER (WHERE delivery_status = 'delivered' OR delivery_status = 'read')::BIGINT as total_delivered,
    COUNT(*) FILTER (WHERE delivery_status = 'failed')::BIGINT as total_failed,
    COUNT(*) FILTER (WHERE delivery_status = 'read')::BIGINT as total_read
  FROM notification_targets
  WHERE notification_id = notification_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark inactive tokens (haven't been seen in 90 days)
CREATE OR REPLACE FUNCTION mark_inactive_push_tokens()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE push_tokens
  SET is_active = false
  WHERE is_active = true
    AND last_seen_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE push_tokens IS 'Stores Expo Push Notification tokens for user devices';
COMMENT ON TABLE notifications IS 'Notification campaigns and automated messages';
COMMENT ON TABLE notification_targets IS 'Tracks delivery status for each user/notification pair';
COMMENT ON TABLE notification_queue IS 'Manages scheduled notifications and retry logic';

COMMENT ON COLUMN notifications.audience_filter IS 'JSONB filter for targeting users: {"type": "all"} or {"type": "subscription_tier", "value": "premium"}';
COMMENT ON COLUMN notifications.data IS 'JSONB payload for deep linking: {"screen": "LessonDetails", "lessonId": "123"}';
COMMENT ON COLUMN notification_targets.delivery_status IS 'Tracks progression: pending → sent → delivered → read';

-- =====================================================
-- End of migration
-- =====================================================
