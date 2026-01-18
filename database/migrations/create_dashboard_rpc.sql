-- ============================================
-- Dashboard RPC Functions
-- optimized queries for dashboard metrics
-- ============================================

-- Function to count distinct users by day (for DAU/chart)
CREATE OR REPLACE FUNCTION count_distinct_users_by_day(target_date DATE)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  -- Count users who had a session on the target date
  SELECT COUNT(DISTINCT user_id)
  INTO result
  FROM analytics_sessions
  WHERE DATE(created_at) = target_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count active users in the last N days
CREATE OR REPLACE FUNCTION count_distinct_active_users(days_ago INTEGER)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (days_ago || ' days')::INTERVAL;

  SELECT COUNT(DISTINCT user_id)
  INTO result
  FROM analytics_sessions
  WHERE created_at >= cutoff_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to public/authenticated users if needed
GRANT EXECUTE ON FUNCTION count_distinct_users_by_day(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION count_distinct_users_by_day(DATE) TO service_role;

GRANT EXECUTE ON FUNCTION count_distinct_active_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION count_distinct_active_users(INTEGER) TO service_role;

-- Notify complete
-- SELECT 'Dashboard functions created successfully' as status;
