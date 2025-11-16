-- =====================================================
-- In-App Notifications for Mobile App
-- =====================================================
-- This migration adds read tracking and user preferences for in-app notifications
-- Run this AFTER create_push_notifications.sql
-- =====================================================

-- =====================================================
-- Table 1: user_notification_reads
-- =====================================================
-- Tracks which notifications a user has read

CREATE TABLE IF NOT EXISTS user_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can't mark the same notification as read twice
  CONSTRAINT unique_user_notification_read UNIQUE (user_id, notification_id),
  
  -- Indexes for performance
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_notification_reads_user_id ON user_notification_reads(user_id);
CREATE INDEX idx_user_notification_reads_notification_id ON user_notification_reads(notification_id);
CREATE INDEX idx_user_notification_reads_read_at ON user_notification_reads(read_at DESC);

-- =====================================================
-- Table 2: notification_preferences
-- =====================================================
-- User preferences for notification types

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification channel preferences
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  
  -- Notification type preferences (what events trigger notifications)
  subscription_expiring_enabled BOOLEAN DEFAULT true,
  content_approved_enabled BOOLEAN DEFAULT true,
  welcome_enabled BOOLEAN DEFAULT true,
  milestones_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  
  -- Quiet hours (store as JSON with start/end times)
  quiet_hours JSONB DEFAULT NULL, -- e.g., {"start": "22:00", "end": "08:00"}
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =====================================================
-- RLS Policies for user_notification_reads
-- =====================================================

ALTER TABLE user_notification_reads ENABLE ROW LEVEL SECURITY;

-- Users can read their own notification read status
CREATE POLICY "Users can read their own notification reads"
  ON user_notification_reads FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark notifications as read
CREATE POLICY "Users can mark notifications as read"
  ON user_notification_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reads (unmark as read)
CREATE POLICY "Users can delete their own notification reads"
  ON user_notification_reads FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for notification_preferences
-- =====================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- Helper Function: Get User Notifications with Read Status
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_notifications_with_read_status(
  user_id_param UUID,
  limit_param INT DEFAULT 50,
  offset_param INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  body TEXT,
  notification_type TEXT,
  data JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.body,
    n.notification_type,
    n.data,
    n.image_url,
    n.created_at,
    (unr.id IS NOT NULL) as is_read,
    unr.read_at
  FROM notifications n
  LEFT JOIN user_notification_reads unr 
    ON n.id = unr.notification_id 
    AND unr.user_id = user_id_param
  WHERE 
    -- Only show notifications targeted to this user
    (
      n.audience_filter->>'type' = 'all_users' OR
      n.audience_filter->'userIds' @> to_jsonb(ARRAY[user_id_param]::UUID[])
    )
    AND n.status = 'sent' -- Only show sent notifications
  ORDER BY n.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Helper Function: Get Unread Notification Count
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id_param UUID)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*)::INT INTO unread_count
  FROM notifications n
  LEFT JOIN user_notification_reads unr 
    ON n.id = unr.notification_id 
    AND unr.user_id = user_id_param
  WHERE 
    unr.id IS NULL -- Not read
    AND (
      n.audience_filter->>'type' = 'all_users' OR
      n.audience_filter->'userIds' @> to_jsonb(ARRAY[user_id_param]::UUID[])
    )
    AND n.status = 'sent';
    
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger: Update notification_preferences updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_timestamp();

-- =====================================================
-- Seed Default Preferences for Existing Users
-- =====================================================

-- Create default preferences for all existing users who don't have them
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Trigger: Create Default Preferences for New Users
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if it doesn't exist)
DROP TRIGGER IF EXISTS create_notification_preferences_on_signup ON auth.users;
CREATE TRIGGER create_notification_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_notification_reads', 'notification_preferences');

-- Check functions were created
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_notifications_with_read_status', 'get_unread_notification_count');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- ✅ Created tables:
--    - user_notification_reads (track what users have read)
--    - notification_preferences (user notification settings)
--
-- ✅ Created helper functions:
--    - get_user_notifications_with_read_status() (fetch notifications with read status)
--    - get_unread_notification_count() (get badge count)
--
-- ✅ Set up RLS policies for user access control
--
-- ✅ Created triggers:
--    - Auto-create default preferences for new users
--    - Auto-update timestamps
--
-- Next steps:
-- 1. Use the API endpoints to fetch/update notifications
-- 2. Integrate with mobile app (see docs/mobileapp-optimisation/inapp-notifications-guide.md)
--
-- =====================================================
