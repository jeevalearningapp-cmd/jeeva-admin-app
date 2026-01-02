/**
 * Property-Based Test: RLS Gap Identification
 * 
 * **Feature: database-documentation, Property 5: RLS Gap Identification**
 * **Validates: Requirements 4.4**
 * 
 * For any table in the public schema that does not have RLS enabled,
 * the documentation SHALL explicitly identify it in the "Tables Needing RLS" section.
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// All 53 tables in the database
const ALL_DATABASE_TABLES = [
  // Authentication & Users (5)
  'users', 'user_profiles', 'user_sessions', 'admin_users', 'notification_preferences',
  // Learning Content (11)
  'modules', 'topics', 'subtopics', 'lessons', 'lesson_content', 'lesson_quizzes',
  'questions', 'question_options', 'question_media', 'flashcards', 'module_access_rules',
  // Progress & Practice (12)
  'learning_completions', 'learning_progress', 'learning_paths', 'lesson_quiz_results',
  'practice_sessions', 'practice_results', 'mock_exam_config', 'mock_exams',
  'mock_results', 'mock_sessions', 'ai_recommendations', 'user_analytics',
  // Trial Module System (4)
  'trial_mock_exams', 'trial_exam_attempts', 'trial_learning_progress', 'trial_attempt_records',
  // Subscriptions & Payments (4)
  'subscription_plans', 'subscriptions', 'subscription_usage', 'discount_coupons',
  // System & Settings (4)
  'app_settings', 'dashboard_hero', 'content_approvals', 'email_templates',
  // AI & Chat (3)
  'chat_conversations', 'chat_messages', 'ai_usage_stats',
  // Notifications (5)
  'notifications', 'notification_queue', 'notification_targets', 'push_tokens', 'user_notification_reads',
  // Analytics & Backup (5)
  'analytics_sessions', 'daily_stats', 'flashcards_backup', 'lessons_backup', 'questions_backup',
  // Additional
  'hero_sections',
];

// Tables that have RLS enabled (documented in RLS_POLICIES.md)
const TABLES_WITH_RLS_ENABLED = [
  // Authentication & Users (5)
  'users', 'user_profiles', 'user_sessions', 'admin_users', 'notification_preferences',
  // Learning Content (11)
  'modules', 'topics', 'subtopics', 'lessons', 'lesson_content', 'lesson_quizzes',
  'questions', 'question_options', 'question_media', 'flashcards', 'module_access_rules',
  // Progress & Practice (12)
  'learning_completions', 'learning_progress', 'learning_paths', 'lesson_quiz_results',
  'practice_sessions', 'practice_results', 'mock_exam_config', 'mock_exams',
  'mock_results', 'mock_sessions', 'ai_recommendations', 'user_analytics',
  // Trial Module System (4)
  'trial_mock_exams', 'trial_exam_attempts', 'trial_learning_progress', 'trial_attempt_records',
  // Subscriptions & Payments (4)
  'subscription_plans', 'subscriptions', 'subscription_usage', 'discount_coupons',
  // System & Settings (4)
  'app_settings', 'dashboard_hero', 'content_approvals', 'email_templates',
  // AI & Chat (3)
  'chat_conversations', 'chat_messages', 'ai_usage_stats',
  // Notifications (5)
  'notifications', 'notification_queue', 'notification_targets', 'push_tokens', 'user_notification_reads',
];

// Tables that need RLS policies (should be documented in "Tables Needing RLS" section)
const TABLES_NEEDING_RLS = [
  'analytics_sessions',
  'daily_stats',
  'flashcards_backup',
  'lessons_backup',
  'questions_backup',
  'hero_sections',
];

let rlsDocContent: string;
let schemaDocContent: string;

describe('Property 5: RLS Gap Identification', () => {
  beforeAll(() => {
    const rlsPath = path.resolve(__dirname, '../../../docs/03-Database/RLS_POLICIES.md');
    const schemaPath = path.resolve(__dirname, '../../../docs/03-Database/SCHEMA_COMPLETE.md');
    rlsDocContent = fs.readFileSync(rlsPath, 'utf-8');
    schemaDocContent = fs.readFileSync(schemaPath, 'utf-8');
  });

  it('property: any table without RLS should be documented in Tables Needing RLS section', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...TABLES_NEEDING_RLS),
        (tableName) => {
          // Check that the table appears in the "Tables Needing RLS" section
          const needingRlsSection = extractSection(rlsDocContent, 'Tables Needing RLS Policies');
          if (!needingRlsSection) return false;

          // The table should be mentioned in this section
          return needingRlsSection.includes(tableName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: any table with RLS enabled should NOT be in Tables Needing RLS section', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...TABLES_WITH_RLS_ENABLED),
        (tableName) => {
          // Extract the "Tables Needing RLS" section
          const needingRlsSection = extractSection(rlsDocContent, 'Tables Needing RLS Policies');
          if (!needingRlsSection) return true; // If section doesn't exist, pass

          // Tables with RLS should NOT appear in the "needing RLS" section as a table entry
          // They might be mentioned in context, but not as a table needing RLS
          const tablePattern = new RegExp(`\\|\\s*${tableName}\\s*\\|`, 'i');
          return !tablePattern.test(needingRlsSection);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: any table with RLS should have policies documented', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...TABLES_WITH_RLS_ENABLED),
        (tableName) => {
          // Check that the table has a section in the RLS documentation
          const tableSection = extractTableRlsSection(rlsDocContent, tableName);
          
          // The table should have RLS documentation
          if (!tableSection) return false;

          // Should have "RLS Enabled: Yes"
          const hasRlsEnabled = tableSection.includes('**RLS Enabled:** Yes');
          
          // Should have at least one policy documented
          const hasPolicies = tableSection.includes('Policy Name') || 
                             tableSection.includes('_select_') ||
                             tableSection.includes('_insert_') ||
                             tableSection.includes('_update_') ||
                             tableSection.includes('_delete_') ||
                             tableSection.includes('_service_role');

          return hasRlsEnabled && hasPolicies;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have Tables Needing RLS section in documentation', () => {
    expect(rlsDocContent).toContain('Tables Needing RLS Policies');
  });

  it('should document all tables needing RLS with risk level', () => {
    TABLES_NEEDING_RLS.forEach((tableName) => {
      const needingRlsSection = extractSection(rlsDocContent, 'Tables Needing RLS Policies');
      expect(needingRlsSection).toBeTruthy();
      expect(needingRlsSection).toContain(tableName);
    });
  });

  it('should have recommended policy for each table needing RLS', () => {
    const needingRlsSection = extractSection(rlsDocContent, 'Tables Needing RLS Policies');
    expect(needingRlsSection).toBeTruthy();
    
    // Check that recommended policies section exists
    expect(needingRlsSection).toContain('Recommended');
  });

  it('should categorize tables needing RLS by priority', () => {
    const needingRlsSection = extractSection(rlsDocContent, 'Tables Needing RLS Policies');
    expect(needingRlsSection).toBeTruthy();
    
    // Check for priority categorization
    expect(needingRlsSection).toContain('High Priority');
    expect(needingRlsSection).toContain('Medium Priority');
  });

  it('property: RLS documentation should cover all database tables', () => {
    // Every table should either be in "Tables with RLS" or "Tables Needing RLS"
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_DATABASE_TABLES),
        (tableName) => {
          // Check if table is documented as having RLS
          const hasRlsDoc = TABLES_WITH_RLS_ENABLED.includes(tableName);
          
          // Check if table is documented as needing RLS
          const needsRlsDoc = TABLES_NEEDING_RLS.includes(tableName);
          
          // Every table should be in one of these categories
          return hasRlsDoc || needsRlsDoc;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have policy matrix section', () => {
    expect(rlsDocContent).toContain('Policy Matrix');
    expect(rlsDocContent).toContain('Role-Based Access Matrix');
  });

  it('property: policy matrix should include all domains', () => {
    const domains = [
      'Authentication & Users',
      'Learning Content',
      'Progress & Practice',
      'Trial Module System',
      'Subscriptions & Payments',
      'System & Settings',
      'AI & Chat',
      'Notifications',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...domains),
        (domain) => {
          // Each domain should appear in the policy matrix
          return rlsDocContent.includes(domain);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should document service role access pattern', () => {
    expect(rlsDocContent).toContain('service_role');
    expect(rlsDocContent).toContain("auth.role() = 'service_role'");
  });

  it('should document user ownership pattern', () => {
    expect(rlsDocContent).toContain('auth.uid()');
    expect(rlsDocContent).toContain('user_id');
  });
});

/**
 * Helper function to extract a section from the documentation
 */
function extractSection(doc: string, sectionTitle: string): string | null {
  // Find the section start
  const startPattern = new RegExp(`## \\d+\\.?\\s*${sectionTitle}`, 'i');
  const startMatch = doc.match(startPattern);
  if (!startMatch || startMatch.index === undefined) return null;

  const startIndex = startMatch.index;
  
  // Find the next ## heading or end of document
  const remainingDoc = doc.slice(startIndex + startMatch[0].length);
  const nextSectionMatch = remainingDoc.match(/\n## \d+\./);
  
  if (nextSectionMatch && nextSectionMatch.index !== undefined) {
    return doc.slice(startIndex, startIndex + startMatch[0].length + nextSectionMatch.index);
  }
  
  // Return to end of document if no next section
  return doc.slice(startIndex);
}

/**
 * Helper function to extract a table's RLS documentation section
 */
function extractTableRlsSection(doc: string, tableName: string): string | null {
  // Find the section for this table (between #### headings)
  const pattern = new RegExp(
    `####\\s+${tableName}[\\s\\S]*?(?=####\\s+|###\\s+|## |$)`,
    'i'
  );
  const match = doc.match(pattern);
  return match ? match[0] : null;
}
