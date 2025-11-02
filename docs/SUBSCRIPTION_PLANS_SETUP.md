# Subscription Plans Setup & Management Guide

This guide explains how to create, modify, and manage subscription plans for the Jeeva Learning platform, including AI message limits configuration.

## Database Schema Updates

### Step 1: Add Config Column to subscription_plans

The `config` JSONB column stores technical settings like AI message limits, separate from the user-facing `features` array.

```sql
-- Add config column to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Add helpful comment
COMMENT ON COLUMN subscription_plans.config IS 'Technical configuration settings (e.g., {"ai_messages_per_day": 50})';
```

### Step 2: Update Existing Plans with AI Limits

Set AI message limits for all existing plans:

```sql
-- Update Free Trial Plan (10 messages/day)
UPDATE subscription_plans
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{ai_messages_per_day}',
  to_jsonb(10)
)
WHERE duration_days = 0 OR name ILIKE '%trial%';

-- Update 30 & 60 Day Plans (50 messages/day)
UPDATE subscription_plans
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{ai_messages_per_day}',
  to_jsonb(50)
)
WHERE duration_days IN (30, 60);

-- Update 90 Day Plan (75 messages/day)
UPDATE subscription_plans
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{ai_messages_per_day}',
  to_jsonb(75)
)
WHERE duration_days = 90;

-- Update 120 Day Plan (100 messages/day)
UPDATE subscription_plans
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{ai_messages_per_day}',
  to_jsonb(100)
)
WHERE duration_days = 120;
```

### Step 3: Create RPC Function to Get User's AI Limit

This function retrieves a user's daily AI message limit based on their active subscription:

```sql
-- Create function to get user's AI message limit
CREATE OR REPLACE FUNCTION get_user_ai_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ai_limit INTEGER;
BEGIN
  -- Get AI limit from user's active subscription plan
  SELECT COALESCE(
    (sp.config->>'ai_messages_per_day')::INTEGER,
    10  -- Default to 10 if not set
  ) INTO ai_limit
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = user_id_param
    AND s.status = 'active'
    AND (s.end_date IS NULL OR s.end_date > NOW())
  ORDER BY s.end_date DESC NULLS FIRST
  LIMIT 1;
  
  -- If no active subscription found, return trial limit
  IF ai_limit IS NULL THEN
    ai_limit := 10;
  END IF;
  
  RETURN ai_limit;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_user_ai_limit(UUID) IS 'Returns daily AI message limit for a user based on their active subscription plan';
```

### Step 4: Fix Price Column (Optional)

If you prefer to use `price` instead of `price_usd`:

```sql
-- Option A: Rename column (if you haven't deployed to production yet)
ALTER TABLE subscription_plans 
RENAME COLUMN price_usd TO price;

-- Option B: Add price as alias view (safer for production)
-- Keep price_usd as-is, add a view:
CREATE OR REPLACE VIEW subscription_plans_view AS
SELECT 
  id,
  name,
  description,
  price_usd as price,  -- Alias for compatibility
  duration_days,
  features,
  config,
  is_active,
  display_order,
  created_at,
  updated_at
FROM subscription_plans;
```

## Creating New Subscription Plans

### Example: Create a 1-Year Plan

```sql
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price_usd,
  duration_days,
  features,
  config,
  is_active,
  display_order
) VALUES (
  gen_random_uuid(),
  '1 Year Premium Plan',
  'Complete access for 365 days with unlimited practice and AI assistance',
  4999.00,  -- $49.99 USD (stored in cents or as decimal)
  365,
  ARRAY[
    'Unlimited Practice MCQs',
    'All Learning Modules',
    'Unlimited Mock Exams',
    '150 AI Messages/Day',
    'Priority Support',
    'Downloadable Study Materials',
    'Progress Analytics',
    'Certificate of Completion'
  ],
  '{"ai_messages_per_day": 150, "priority_support": true, "download_materials": true}'::jsonb,
  true,
  5  -- Display after 120-day plan
);
```

### Example: Create a 6-Month Plan

```sql
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price_usd,
  duration_days,
  features,
  config,
  is_active,
  display_order
) VALUES (
  gen_random_uuid(),
  '6 Month Plan',
  'Extended preparation with comprehensive features',
  2999.00,  -- $29.99 USD
  180,
  ARRAY[
    'Unlimited Practice MCQs',
    'All Learning Modules',
    'Unlimited Mock Exams',
    '100 AI Messages/Day',
    'Performance Analytics',
    'Email Support'
  ],
  '{"ai_messages_per_day": 100}'::jsonb,
  true,
  4  -- Display after 90-day, before 120-day
);
```

## Modifying Existing Plans

### Change AI Message Limit

Increase the 30-day plan from 50 to 60 messages/day:

```sql
UPDATE subscription_plans
SET config = jsonb_set(
  config,
  '{ai_messages_per_day}',
  to_jsonb(60)
)
WHERE duration_days = 30;
```

### Update Plan Price

```sql
UPDATE subscription_plans
SET price_usd = 1499.00,  -- Change from $9.99 to $14.99
    updated_at = NOW()
WHERE duration_days = 30;
```

### Add New Feature to Config

Add priority support flag to 120-day plan:

```sql
UPDATE subscription_plans
SET config = jsonb_set(
  config,
  '{priority_support}',
  to_jsonb(true)
)
WHERE duration_days = 120;
```

### Add Feature to Display List

```sql
UPDATE subscription_plans
SET features = array_append(features, 'Priority Email Support')
WHERE duration_days = 120;
```

### Disable a Plan

