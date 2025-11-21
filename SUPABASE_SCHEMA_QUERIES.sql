-- =====================================================
-- SUPABASE DATABASE EXPLORATION QUERIES
-- =====================================================
-- Run these queries in Supabase SQL Editor to explore your database

-- =====================================================
-- 1. LIST ALL TABLES IN PUBLIC SCHEMA
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;


-- =====================================================
-- 2. SHOW ALL COLUMNS/FIELDS IN EACH TABLE
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- =====================================================
-- 3. SHOW TABLE DETAILS WITH PRIMARY KEYS
-- =====================================================
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    CASE WHEN pk.constraint_name IS NOT NULL THEN 'PRIMARY KEY' ELSE '' END as constraint_type,
    c.is_nullable
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name AND tc.constraint_type = 'PRIMARY KEY'
LEFT JOIN information_schema.key_column_usage pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name AND pk.constraint_name = tc.constraint_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;


-- =====================================================
-- 4. SHOW ALL FOREIGN KEY RELATIONSHIPS
-- =====================================================
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table_name,
    ccu.column_name AS referenced_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;


-- =====================================================
-- 5. SHOW ALL UNIQUE CONSTRAINTS
-- =====================================================
SELECT 
    constraint_name,
    table_name,
    column_name
FROM information_schema.constraint_column_usage
WHERE table_schema = 'public' 
    AND constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' AND table_schema = 'public'
    )
ORDER BY table_name, constraint_name;


-- =====================================================
-- 6. SHOW DETAILED TABLE STRUCTURE (WITH INDEXES)
-- =====================================================
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    CASE WHEN pk.constraint_name IS NOT NULL THEN TRUE ELSE FALSE END as is_primary_key,
    CASE WHEN ix.indexname IS NOT NULL THEN TRUE ELSE FALSE END as has_index
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN information_schema.table_constraints pk ON t.table_name = pk.table_name AND pk.constraint_type = 'PRIMARY KEY' AND c.column_name = pk.constraint_name
LEFT JOIN pg_indexes ix ON t.table_name = ix.tablename AND c.column_name = split_part(ix.indexdef, ' ', -1)
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;


-- =====================================================
-- 7. COUNT ROWS IN EACH TABLE
-- =====================================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.tables it WHERE it.table_name = t.table_name AND it.table_schema = 'public') as count
FROM information_schema.tables t
WHERE t.table_schema = 'public'
ORDER BY table_name;


-- =====================================================
-- 8. GET TABLE SIZE AND ROW COUNT
-- =====================================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tablename) as row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


-- =====================================================
-- 9. SHOW ALL INDEXES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- =====================================================
-- 10. JEEVA LEARNING SPECIFIC - USER TABLES
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('user_profiles', 'admin_users', 'auth_users')
ORDER BY table_name, ordinal_position;


-- =====================================================
-- 11. JEEVA LEARNING SPECIFIC - CONTENT TABLES
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('modules', 'topics', 'lessons', 'questions', 'flashcards', 'answers')
ORDER BY table_name, ordinal_position;


-- =====================================================
-- 12. JEEVA LEARNING SPECIFIC - PAYMENT TABLES
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('payments', 'subscriptions', 'subscription_plans', 'payment_refunds', 'discount_coupons')
ORDER BY table_name, ordinal_position;


-- =====================================================
-- 13. JEEVA LEARNING SPECIFIC - NOTIFICATION TABLES
-- =====================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('notifications', 'notification_targets', 'notification_queue', 'push_tokens', 'user_notification_reads', 'notification_preferences')
ORDER BY table_name, ordinal_position;


-- =====================================================
-- 14. SHOW ALL TABLE RELATIONSHIPS IN JSON FORMAT
-- =====================================================
SELECT 
    json_agg(json_build_object(
        'table', tc.table_name,
        'foreign_key', kcu.column_name,
        'references', json_build_object(
            'table', ccu.table_name,
            'column', ccu.column_name
        )
    )) as relationships
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';


-- =====================================================
-- 15. EXPORT TABLE STRUCTURE AS CREATE STATEMENTS
-- =====================================================
SELECT 
    table_name,
    string_agg(
        column_name || ' ' || data_type || 
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
        ORDER BY ordinal_position
    ) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;


-- =====================================================
-- HOW TO USE THESE QUERIES
-- =====================================================
/*
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste any of the above queries
5. Click "Run" to execute
6. View results in the output panel

RECOMMENDED QUERIES TO START:
- Query #1: List all tables
- Query #2: Show all columns
- Query #4: Show relationships
- Query #14: Show relationships in JSON format

For specific table exploration:
- Query #10-13: View Jeeva Learning specific tables
*/
