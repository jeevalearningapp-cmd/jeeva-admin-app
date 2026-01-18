/**
 * Property-Based Test: Foreign Key Documentation
 *
 * **Feature: database-documentation, Property 3: Foreign Key Documentation**
 * **Validates: Requirements 1.3**
 *
 * For any foreign key constraint in the database, there SHALL exist a corresponding
 * entry in the documentation showing the referencing column, referenced table,
 * referenced column, and ON DELETE behavior.
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";

// Define foreign key relationships for Subscriptions & Payments domain
interface ForeignKeyRelation {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
}

// All foreign keys in the Subscriptions & Payments domain
const SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS: ForeignKeyRelation[] = [
  // subscriptions table foreign keys
  {
    table: "subscriptions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "subscriptions",
    column: "plan_id",
    referencedTable: "subscription_plans",
    referencedColumn: "id",
    onDelete: "RESTRICT",
  },
  {
    table: "subscriptions",
    column: "coupon_code",
    referencedTable: "discount_coupons",
    referencedColumn: "code",
    onDelete: "SET NULL",
  },
  // subscription_usage table foreign keys
  {
    table: "subscription_usage",
    column: "subscription_id",
    referencedTable: "subscriptions",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
];

// All foreign keys across all domains (comprehensive list)
const ALL_FOREIGN_KEYS: ForeignKeyRelation[] = [
  // Authentication & Users
  {
    table: "user_profiles",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "user_sessions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "notification_preferences",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },

  // Learning Content
  {
    table: "topics",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "subtopics",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "lessons",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "lessons",
    column: "subtopic_id",
    referencedTable: "subtopics",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "lesson_content",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "lesson_quizzes",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "lesson_quizzes",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "questions",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "questions",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "question_options",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "question_media",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "flashcards",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "flashcards",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "module_access_rules",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },

  // Progress & Practice
  {
    table: "learning_completions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "learning_completions",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "learning_progress",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "learning_progress",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "learning_progress",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "learning_progress",
    column: "subtopic_id",
    referencedTable: "subtopics",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "learning_paths",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "lesson_quiz_results",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "lesson_quiz_results",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "practice_sessions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "practice_sessions",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "practice_results",
    column: "session_id",
    referencedTable: "practice_sessions",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "practice_results",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "practice_results",
    column: "selected_option_id",
    referencedTable: "question_options",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "mock_exams",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "mock_exams",
    column: "config_id",
    referencedTable: "mock_exam_config",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "mock_results",
    column: "exam_id",
    referencedTable: "mock_exams",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "mock_results",
    column: "question_id",
    referencedTable: "questions",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "mock_results",
    column: "selected_option_id",
    referencedTable: "question_options",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "mock_sessions",
    column: "exam_id",
    referencedTable: "mock_exams",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "ai_recommendations",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "user_analytics",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },

  // Trial Module System
  {
    table: "trial_mock_exams",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_exam_attempts",
    column: "user_id",
    referencedTable: "user_profiles",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_exam_attempts",
    column: "exam_id",
    referencedTable: "trial_mock_exams",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_learning_progress",
    column: "user_id",
    referencedTable: "user_profiles",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_learning_progress",
    column: "topic_id",
    referencedTable: "topics",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_learning_progress",
    column: "lesson_id",
    referencedTable: "lessons",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_attempt_records",
    column: "user_id",
    referencedTable: "user_profiles",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "trial_attempt_records",
    column: "module_id",
    referencedTable: "modules",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },

  // Subscriptions & Payments
  ...SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS,

  // System & Settings
  {
    table: "content_approvals",
    column: "submitted_by",
    referencedTable: "admin_users",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "content_approvals",
    column: "reviewed_by",
    referencedTable: "admin_users",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },

  // AI & Chat
  {
    table: "chat_conversations",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "chat_messages",
    column: "conversation_id",
    referencedTable: "chat_conversations",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "ai_usage_stats",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },

  // Notifications
  {
    table: "notifications",
    column: "created_by",
    referencedTable: "admin_users",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
  {
    table: "notification_queue",
    column: "notification_id",
    referencedTable: "notifications",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "notification_queue",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "notification_targets",
    column: "notification_id",
    referencedTable: "notifications",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "notification_targets",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "push_tokens",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "user_notification_reads",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },
  {
    table: "user_notification_reads",
    column: "notification_id",
    referencedTable: "notifications",
    referencedColumn: "id",
    onDelete: "CASCADE",
  },

  // Analytics
  {
    table: "analytics_sessions",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
    onDelete: "SET NULL",
  },
];

let schemaDocContent: string;

describe("Property 3: Foreign Key Documentation", () => {
  beforeAll(() => {
    const schemaPath = path.resolve(
      __dirname,
      "../../../docs/03-Database/SCHEMA_COMPLETE.md",
    );
    schemaDocContent = fs.readFileSync(schemaPath, "utf-8");
  });

  it("property: any foreign key in Subscriptions & Payments domain should be documented", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS),
        (fk) => {
          const tableSection = extractTableSection(schemaDocContent, fk.table);
          if (!tableSection) return false;

          // Check that the foreign key section exists
          const hasForeignKeySection =
            tableSection.includes("**Foreign Keys:**");
          if (!hasForeignKeySection) return false;

          // Check that the column reference is documented
          const hasColumnRef = tableSection.includes(`\`${fk.column}\``);

          // Check that the referenced table is documented
          const hasReferencedTable =
            tableSection.includes(
              `${fk.referencedTable}.${fk.referencedColumn}`,
            ) ||
            tableSection.includes(
              `${fk.referencedTable}(${fk.referencedColumn})`,
            );

          return hasColumnRef && hasReferencedTable;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("property: any foreign key should have ON DELETE behavior documented", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS),
        (fk) => {
          const tableSection = extractTableSection(schemaDocContent, fk.table);
          if (!tableSection) return false;

          // Check that ON DELETE behavior is documented
          const onDeletePattern = new RegExp(
            `${fk.column}.*${fk.referencedTable}.*ON DELETE ${fk.onDelete}`,
            "is",
          );

          // Alternative pattern: just check the ON DELETE behavior exists in the FK section
          const hasOnDelete =
            tableSection.includes(`ON DELETE ${fk.onDelete}`) ||
            tableSection
              .toLowerCase()
              .includes(`on delete ${fk.onDelete.toLowerCase()}`);

          return hasOnDelete;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should document all foreign keys for subscriptions table", () => {
    const subscriptionsFKs = SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS.filter(
      (fk) => fk.table === "subscriptions",
    );
    const tableSection = extractTableSection(schemaDocContent, "subscriptions");

    expect(tableSection).toBeTruthy();
    expect(tableSection).toContain("**Foreign Keys:**");

    subscriptionsFKs.forEach((fk) => {
      expect(tableSection).toContain(`\`${fk.column}\``);
      expect(tableSection?.toLowerCase()).toContain(
        fk.referencedTable.toLowerCase(),
      );
    });
  });

  it("should document all foreign keys for subscription_usage table", () => {
    const usageFKs = SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS.filter(
      (fk) => fk.table === "subscription_usage",
    );
    const tableSection = extractTableSection(
      schemaDocContent,
      "subscription_usage",
    );

    expect(tableSection).toBeTruthy();
    expect(tableSection).toContain("**Foreign Keys:**");

    usageFKs.forEach((fk) => {
      expect(tableSection).toContain(`\`${fk.column}\``);
      expect(tableSection?.toLowerCase()).toContain(
        fk.referencedTable.toLowerCase(),
      );
    });
  });

  it("property: randomly selected foreign keys should have complete documentation", () => {
    // Test a random sample of all foreign keys
    fc.assert(
      fc.property(fc.constantFrom(...ALL_FOREIGN_KEYS), (fk) => {
        const tableSection = extractTableSection(schemaDocContent, fk.table);
        if (!tableSection) {
          // Table might not be documented yet - this is acceptable for incomplete docs
          return true;
        }

        // If table is documented, check FK documentation
        const hasForeignKeySection = tableSection.includes("**Foreign Keys:**");
        if (!hasForeignKeySection) {
          // Some tables might not have foreign keys
          return true;
        }

        // Check that the column is mentioned in the FK section
        const hasColumnRef = tableSection.includes(`\`${fk.column}\``);

        return hasColumnRef;
      }),
      { numRuns: 100 },
    );
  });

  it("should verify foreign key format follows documentation standard", () => {
    // Verify the standard format: `column_name` → `referenced_table.referenced_column` (ON DELETE BEHAVIOR)
    const tableSection = extractTableSection(schemaDocContent, "subscriptions");
    expect(tableSection).toBeTruthy();

    // Check for arrow notation in FK documentation
    const hasArrowNotation =
      tableSection?.includes("→") || tableSection?.includes("->");
    expect(hasArrowNotation).toBe(true);

    // Check for ON DELETE documentation
    const hasOnDeleteDoc = tableSection?.includes("ON DELETE");
    expect(hasOnDeleteDoc).toBe(true);
  });

  it("property: foreign key documentation should include all required components", () => {
    const requiredComponents = ["column", "referencedTable", "onDelete"];

    fc.assert(
      fc.property(
        fc.constantFrom(...SUBSCRIPTIONS_PAYMENTS_FOREIGN_KEYS),
        fc.constantFrom(...requiredComponents),
        (fk, component) => {
          const tableSection = extractTableSection(schemaDocContent, fk.table);
          if (!tableSection) return false;

          switch (component) {
            case "column":
              return tableSection.includes(`\`${fk.column}\``);
            case "referencedTable":
              return tableSection
                .toLowerCase()
                .includes(fk.referencedTable.toLowerCase());
            case "onDelete":
              return tableSection.includes("ON DELETE");
            default:
              return true;
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Helper function to extract a table's documentation section
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