```sql
UPDATE subscription_plans
SET is_active = false,
    updated_at = NOW()
WHERE name = '30 Days Plan';
```

## Config JSONB Field Structure

The `config` field stores technical settings:

```json
{
  "ai_messages_per_day": 50,
  "priority_support": true,
  "download_materials": true,
  "custom_branding": false,
  "api_access": false,
  "max_concurrent_sessions": 3
}
```

**Current Used Settings:**
- `ai_messages_per_day` (INTEGER) - Daily AI chat message limit

**Future Possible Settings:**
- `priority_support` (BOOLEAN) - Priority customer support
- `download_materials` (BOOLEAN) - Download study materials
- `max_concurrent_sessions` (INTEGER) - Max simultaneous logins
- `api_access` (BOOLEAN) - API access for integrations
- `custom_branding` (BOOLEAN) - White-label options

## Querying Plans with Config

### Get All Plans with AI Limits

```sql
SELECT 
  id,
  name,
  price_usd,
  duration_days,
  config->>'ai_messages_per_day' as ai_limit,
  is_active
FROM subscription_plans
ORDER BY display_order;
```

### Find Plans with High AI Limits

```sql
SELECT name, duration_days, config->>'ai_messages_per_day' as ai_limit
FROM subscription_plans
WHERE (config->>'ai_messages_per_day')::INTEGER >= 75
ORDER BY (config->>'ai_messages_per_day')::INTEGER DESC;
```

### Check User's Current AI Limit

```sql
SELECT get_user_ai_limit('user-uuid-here');
```

## Complete Migration Script

Run this complete script to set everything up:

```sql
-- ============================================
-- Subscription Plans AI Configuration Setup
-- ============================================

-- 1. Add config column
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN subscription_plans.config IS 'Technical configuration settings (e.g., {"ai_messages_per_day": 50})';

-- 2. Update all plans with AI limits
UPDATE subscription_plans
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{ai_messages_per_day}',
  CASE 
    WHEN duration_days = 0 OR name ILIKE '%trial%' THEN to_jsonb(10)
    WHEN duration_days IN (30, 60) THEN to_jsonb(50)
    WHEN duration_days = 90 THEN to_jsonb(75)
    WHEN duration_days = 120 THEN to_jsonb(100)
    ELSE to_jsonb(10)
  END
);

-- 3. Create RPC function
CREATE OR REPLACE FUNCTION get_user_ai_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ai_limit INTEGER;
BEGIN
  SELECT COALESCE(
    (sp.config->>'ai_messages_per_day')::INTEGER,
    10
  ) INTO ai_limit
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = user_id_param
    AND s.status = 'active'
    AND (s.end_date IS NULL OR s.end_date > NOW())
  ORDER BY s.end_date DESC NULLS FIRST
  LIMIT 1;
  
  IF ai_limit IS NULL THEN
    ai_limit := 10;
  END IF;
  
  RETURN ai_limit;
END;
$$;

COMMENT ON FUNCTION get_user_ai_limit(UUID) IS 'Returns daily AI message limit for a user based on their active subscription plan';

-- 4. Verify the setup
SELECT 
  name,
  duration_days,
  price_usd,
  config->>'ai_messages_per_day' as ai_limit,
  array_length(features, 1) as feature_count,
  is_active
FROM subscription_plans
ORDER BY display_order;

-- Done!
```

## Verification

After running the migration, verify everything works:

```sql
-- 1. Check all plans have AI limits
SELECT name, config->>'ai_messages_per_day' as ai_limit
FROM subscription_plans;

-- 2. Test the RPC function with a test user
SELECT get_user_ai_limit('test-user-uuid');

-- 3. Verify config structure
SELECT name, jsonb_pretty(config) as config_json
FROM subscription_plans;
```

## Admin Panel Integration (Future Enhancement)

You can create an admin UI to manage plans:

```typescript
// Example: Update AI limit via admin API
const updateAILimit = async (planId: string, newLimit: number) => {
  const { error } = await supabase
    .from('subscription_plans')
    .update({
      config: supabase.raw(`
        jsonb_set(
          COALESCE(config, '{}'::jsonb),
          '{ai_messages_per_day}',
          to_jsonb(${newLimit})
        )
      `)
    })
    .eq('id', planId);
};
```

## Best Practices

1. **Always use config for technical settings** - Keep user-facing descriptions in `features` array
2. **Set reasonable AI limits** - Monitor costs and adjust based on usage patterns
3. **Test before deploying** - Verify limits work correctly with test users
4. **Document changes** - Keep track of when and why limits were changed
5. **Monitor usage** - Use `ai_usage_stats` table to track daily consumption
6. **Gradual increases** - Don't jump from 50 to 200 messages/day suddenly
7. **Consider costs** - Each AI message costs ~$0.001-0.003 (Gemini pricing)

## Troubleshooting

### User not getting correct limit

```sql
-- Check user's active subscription
SELECT s.*, sp.name, sp.config->>'ai_messages_per_day'
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.user_id = 'user-uuid'
AND s.status = 'active';
```

### Function returns wrong value

```sql
-- Test function with detailed output
SELECT 
  s.user_id,
  sp.name,
  sp.config,
  sp.config->>'ai_messages_per_day' as raw_limit,
  (sp.config->>'ai_messages_per_day')::INTEGER as casted_limit,
  get_user_ai_limit(s.user_id) as function_result
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.user_id = 'user-uuid';
```

### Config not updating

```sql
-- Force update with explicit JSONB
UPDATE subscription_plans
SET config = '{"ai_messages_per_day": 60}'::jsonb
WHERE id = 'plan-uuid';
```

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Database:** PostgreSQL with Supabase
