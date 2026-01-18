/**
 * Property-Based Test: Column Detail Accuracy
 *
 * **Feature: database-documentation, Property 2: Column Detail Accuracy**
 * **Validates: Requirements 1.2**
 *
 * For any documented table column, the documented data type, nullability,
 * and default value SHALL match the actual database column metadata.
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";

// Define expected column details for Learning Content domain tables
interface ColumnDetail {
  name: string;
  type: string;
  nullable: "YES" | "NO";
  default: string | null;
}

interface TableSchema {
  name: string;
  columns: ColumnDetail[];
}

// Learning Content domain tables with their expected column details
const LEARNING_CONTENT_TABLES: TableSchema[] = [
  {
    name: "modules",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "title", type: "TEXT", nullable: "NO", default: null },
      { name: "description", type: "TEXT", nullable: "YES", default: null },
      { name: "thumbnail_url", type: "TEXT", nullable: "YES", default: null },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      { name: "is_trial", type: "BOOLEAN", nullable: "YES", default: "false" },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "topics",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "module_id", type: "UUID", nullable: "NO", default: null },
      { name: "title", type: "TEXT", nullable: "NO", default: null },
      { name: "description", type: "TEXT", nullable: "YES", default: null },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      { name: "is_trial", type: "BOOLEAN", nullable: "YES", default: "false" },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "subtopics",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "topic_id", type: "UUID", nullable: "NO", default: null },
      { name: "title", type: "TEXT", nullable: "NO", default: null },
      { name: "description", type: "TEXT", nullable: "YES", default: null },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "lessons",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "topic_id", type: "UUID", nullable: "YES", default: null },
      { name: "subtopic_id", type: "UUID", nullable: "YES", default: null },
      { name: "title", type: "TEXT", nullable: "NO", default: null },
      { name: "content", type: "TEXT", nullable: "YES", default: null },
      { name: "video_url", type: "TEXT", nullable: "YES", default: null },
      { name: "audio_url", type: "TEXT", nullable: "YES", default: null },
      { name: "duration", type: "INTEGER", nullable: "YES", default: null },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      { name: "is_trial", type: "BOOLEAN", nullable: "YES", default: "false" },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "unlock_threshold",
        type: "INTEGER",
        nullable: "YES",
        default: "0",
      },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "lesson_content",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "lesson_id", type: "UUID", nullable: "NO", default: null },
      { name: "content_type", type: "TEXT", nullable: "NO", default: null },
      { name: "content", type: "TEXT", nullable: "YES", default: null },
      { name: "media_url", type: "TEXT", nullable: "YES", default: null },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "questions",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "lesson_id", type: "UUID", nullable: "YES", default: null },
      { name: "topic_id", type: "UUID", nullable: "YES", default: null },
      { name: "question_text", type: "TEXT", nullable: "NO", default: null },
      { name: "question_type", type: "TEXT", nullable: "NO", default: null },
      { name: "difficulty", type: "TEXT", nullable: "NO", default: null },
      { name: "points", type: "INTEGER", nullable: "YES", default: "1" },
      { name: "explanation", type: "TEXT", nullable: "YES", default: null },
      { name: "image_url", type: "TEXT", nullable: "YES", default: null },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      { name: "is_trial", type: "BOOLEAN", nullable: "YES", default: "false" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "question_options",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "question_id", type: "UUID", nullable: "NO", default: null },
      { name: "option_text", type: "TEXT", nullable: "NO", default: null },
      {
        name: "is_correct",
        type: "BOOLEAN",
        nullable: "YES",
        default: "false",
      },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "flashcards",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "lesson_id", type: "UUID", nullable: "YES", default: null },
      { name: "topic_id", type: "UUID", nullable: "YES", default: null },
      { name: "category", type: "TEXT", nullable: "YES", default: null },
      { name: "front", type: "TEXT", nullable: "NO", default: null },
      { name: "back", type: "TEXT", nullable: "NO", default: null },
      { name: "image_url", type: "TEXT", nullable: "YES", default: null },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      { name: "is_trial", type: "BOOLEAN", nullable: "YES", default: "false" },
      { name: "display_order", type: "INTEGER", nullable: "YES", default: "0" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
  {
    name: "module_access_rules",
    columns: [
      {
        name: "id",
        type: "UUID",
        nullable: "NO",
        default: "gen_random_uuid()",
      },
      { name: "module_id", type: "UUID", nullable: "NO", default: null },
      { name: "access_type", type: "TEXT", nullable: "NO", default: null },
      {
        name: "min_subscription_days",
        type: "INTEGER",
        nullable: "YES",
        default: null,
      },
      { name: "is_active", type: "BOOLEAN", nullable: "YES", default: "true" },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP",
        nullable: "YES",
        default: "NOW()",
      },
    ],
  },
];

let schemaDocContent: string;

describe("Property 2: Column Detail Accuracy", () => {
  beforeAll(() => {
    const schemaPath = path.resolve(
      __dirname,
      "../../../docs/03-Database/SCHEMA_COMPLETE.md",
    );
    schemaDocContent = fs.readFileSync(schemaPath, "utf-8");
  });

  it("property: any column in Learning Content tables should have accurate type documentation", () => {
    // Generate all column-table pairs for testing
    const allColumns = LEARNING_CONTENT_TABLES.flatMap((table) =>
      table.columns.map((col) => ({ tableName: table.name, column: col })),
    );

    fc.assert(
      fc.property(fc.constantFrom(...allColumns), ({ tableName, column }) => {
        const tableSection = extractTableSection(schemaDocContent, tableName);
        if (!tableSection) return false;

        // Check that the column name appears in the table section
        const hasColumnName = tableSection.includes(`\`${column.name}\``);

        // Check that the data type is documented correctly
        const hasCorrectType = tableSection.includes(column.type);

        return hasColumnName && hasCorrectType;
      }),
      { numRuns: 100 },
    );
  });

  it("property: any column should have accurate nullability documentation", () => {
    const allColumns = LEARNING_CONTENT_TABLES.flatMap((table) =>
      table.columns.map((col) => ({ tableName: table.name, column: col })),
    );

    fc.assert(
      fc.property(fc.constantFrom(...allColumns), ({ tableName, column }) => {
        const tableSection = extractTableSection(schemaDocContent, tableName);
        if (!tableSection) return false;

        // Find the row for this column in the markdown table
        const columnRowPattern = new RegExp(
          `\\|\\s*\`${column.name}\`\\s*\\|[^|]*\\|\\s*(YES|NO)\\s*\\|`,
          "i",
        );
        const match = tableSection.match(columnRowPattern);

        if (!match) return false;

        // Verify nullability matches
        const documentedNullable = match[1].toUpperCase();
        return documentedNullable === column.nullable;
      }),
      { numRuns: 100 },
    );
  });

  it("property: columns with defaults should have accurate default value documentation", () => {
    const columnsWithDefaults = LEARNING_CONTENT_TABLES.flatMap((table) =>
      table.columns
        .filter((col) => col.default !== null)
        .map((col) => ({ tableName: table.name, column: col })),
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...columnsWithDefaults),
        ({ tableName, column }) => {
          const tableSection = extractTableSection(schemaDocContent, tableName);
          if (!tableSection) return false;

          // Find the row for this column and check default value
          const columnRowPattern = new RegExp(
            `\\|\\s*\`${column.name}\`\\s*\\|[^|]*\\|[^|]*\\|\\s*([^|]*)\\s*\\|`,
            "i",
          );
          const match = tableSection.match(columnRowPattern);

          if (!match) return false;

          // Verify default value is documented (allowing for formatting variations)
          const documentedDefault = match[1].trim().toLowerCase();
          const expectedDefault = column.default!.toLowerCase();

          // Handle common variations in default value formatting
          return (
            documentedDefault.includes(expectedDefault) ||
            documentedDefault === expectedDefault ||
            (expectedDefault === "now()" && documentedDefault.includes("now"))
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should document all columns for each Learning Content table", () => {
    LEARNING_CONTENT_TABLES.forEach((table) => {
      const tableSection = extractTableSection(schemaDocContent, table.name);
      expect(tableSection).toBeTruthy();

      table.columns.forEach((column) => {
        expect(tableSection).toContain(`\`${column.name}\``);
      });
    });
  });

  it("property: column documentation should include all required fields", () => {
    const requiredColumnFields = [
      "Column",
      "Type",
      "Nullable",
      "Default",
      "Description",
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...LEARNING_CONTENT_TABLES.map((t) => t.name)),
        (tableName) => {
          const tableSection = extractTableSection(schemaDocContent, tableName);
          if (!tableSection) return false;

          // Check that the table header contains all required fields
          return requiredColumnFields.every((field) =>
            tableSection.includes(field),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should verify enum constraints are documented for content_type column", () => {
    const tableSection = extractTableSection(
      schemaDocContent,
      "lesson_content",
    );
    expect(tableSection).toBeTruthy();

    // Check that content_type enum values are documented
    const expectedEnumValues = [
      "text",
      "image",
      "video",
      "audio",
      "code",
      "quiz",
    ];
    expectedEnumValues.forEach((value) => {
      expect(tableSection?.toLowerCase()).toContain(value);
    });
  });

  it("should verify enum constraints are documented for question_type column", () => {
    const tableSection = extractTableSection(schemaDocContent, "questions");
    expect(tableSection).toBeTruthy();

    // Check that question_type enum values are documented
    const expectedEnumValues = [
      "multiple_choice",
      "true_false",
      "short_answer",
    ];
    expectedEnumValues.forEach((value) => {
      expect(tableSection?.toLowerCase()).toContain(value);
    });
  });

  it("should verify enum constraints are documented for difficulty column", () => {
    const tableSection = extractTableSection(schemaDocContent, "questions");
    expect(tableSection).toBeTruthy();

    // Check that difficulty enum values are documented
    const expectedEnumValues = ["easy", "medium", "hard"];
    expectedEnumValues.forEach((value) => {
      expect(tableSection?.toLowerCase()).toContain(value);
    });
  });

  it("should verify enum constraints are documented for access_type column", () => {
    const tableSection = extractTableSection(
      schemaDocContent,
      "module_access_rules",
    );
    expect(tableSection).toBeTruthy();

    // Check that access_type enum values are documented
    const expectedEnumValues = ["free", "trial", "subscription", "premium"];
    expectedEnumValues.forEach((value) => {
      expect(tableSection?.toLowerCase()).toContain(value);
    });
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
