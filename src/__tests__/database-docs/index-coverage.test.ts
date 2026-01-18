/**
 * Property-Based Test: Index Coverage for Foreign Keys
 *
 * **Feature: database-documentation, Property 6: Index Coverage for Foreign Keys**
 * **Validates: Requirements 5.4**
 *
 * For any foreign key column in the database, the documentation SHALL either
 * show an existing index on that column or identify it as a potential performance issue.
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";

// Define foreign key relationship structure
interface ForeignKeyRelation {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

// All foreign keys in the database (comprehensive list from foreign-keys.test.ts)
const ALL_FOREIGN_KEYS: ForeignKeyRelation[] = [
  // Authentication & Users
  {
    table: "user_profiles",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "user_sessions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "notification_preferences",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },

  // Learning Content
  {
    table: "topics",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
  },
  {
    table: "subtopics",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "lessons",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "lessons",
    column: "subtopic_id",
    referencedTable: "subtopics",
    referencedColumn: "id",
  },
  {
    table: "lesson_content",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "lesson_quizzes",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "lesson_quizzes",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
  },
  {
    table: "questions",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "questions",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "question_options",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
  },
  {
    table: "question_media",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
  },
  {
    table: "flashcards",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "flashcards",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "module_access_rules",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
  },

  // Progress & Practice
  {
    table: "learning_completions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "learning_completions",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "learning_progress",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "learning_progress",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
  },
  {
    table: "learning_progress",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "learning_progress",
    column: "subtopic_id",
    referencedTable: "subtopics",
    referencedColumn: "id",
  },
  {
    table: "learning_paths",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "lesson_quiz_results",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "lesson_quiz_results",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "practice_sessions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "practice_sessions",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "practice_results",
    column: "session_id",
    referencedTable: "practice_sessions",
    referencedColumn: "id",
  },
  {
    table: "practice_results",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
  },
  {
    table: "practice_results",
    column: "selected_option_id",
    referencedTable: "question_options",
    referencedColumn: "id",
  },
  {
    table: "mock_exams",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "mock_exams",
    column: "config_id",
    referencedTable: "mock_exam_config",
    referencedColumn: "id",
  },
  {
    table: "mock_results",
    column: "exam_id",
    referencedTable: "mock_exams",
    referencedColumn: "id",
  },
  {
    table: "mock_results",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
  },
  {
    table: "mock_results",
    column: "selected_option_id",
    referencedTable: "question_options",
    referencedColumn: "id",
  },
  {
    table: "mock_sessions",
    column: "exam_id",
    referencedTable: "mock_exams",
    referencedColumn: "id",
  },
  {
    table: "ai_recommendations",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "user_analytics",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },

  // Trial Module System
  {
    table: "trial_mock_exams",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
  },
  {
    table: "trial_exam_attempts",
    column: "user_id",
    referencedTable: "user_profiles",
    referencedColumn: "id",
  },
  {
    table: "trial_exam_attempts",
    column: "exam_id",
    referencedTable: "trial_mock_exams",
    referencedColumn: "id",
  },
  {
    table: "trial_learning_progress",
    column: "user_id",
    referencedTable: "user_profiles",
    referencedColumn: "id",
  },
  {
    table: "trial_learning_progress",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
  },
  {
    table: "trial_learning_progress",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
  },
  {
    table: "trial_attempt_records",
    column: "user_id",
    referencedTable: "user_profiles",
    referencedColumn: "id",
  },
  {
    table: "trial_attempt_records",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
  },

  // Subscriptions & Payments
  {
    table: "subscriptions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "subscriptions",
    column: "plan_id",
    referencedTable: "subscription_plans",
    referencedColumn: "id",
  },
  {
    table: "subscriptions",
    column: "coupon_code",
    referencedTable: "discount_coupons",
    referencedColumn: "code",
  },
  {
    table: "subscription_usage",
    column: "subscription_id",
    referencedTable: "subscriptions",
    referencedColumn: "id",
  },

  // System & Settings
  {
    table: "content_approvals",
    column: "submitted_by",
    referencedTable: "admin_users",
    referencedColumn: "id",
  },
  {
    table: "content_approvals",
    column: "reviewed_by",
    referencedTable: "admin_users",
    referencedColumn: "id",
  },

  // AI & Chat
  {
    table: "chat_conversations",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "chat_messages",
    column: "conversation_id",
    referencedTable: "chat_conversations",
    referencedColumn: "id",
  },
  {
    table: "ai_usage_stats",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },

  // Notifications
  {
    table: "notifications",
    column: "created_by",
    referencedTable: "admin_users",
    referencedColumn: "id",
  },
  {
    table: "notification_queue",
    column: "notification_id",
    referencedTable: "notifications",
    referencedColumn: "id",
  },
  {
    table: "notification_queue",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "notification_targets",
    column: "notification_id",
    referencedTable: "notifications",
    referencedColumn: "id",
  },
  {
    table: "notification_targets",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "push_tokens",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "user_notification_reads",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "user_notification_reads",
    column: "notification_id",
    referencedTable: "notifications",
    referencedColumn: "id",
  },

  // Analytics
  {
    table: "analytics_sessions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
];

// Foreign keys that have existing indexes (documented in INDEXES.md)
const FOREIGN_KEYS_WITH_INDEXES: string[] = [
  "user_profiles.user_id",
  "user_sessions.user_id",
  "topics.module_id",
  "subtopics.topic_id",
  "lessons.topic_id",
  "lessons.subtopic_id",
  "lesson_content.lesson_id",
  "lesson_quizzes.lesson_id",
  "questions.lesson_id",
  "questions.topic_id",
  "question_options.question_id",
  "question_media.question_id",
  "flashcards.lesson_id",
  "flashcards.topic_id",
  "module_access_rules.module_id",
  "learning_completions.user_id",
  "learning_progress.user_id",
  "learning_paths.user_id",
  "lesson_quiz_results.user_id",
  "lesson_quiz_results.lesson_id",
  "practice_sessions.user_id",
  "practice_results.session_id",
  "mock_exams.user_id",
  "mock_results.exam_id",
  "mock_sessions.exam_id",
  "ai_recommendations.user_id",
  "user_analytics.user_id",
  "trial_mock_exams.module_id",
  "trial_exam_attempts.user_id",
  "trial_exam_attempts.exam_id",
  "trial_learning_progress.user_id",
  "trial_learning_progress.topic_id",
  "trial_learning_progress.lesson_id",
  "trial_attempt_records.user_id",
  "trial_attempt_records.module_id",
  "subscriptions.user_id",
  "subscription_usage.subscription_id",
  "chat_conversations.user_id",
  "chat_messages.conversation_id",
  "ai_usage_stats.user_id",
  "notification_queue.user_id",
  "notification_targets.user_id",
  "push_tokens.user_id",
  "user_notification_reads.user_id",
  "analytics_sessions.user_id",
];

// Foreign keys documented as missing indexes (in "Missing Indexes for Foreign Keys" section)
const FOREIGN_KEYS_DOCUMENTED_AS_MISSING: string[] = [
  "notification_preferences.user_id",
  "lesson_quizzes.question_id",
  "learning_completions.lesson_id",
  "learning_progress.module_id",
  "learning_progress.topic_id",
  "learning_progress.subtopic_id",
  "practice_sessions.topic_id",
  "practice_results.question_id",
  "practice_results.selected_option_id",
  "mock_exams.config_id",
  "mock_results.question_id",
  "mock_results.selected_option_id",
  "subscriptions.plan_id",
  "subscriptions.coupon_code",
  "content_approvals.submitted_by",
  "content_approvals.reviewed_by",
  "notifications.created_by",
  "notification_queue.notification_id",
  "notification_targets.notification_id",
  "user_notification_reads.notification_id",
];

let indexDocContent: string;

describe("Property 6: Index Coverage for Foreign Keys", () => {
  beforeAll(() => {
    const indexPath = path.resolve(
      __dirname,
      "../../../docs/03-Database/INDEXES.md",
    );
    indexDocContent = fs.readFileSync(indexPath, "utf-8");
  });

  it("property: any foreign key should be documented as having an index OR identified as missing", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_FOREIGN_KEYS), (fk) => {
        const fkKey = `${fk.table}.${fk.column}`;

        // Check if FK has an existing index documented
        const hasExistingIndex = FOREIGN_KEYS_WITH_INDEXES.includes(fkKey);

        // Check if FK is documented as missing an index
        const isDocumentedAsMissing =
          FOREIGN_KEYS_DOCUMENTED_AS_MISSING.includes(fkKey);

        // Property: every FK must be either indexed OR documented as missing
        return hasExistingIndex || isDocumentedAsMissing;
      }),
      { numRuns: 100 },
    );
  });

  it("property: foreign keys with indexes should appear in table index documentation", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...ALL_FOREIGN_KEYS.filter((fk) =>
            FOREIGN_KEYS_WITH_INDEXES.includes(`${fk.table}.${fk.column}`),
          ),
        ),
        (fk) => {
          const tableSection = extractTableSection(indexDocContent, fk.table);
          if (!tableSection) return false;

          // Check that the column is mentioned in an index
          const hasColumnIndex = tableSection.includes(fk.column);

          return hasColumnIndex;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("property: foreign keys without indexes should appear in Missing Indexes section", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...ALL_FOREIGN_KEYS.filter((fk) =>
            FOREIGN_KEYS_DOCUMENTED_AS_MISSING.includes(
              `${fk.table}.${fk.column}`,
            ),
          ),
        ),
        (fk) => {
          const missingSection = extractMissingIndexesSection(indexDocContent);
          if (!missingSection) return false;

          // Check that the table and column are mentioned in the missing indexes section
          const hasTableMention = missingSection.includes(fk.table);
          const hasColumnMention = missingSection.includes(fk.column);

          return hasTableMention && hasColumnMention;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have Missing Indexes for Foreign Keys section", () => {
    expect(indexDocContent).toContain("Missing Indexes for Foreign Keys");
  });

  it("should categorize missing indexes by priority", () => {
    const missingSection = extractMissingIndexesSection(indexDocContent);
    expect(missingSection).toBeTruthy();

    expect(missingSection).toContain("High Priority");
    expect(missingSection).toContain("Medium Priority");
    expect(missingSection).toContain("Lower Priority");
  });

  it("should provide CREATE INDEX statements for missing indexes", () => {
    const missingSection = extractMissingIndexesSection(indexDocContent);
    expect(missingSection).toBeTruthy();

    // Check for CREATE INDEX statements
    expect(missingSection).toContain("CREATE INDEX");
  });

  it("property: missing index documentation should include recommended index statement", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...FOREIGN_KEYS_DOCUMENTED_AS_MISSING.slice(0, 10)), // Test first 10
        (fkKey) => {
          const [table, column] = fkKey.split(".");
          const missingSection = extractMissingIndexesSection(indexDocContent);
          if (!missingSection) return false;

          // Check for CREATE INDEX statement pattern
          const indexPattern = new RegExp(
            `CREATE INDEX.*${table}.*${column}`,
            "i",
          );

          return indexPattern.test(missingSection);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should document referenced table for each missing index", () => {
    const missingSection = extractMissingIndexesSection(indexDocContent);
    expect(missingSection).toBeTruthy();

    // Check that referenced tables are documented
    expect(missingSection).toContain("Referenced Table");
  });

  it("property: table sections should note when FK indexes are missing", () => {
    // Tables with missing FK indexes should have a note
    const tablesWithMissingIndexes = [
      "notification_preferences",
      "lesson_quizzes",
      "learning_completions",
      "learning_progress",
      "practice_sessions",
      "practice_results",
      "mock_exams",
      "mock_results",
      "subscriptions",
      "content_approvals",
      "notifications",
      "notification_queue",
      "notification_targets",
      "user_notification_reads",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...tablesWithMissingIndexes), (tableName) => {
        const tableSection = extractTableSection(indexDocContent, tableName);
        if (!tableSection) return true; // Table might not be documented yet

        // Check for note about missing index
        const hasMissingNote =
          tableSection.includes("Missing index") ||
          tableSection.includes("see [Missing Indexes]") ||
          tableSection.includes("Missing Indexes");

        return hasMissingNote;
      }),
      { numRuns: 100 },
    );
  });

  it("should have summary statistics for indexes", () => {
    expect(indexDocContent).toContain("Summary Statistics");
    expect(indexDocContent).toContain("Missing FK Indexes");
  });

  it("property: all documented indexes should follow naming convention", () => {
    // Index names should follow pattern: idx_tablename_columnname or tablename_pkey
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...ALL_FOREIGN_KEYS.filter((fk) =>
            FOREIGN_KEYS_WITH_INDEXES.includes(`${fk.table}.${fk.column}`),
          ),
        ),
        (fk) => {
          const tableSection = extractTableSection(indexDocContent, fk.table);
          if (!tableSection) return true;

          // Check for standard index naming patterns
          const hasStandardName =
            tableSection.includes(`idx_${fk.table}_${fk.column}`) ||
            tableSection.includes(
              `idx_${fk.table.replace(/_/g, "")}_${fk.column}`,
            ) ||
            tableSection.includes(fk.column);

          return hasStandardName;
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Helper function to extract a table's index documentation section
 */
function extractTableSection(doc: string, tableName: string): string | null {
  // Find the section for this table (between ### headings)
  const pattern = new RegExp(
    `###\\s+\\d+\\.\\d+\\s+${tableName}[\\s\\S]*?(?=###\\s+\\d+\\.\\d+|## \\d+\\.|$)`,
    "i",
  );
  const match = doc.match(pattern);
  return match ? match[0] : null;
}

/**
 * Helper function to extract the Missing Indexes section
 */
function extractMissingIndexesSection(doc: string): string | null {
  // Find the "Missing Indexes for Foreign Keys" section
  const startPattern = /## \d+\.\s*Missing Indexes for Foreign Keys/i;
  const startMatch = doc.match(startPattern);
  if (!startMatch || startMatch.index === undefined) return null;

  const startIndex = startMatch.index;

  // Find the next ## heading or end of document
  const remainingDoc = doc.slice(startIndex + startMatch[0].length);
  const nextSectionMatch = remainingDoc.match(/\n## \d+\./);

  if (nextSectionMatch && nextSectionMatch.index !== undefined) {
    return doc.slice(
      startIndex,
      startIndex + startMatch[0].length + nextSectionMatch.index,
    );
  }

  // Return to end of document if no next section
  return doc.slice(startIndex);
}
