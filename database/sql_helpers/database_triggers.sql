-- =====================================================
-- Database Triggers for Automated Notifications
-- =====================================================
-- These triggers automatically create notifications when certain events occur
-- Run this AFTER creating the push_notifications tables
-- =====================================================

-- =====================================================
-- Trigger 1: Content Approved Notification
-- =====================================================
-- When content is approved, notify the creator

CREATE OR REPLACE FUNCTION notify_content_approved()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
  content_title TEXT;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Get the content creator and title
    -- Adjust based on your actual content_approvals table structure
    SELECT created_by, title INTO creator_id, content_title
    FROM lessons -- or modules/topics depending on what's being approved
    WHERE id = NEW.content_id;
    
    -- Create notification
    INSERT INTO notifications (
      title,
      body,
      notification_type,
      audience_filter,
      status,
      data
    ) VALUES (
      'Content Approved! ✅',
      'Your submitted content "' || COALESCE(content_title, 'Untitled') || '" has been approved and is now live.',
      'content_approved',
      jsonb_build_object(
        'type', 'specific_users',
        'userIds', ARRAY[creator_id]
      ),
      'scheduled',
      jsonb_build_object(
        'action', 'navigate',
        'screen', 'ContentDetails',
        'contentId', NEW.content_id
      )
    );
    
    -- Add to queue for immediate sending
    INSERT INTO notification_queue (notification_id, run_at, status)
    SELECT id, NOW(), 'pending'
    FROM notifications
    WHERE notification_type = 'content_approved'
    AND audience_filter @> jsonb_build_object('userIds', ARRAY[creator_id])
    ORDER BY created_at DESC
    LIMIT 1;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (if content_approvals table exists)
-- DROP TRIGGER IF EXISTS content_approval_notification ON content_approvals;
-- CREATE TRIGGER content_approval_notification
-- AFTER UPDATE ON content_approvals
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_content_approved();

-- =====================================================
-- Trigger 2: Content Rejected Notification
-- =====================================================

CREATE OR REPLACE FUNCTION notify_content_rejected()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
  content_title TEXT;
  rejection_reason TEXT;
BEGIN
  -- Only trigger when status changes to 'rejected'
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    -- Get the content creator and title
    SELECT created_by, title INTO creator_id, content_title
    FROM lessons
    WHERE id = NEW.content_id;
    
    rejection_reason := COALESCE(NEW.comments, 'No reason provided');
    
    -- Create notification
    INSERT INTO notifications (
      title,
      body,
      notification_type,
      audience_filter,
      status,
      data
    ) VALUES (
      'Content Needs Revision',
      'Your submitted content "' || COALESCE(content_title, 'Untitled') || '" needs some changes. Reason: ' || rejection_reason,
      'content_rejected',
      jsonb_build_object(
        'type', 'specific_users',
        'userIds', ARRAY[creator_id]
      ),
      'scheduled',
      jsonb_build_object(
        'action', 'navigate',
        'screen', 'ContentDetails',
        'contentId', NEW.content_id,
        'reason', rejection_reason
      )
    );
    
    -- Add to queue
    INSERT INTO notification_queue (notification_id, run_at, status)
    SELECT id, NOW(), 'pending'
    FROM notifications
    WHERE notification_type = 'content_rejected'
    AND audience_filter @> jsonb_build_object('userIds', ARRAY[creator_id])
    ORDER BY created_at DESC
    LIMIT 1;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (if content_approvals table exists)
-- DROP TRIGGER IF EXISTS content_rejection_notification ON content_approvals;
-- CREATE TRIGGER content_rejection_notification
-- AFTER UPDATE ON content_approvals
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_content_rejected();

-- =====================================================
-- Trigger 3: New User Welcome Notification
-- =====================================================
-- Alternative to the Edge Function approach - triggers immediately on signup

CREATE OR REPLACE FUNCTION notify_new_user_welcome()
RETURNS TRIGGER AS $$
BEGIN
  -- Create welcome notification 5 minutes after signup
  INSERT INTO notifications (
    title,
    body,
    notification_type,
    audience_filter,
    status,
    data
  ) VALUES (
    'Welcome to Jeeva Learning! 🎓',
    'Start your journey to becoming an NMC certified nurse in the UK. Explore practice questions, lessons, and mock exams.',
    'welcome',
    jsonb_build_object(
      'type', 'specific_users',
      'userIds', ARRAY[NEW.id]
    ),
    'scheduled',
    jsonb_build_object(
      'action', 'navigate',
      'screen', 'Home'
    )
  );
  
  -- Schedule for 5 minutes from now
  INSERT INTO notification_queue (notification_id, run_at, status)
  SELECT id, NOW() + INTERVAL '5 minutes', 'pending'
  FROM notifications
  WHERE notification_type = 'welcome'
  AND audience_filter @> jsonb_build_object('userIds', ARRAY[NEW.id])
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_profiles table
DROP TRIGGER IF EXISTS new_user_welcome_notification ON user_profiles;
CREATE TRIGGER new_user_welcome_notification
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION notify_new_user_welcome();

