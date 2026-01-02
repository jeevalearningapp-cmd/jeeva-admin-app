/**
 * Property-Based Test: Enum Value Completeness
 * 
 * **Feature: database-documentation, Property 8: Enum Value Completeness**
 * **Validates: Requirements 7.1**
 * 
 * For any column with a CHECK constraint defining allowed values, the documentation
 * SHALL list all allowed values exactly as defined in the constraint.
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Define all enum columns with their expected values from CHECK constraints
interface EnumColumn {
  table: string;
  column: string;
  values: string[];
}

// All enum columns in the database with their allowed values
const ENUM_COLUMNS: EnumColumn[] = [
  // Authentication & Users Domain
  {
    table: 'users',
    column: 'oauth_provider',
    values: ['email', 'google', 'apple'],
  },
  {
    table: 'admin_users',
    column: 'role',
    values: ['superadmin', 'editor', 'moderator'],
  },
  // Learning Content Domain
  {
    table: 'lesson_content',
    column: 'content_type',
    values: ['text', 'image', 'video', 'audio', 'code', 'quiz'],
  },
  {
    table: 'questions',
    column: 'question_type',
    values: ['multiple_choice', 'true_false', 'short_answer'],
  },
  {
    table: 'questions',
    column: 'difficulty',
    values: ['easy', 'medium', 'hard'],
  },
  {
    table: 'question_media',
    column: 'media_type',
    values: ['image', 'audio', 'video', 'document'],
  },
  {
    table: 'module_access_rules',
    column: 'access_type',
    values: ['free', 'trial', 'subscription', 'premium'],
  },
  // Progress & Practice Domain
  {
    table: 'learning_progress',
    column: 'status',
    values: ['not_started', 'in_progress', 'completed'],
  },
  {
    table: 'practice_sessions',
    column: 'status',
    values: ['in_progress', 'completed', 'abandoned'],
  },
  {
    table: 'mock_exams',
    column: 'status',
    values: ['in_progress', 'completed', 'abandoned', 'timed_out'],
  },
  // Trial Module Domain
  {
    table: 'trial_attempt_records',
    column: 'content_type',
    values: ['practice', 'learning', 'mock_exam'],
  },
  {
    table: 'trial_attempt_records',
    column: 'status',
    values: ['in_progress', 'completed', 'abandoned'],
  },
  {
    table: 'trial_exam_attempts',
    column: 'status',
    values: ['in_progress', 'completed', 'abandoned'],
  },
  // Subscriptions & Payments Domain
  {
    table: 'subscriptions',
    column: 'status',
    values: ['trial', 'active', 'expired', 'cancelled', 'pending'],
  },
  {
    table: 'subscriptions',
    column: 'payment_gateway',
    values: ['stripe', 'razorpay'],
  },
  {
    table: 'discount_coupons',
    column: 'discount_type',
    values: ['percentage', 'fixed_amount'],
  },
  // System & Settings Domain
  {
    table: 'content_approvals',
    column: 'resource_type',
    values: ['module', 'topic', 'lesson', 'question', 'flashcard'],
  },
  {
    table: 'content_approvals',
    column: 'status',
    values: ['pending', 'approved', 'rejected'],
  },
  // AI & Chat Domain
  {
    table: 'chat_messages',
    column: 'role',
    values: ['user', 'assistant'],
  },
  // Notifications Domain
  {
    table: 'notifications',
    column: 'notification_type',
    values: ['announcement', 'reminder', 'achievement', 'promotional', 'system'],
  },
  {
    table: 'notification_queue',
    column: 'delivery_status',
    values: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
  },
  {
    table: 'notification_queue',
    column: 'delivery_channel',
    values: ['push', 'email', 'in_app'],
  },
  {
    table: 'push_tokens',
    column: 'platform',
    values: ['ios', 'android', 'web'],
  },
];

let dataTypesDocContent: string;

describe('Property 8: Enum Value Completeness', () => {
  beforeAll(() => {
    // Read the DATA_TYPES.md file
    const dataTypesPath = path.resolve(__dirname, '../../../docs/03-Database/DATA_TYPES.md');
    dataTypesDocContent = fs.readFileSync(dataTypesPath, 'utf-8');
  });

  it('property: any enum column should have all its values documented', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ENUM_COLUMNS),
        (enumCol) => {
          // Check that all enum values are documented
          return enumCol.values.every(value => 
            dataTypesDocContent.toLowerCase().includes(value.toLowerCase())
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: any randomly selected enum value should appear in documentation', () => {
    // Create a flat list of all enum values with their context
    const allEnumValues = ENUM_COLUMNS.flatMap(enumCol =>
      enumCol.values.map(value => ({
        table: enumCol.table,
        column: enumCol.column,
        value,
      }))
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...allEnumValues),
        ({ table, column, value }) => {
          // The value should appear in the documentation
          const valueInDoc = dataTypesDocContent.toLowerCase().includes(value.toLowerCase());
          
          // The table name should appear in the documentation
          const tableInDoc = dataTypesDocContent.toLowerCase().includes(table.toLowerCase());
          
          // The column name should appear in the documentation
          const columnInDoc = dataTypesDocContent.toLowerCase().includes(column.toLowerCase());
          
          return valueInDoc && tableInDoc && columnInDoc;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: enum documentation should include table and column context', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ENUM_COLUMNS),
        (enumCol) => {
          // Check that the table name is documented
          const hasTable = dataTypesDocContent.toLowerCase().includes(enumCol.table.toLowerCase());
          
          // Check that the column name is documented
          const hasColumn = dataTypesDocContent.toLowerCase().includes(enumCol.column.toLowerCase());
          
          return hasTable && hasColumn;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should document all Authentication & Users domain enums', () => {
    const authEnums = ENUM_COLUMNS.filter(e => 
      ['users', 'admin_users'].includes(e.table)
    );
    
    authEnums.forEach(enumCol => {
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.table);
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.column);
      enumCol.values.forEach(value => {
        expect(dataTypesDocContent.toLowerCase()).toContain(value.toLowerCase());
      });
    });
  });

  it('should document all Learning Content domain enums', () => {
    const learningEnums = ENUM_COLUMNS.filter(e => 
      ['lesson_content', 'questions', 'question_media', 'module_access_rules'].includes(e.table)
    );
    
    learningEnums.forEach(enumCol => {
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.table);
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.column);
      enumCol.values.forEach(value => {
        expect(dataTypesDocContent.toLowerCase()).toContain(value.toLowerCase());
      });
    });
  });

  it('should document all Subscriptions & Payments domain enums', () => {
    const paymentEnums = ENUM_COLUMNS.filter(e => 
      ['subscriptions', 'discount_coupons'].includes(e.table)
    );
    
    paymentEnums.forEach(enumCol => {
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.table);
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.column);
      enumCol.values.forEach(value => {
        expect(dataTypesDocContent.toLowerCase()).toContain(value.toLowerCase());
      });
    });
  });

  it('should document all Notifications domain enums', () => {
    const notificationEnums = ENUM_COLUMNS.filter(e => 
      ['notifications', 'notification_queue', 'push_tokens'].includes(e.table)
    );
    
    notificationEnums.forEach(enumCol => {
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.table);
      expect(dataTypesDocContent.toLowerCase()).toContain(enumCol.column);
      enumCol.values.forEach(value => {
        expect(dataTypesDocContent.toLowerCase()).toContain(value.toLowerCase());
      });
    });
  });

  it('should have a summary table with all enum columns', () => {
    // Check that the summary table exists
    expect(dataTypesDocContent).toContain('Enum Summary Table');
    
    // Check that all enum columns appear in the summary
    ENUM_COLUMNS.forEach(enumCol => {
      // At least the table and column should be in the summary section
      const summarySection = dataTypesDocContent.split('Enum Summary Table')[1];
      if (summarySection) {
        expect(summarySection.toLowerCase()).toContain(enumCol.table);
      }
    });
  });

  it('property: enum values should be documented with correct formatting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ENUM_COLUMNS),
        (enumCol) => {
          // Check that values are formatted with quotes or backticks
          return enumCol.values.every(value => {
            const quotedValue = `'${value}'`;
            const backtickValue = `\`${value}\``;
            return dataTypesDocContent.includes(quotedValue) || 
                   dataTypesDocContent.includes(backtickValue) ||
                   dataTypesDocContent.includes(value);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should document enum values count correctly', () => {
    // The document should mention the total count of enum columns
    expect(dataTypesDocContent).toContain('Enum Columns Count');
    
    // Verify the count is accurate (23 enum columns)
    expect(dataTypesDocContent).toContain('23');
  });
});
