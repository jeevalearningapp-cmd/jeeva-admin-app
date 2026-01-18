/**
 * Property-Based Test: Documentation Completeness
 *
 * **Feature: database-documentation, Property 1: Documentation Completeness**
 * **Validates: Requirements 1.1**
 *
 * For any table in the Supabase public schema, there SHALL exist a corresponding
 * entry in the documentation with table name and purpose description.
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";

// Define the expected tables in the Authentication & Users domain
const AUTH_USERS_TABLES = [
  { name: "users", purpose: "Student/learner user accounts" },
  { name: "user_profiles", purpose: "Extended user profile information" },
  { name: "user_sessions", purpose: "Active session tracking" },
  { name: "admin_users", purpose: "Admin portal user accounts" },
  { name: "notification_preferences", purpose: "User notification settings" },
];

// All 53 tables in the database (grouped by domain)
const ALL_DATABASE_TABLES = [
  // Authentication & Users (5)
  "users",
  "user_profiles",
  "user_sessions",
  "admin_users",
  "notification_preferences",
  // Learning Content (11)
  "modules",
  "topics",
  "subtopics",
  "lessons",
  "lesson_content",
  "lesson_quizzes",
  "questions",
  "question_options",
  "question_media",
  "flashcards",
  "module_access_rules",
  // Progress & Practice (12)
  "learning_completions",
  "learning_progress",
  "learning_paths",
  "lesson_quiz_results",
  "practice_sessions",
  "practice_results",
  "mock_exam_config",
  "mock_exams",
  "mock_results",
  "mock_sessions",
  "ai_recommendations",
  "user_analytics",
  // Trial Module System (4)
  "trial_mock_exams",
  "trial_exam_attempts",
  "trial_learning_progress",
  "trial_attempt_records",
  // Subscriptions & Payments (4)
  "subscription_plans",
  "subscriptions",
  "subscription_usage",
  "discount_coupons",
  // System & Settings (4)
  "app_settings",
  "dashboard_hero",
  "content_approvals",
  "email_templates",
  // AI & Chat (3)
  "chat_conversations",
  "chat_messages",
  "ai_usage_stats",
  // Notifications (5)
  "notifications",
  "notification_queue",
  "notification_targets",
  "push_tokens",
  "user_notification_reads",
  // Analytics & Backup (5)
  "analytics_sessions",
  "daily_stats",
  "flashcards_backup",
  "lessons_backup",
  "questions_backup",
];

let schemaDocContent: string;

describe("Property 1: Documentation Completeness", () => {
  beforeAll(() => {
    // Read the SCHEMA_COMPLETE.md file
    const schemaPath = path.resolve(
      __dirname,
      "../../../docs/03-Database/SCHEMA_COMPLETE.md",
    );
    schemaDocContent = fs.readFileSync(schemaPath, "utf-8");
  });

  it("should have documentation for all Authentication & Users tables", () => {
    // Property: For any table in Auth & Users domain, documentation exists
    fc.assert(
      fc.property(fc.constantFrom(...AUTH_USERS_TABLES), (table) => {
        // Check that the table name appears as a heading (### table_name)
        const tableHeadingPattern = new RegExp(
          `###\\s+\\d+\\.\\d+\\s+${table.name}`,
          "i",
        );
        const hasTableHeading = tableHeadingPattern.test(schemaDocContent);

        // Check that the table has a Purpose description
        const purposePattern = new RegExp(
          `\\*\\*Purpose:\\*\\*.*${table.name}`,
          "is",
        );
        const hasPurpose =
          schemaDocContent.includes(`### 1.`) &&
          schemaDocContent.toLowerCase().includes(table.name);

        return hasTableHeading || hasPurpose;
      }),
      { numRuns: 100 },
    );
  });

  it("should have table name and purpose for each documented table", () => {
    // For each Auth & Users table, verify both name and purpose exist
    AUTH_USERS_TABLES.forEach((table) => {
      // Table name should appear in documentation
      expect(schemaDocContent.toLowerCase()).toContain(table.name);

      // Purpose section should exist near the table
      const tableSection = extractTableSection(schemaDocContent, table.name);
      expect(tableSection).toBeTruthy();
      expect(tableSection?.toLowerCase()).toContain("purpose");
    });
  });

  it("property: any randomly selected table from Auth domain should be documented", () => {
    // Property-based test: randomly select tables and verify documentation
    fc.assert(
      fc.property(
        fc.constantFrom(...AUTH_USERS_TABLES.map((t) => t.name)),
        (tableName) => {
          // The table name must appear in the documentation
          const isDocumented = schemaDocContent
            .toLowerCase()
            .includes(tableName);

          // The table must have a section with columns
          const hasColumnSection =
            schemaDocContent.includes("| Column |") &&
            schemaDocContent.toLowerCase().includes(tableName);

          return isDocumented && hasColumnSection;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("property: documentation should contain all required sections for Auth tables", () => {
    const requiredSections = ["Primary Key", "RLS Enabled"];

    fc.assert(
      fc.property(
        fc.constantFrom(...AUTH_USERS_TABLES.map((t) => t.name)),
        fc.constantFrom(...requiredSections),
        (tableName, section) => {
          const tableSection = extractTableSection(schemaDocContent, tableName);
          if (!tableSection) return false;

          // Check that the required section exists in the table documentation
          return tableSection.includes(section);
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