-- =====================================================
-- Trigger 4: Subscription Activated Notification
-- =====================================================

CREATE OR REPLACE FUNCTION notify_subscription_activated()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when subscription becomes active
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    
    INSERT INTO notifications (
      title,
      body,
      notification_type,
      audience_filter,
      status,
      data
    ) VALUES (
      'Subscription Activated! 🎉',
      'Your ' || NEW.plan_name || ' subscription is now active. Enjoy unlimited access to all study materials!',
      'subscription_activated',
      jsonb_build_object(
        'type', 'specific_users',
        'userIds', ARRAY[NEW.user_id]
      ),
      'scheduled',
      jsonb_build_object(
        'action', 'navigate',
        'screen', 'Home'
      )
    );
    
    -- Send immediately
    INSERT INTO notification_queue (notification_id, run_at, status)
    SELECT id, NOW(), 'pending'
    FROM notifications
    WHERE notification_type = 'subscription_activated'
    AND audience_filter @> jsonb_build_object('userIds', ARRAY[NEW.user_id])
    ORDER BY created_at DESC
    LIMIT 1;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on subscriptions table
DROP TRIGGER IF EXISTS subscription_activated_notification ON subscriptions;
CREATE TRIGGER subscription_activated_notification
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION notify_subscription_activated();

-- =====================================================
-- Helper Function: Get Users at Question Milestone
-- =====================================================
-- Used by the automated notifications Edge Function

CREATE OR REPLACE FUNCTION get_users_at_question_milestone(milestone_count INTEGER)
RETURNS TABLE(user_id UUID, total_questions BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.user_id,
    COUNT(pa.id) as total_questions
  FROM practice_answers pa -- Adjust table name based on your schema
  GROUP BY pa.user_id
  HAVING COUNT(pa.id) = milestone_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger 5: Study Streak Achievement
-- =====================================================

CREATE OR REPLACE FUNCTION notify_study_streak()
RETURNS TRIGGER AS $$
DECLARE
  streak_days INTEGER;
BEGIN
  -- Calculate consecutive days of activity (simplified version)
  -- In production, you'd calculate this more accurately
  streak_days := NEW.current_streak; -- Assumes you track this in user_profiles
  
  -- Notify on streak milestones: 7, 14, 30, 60, 90 days
  IF streak_days = ANY(ARRAY[7, 14, 30, 60, 90]) THEN
    
    INSERT INTO notifications (
      title,
      body,
      notification_type,
      audience_filter,
      status,
      data
    ) VALUES (
      '🔥 ' || streak_days || '-Day Streak!',
      'Incredible dedication! You''ve studied for ' || streak_days || ' consecutive days. Keep the momentum going!',
      'streak_achievement',
      jsonb_build_object(
        'type', 'specific_users',
        'userIds', ARRAY[NEW.id]
      ),
      'scheduled',
      jsonb_build_object(
        'action', 'navigate',
        'screen', 'Progress',
        'streak', streak_days
      )
    );
    
    -- Send immediately
    INSERT INTO notification_queue (notification_id, run_at, status)
    SELECT id, NOW(), 'pending'
    FROM notifications
    WHERE notification_type = 'streak_achievement'
    AND data->>'streak' = streak_days::TEXT
    ORDER BY created_at DESC
    LIMIT 1;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uncomment when current_streak column exists
-- DROP TRIGGER IF EXISTS study_streak_notification ON user_profiles;
-- CREATE TRIGGER study_streak_notification
-- AFTER UPDATE OF current_streak ON user_profiles
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_study_streak();

-- =====================================================
-- View All Triggers
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%notification%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SETUP INSTRUCTIONS
-- =====================================================
--
-- 1. Run this file AFTER create_push_notifications.sql
--
-- 2. Some triggers are commented out because they depend on tables
--    that may not exist yet (content_approvals, practice_answers, etc.)
--
-- 3. Uncomment triggers as you create those tables
--
-- 4. Test triggers manually:
--    - Insert a new user_profiles row → Should create welcome notification
--    - Update subscriptions status to 'active' → Should create activation notification
--
-- 5. Monitor trigger execution:
--    SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
--    SELECT * FROM notification_queue ORDER BY created_at DESC LIMIT 10;
--
-- =====================================================
