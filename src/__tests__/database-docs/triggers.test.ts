/**
 * Property-Based Test: Trigger-Function Cross-Reference
 * 
 * **Feature: database-documentation, Property 4: Trigger-Function Cross-Reference**
 * **Validates: Requirements 2.2, 3.4**
 * 
 * For any trigger in the database, the documentation SHALL correctly identify
 * the function it invokes, and for any function invoked by a trigger, the
 * documentation SHALL list the trigger that invokes it.
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Define trigger-function relationships
interface TriggerFunctionRelation {
  triggerName: string;
  schema: string;
  table: string;
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  events: string[];
  functionName: string;
}

// All trigger-function relationships in the database
const TRIGGER_FUNCTION_RELATIONS: TriggerFunctionRelation[] = [
  // Auth Schema
  {
    triggerName: 'on_auth_user_created_profile',
    schema: 'auth',
    table: 'users',
    timing: 'AFTER',
    events: ['INSERT'],
    functionName: 'handle_auth_user_created',
  },
  // Public Schema - Timestamp Triggers
  {
    triggerName: 'ai_usage_updated_at',
    schema: 'public',
    table: 'ai_usage_stats',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_ai_usage_timestamp',
  },
  {
    triggerName: 'chat_conversation_updated_at',
    schema: 'public',
    table: 'chat_conversations',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_chat_conversation_timestamp',
  },
  {
    triggerName: 'content_approvals_updated_at',
    schema: 'public',
    table: 'content_approvals',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_content_approvals_updated_at',
  },
  {
    triggerName: 'update_notification_preferences_updated_at',
    schema: 'public',
    table: 'notification_preferences',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_notification_preferences_timestamp',
  },
  {
    triggerName: 'notification_queue_updated_at',
    schema: 'public',
    table: 'notification_queue',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_notification_queue_updated_at',
  },
  {
    triggerName: 'notification_targets_updated_at',
    schema: 'public',
    table: 'notification_targets',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_notification_targets_updated_at',
  },
  {
    triggerName: 'notifications_updated_at',
    schema: 'public',
    table: 'notifications',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_notifications_updated_at',
  },
  {
    triggerName: 'push_tokens_updated_at',
    schema: 'public',
    table: 'push_tokens',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'update_push_tokens_updated_at',
  },
  // Public Schema - Business Logic Triggers
  {
    triggerName: 'increment_coupon_on_subscription',
    schema: 'public',
    table: 'subscriptions',
    timing: 'AFTER',
    events: ['INSERT', 'UPDATE'],
    functionName: 'increment_coupon_usage',
  },
  {
    triggerName: 'new_user_welcome_notification',
    schema: 'public',
    table: 'user_profiles',
    timing: 'AFTER',
    events: ['INSERT'],
    functionName: 'notify_new_user_welcome',
  },
  {
    triggerName: 'subscription_activated_notification',
    schema: 'public',
    table: 'subscriptions',
    timing: 'AFTER',
    events: ['INSERT', 'UPDATE'],
    functionName: 'notify_subscription_activated',
  },
  // Realtime Schema
  {
    triggerName: 'tr_check_filters',
    schema: 'realtime',
    table: 'subscription',
    timing: 'BEFORE',
    events: ['INSERT'],
    functionName: 'subscription_check_filters',
  },
  // Storage Schema
  {
    triggerName: 'enforce_bucket_name_length_trigger',
    schema: 'storage',
    table: 'buckets',
    timing: 'BEFORE',
    events: ['INSERT', 'UPDATE'],
    functionName: 'enforce_bucket_name_length',
  },
  {
    triggerName: 'objects_delete_delete_prefix',
    schema: 'storage',
    table: 'objects',
    timing: 'INSTEAD OF',
    events: ['DELETE'],
    functionName: 'delete_prefix_hierarchy_trigger',
  },
  {
    triggerName: 'objects_insert_create_prefix',
    schema: 'storage',
    table: 'objects',
    timing: 'BEFORE',
    events: ['INSERT'],
    functionName: 'objects_insert_prefix_trigger',
  },
  {
    triggerName: 'objects_update_create_prefix',
    schema: 'storage',
    table: 'objects',
    timing: 'BEFORE',
    events: ['UPDATE'],
    functionName: 'objects_update_prefix_trigger',
  },
  {
    triggerName: 'update_objects_updated_at',
    schema: 'storage',
    table: 'objects',
    timing: 'BEFORE',
    events: ['UPDATE'],
    functionName: 'update_updated_at_column',
  },
  {
    triggerName: 'prefixes_create_hierarchy',
    schema: 'storage',
    table: 'prefixes',
    timing: 'BEFORE',
    events: ['INSERT'],
    functionName: 'prefixes_insert_trigger',
  },
  {
    triggerName: 'prefixes_delete_hierarchy',
    schema: 'storage',
    table: 'prefixes',
    timing: 'INSTEAD OF',
    events: ['DELETE'],
    functionName: 'delete_prefix_hierarchy_trigger',
  },
];

// Public schema triggers for focused testing
const PUBLIC_SCHEMA_TRIGGERS = TRIGGER_FUNCTION_RELATIONS.filter(
  (t) => t.schema === 'public'
);

let triggersDocContent: string;

describe('Property 4: Trigger-Function Cross-Reference', () => {
  beforeAll(() => {
    const docPath = path.resolve(
      __dirname,
      '../../../docs/03-Database/TRIGGERS_AND_FUNCTIONS.md'
    );
    triggersDocContent = fs.readFileSync(docPath, 'utf-8');
  });

  it('property: any trigger should have its function documented', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TRIGGER_FUNCTION_RELATIONS), (trigger) => {
        // Check that the trigger name is documented
        const hasTriggerName = triggersDocContent.includes(trigger.triggerName);

        // Check that the function name is documented
        const hasFunctionName = triggersDocContent.includes(
          trigger.functionName
        );

        return hasTriggerName && hasFunctionName;
      }),
      { numRuns: 100 }
    );
  });

  it('property: any function invoked by a trigger should reference that trigger', () => {
    // Filter to only public schema triggers for detailed function documentation
    // Realtime and storage schema functions are Supabase internal and don't need
    // detailed "Used By Triggers" documentation
    const publicSchemaTriggers = TRIGGER_FUNCTION_RELATIONS.filter(
      (t) => t.schema === 'public' || t.schema === 'auth'
    );

    fc.assert(
      fc.property(fc.constantFrom(...publicSchemaTriggers), (trigger) => {
        // Find the function section in the documentation
        const functionSection = extractFunctionSection(
          triggersDocContent,
          trigger.functionName
        );

        if (!functionSection) return false;

        // Check that the function section mentions "Used By Triggers"
        const hasUsedBySection = functionSection.includes('Used By Triggers');

        // Check that the trigger name is mentioned in the function section
        const mentionsTrigger = functionSection.includes(trigger.triggerName);

        return hasUsedBySection && mentionsTrigger;
      }),
      { numRuns: 100 }
    );
  });

  it('property: any trigger should have correct schema documented', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TRIGGER_FUNCTION_RELATIONS), (trigger) => {
        // Find the trigger section
        const triggerSection = extractTriggerSection(
          triggersDocContent,
          trigger.triggerName
        );

        if (!triggerSection) return false;

        // Check that the schema is documented correctly
        const hasCorrectSchema = triggerSection.includes(
          `**Schema:** ${trigger.schema}`
        );

        return hasCorrectSchema;
      }),
      { numRuns: 100 }
    );
  });

  it('property: any trigger should have correct table documented', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TRIGGER_FUNCTION_RELATIONS), (trigger) => {
        // Find the trigger section
        const triggerSection = extractTriggerSection(
          triggersDocContent,
          trigger.triggerName
        );

        if (!triggerSection) return false;

        // Check that the table is documented correctly
        const hasCorrectTable = triggerSection.includes(
          `**Table:** ${trigger.table}`
        );

        return hasCorrectTable;
      }),
      { numRuns: 100 }
    );
  });

  it('property: any trigger should have correct timing documented', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TRIGGER_FUNCTION_RELATIONS), (trigger) => {
        // Find the trigger section
        const triggerSection = extractTriggerSection(
          triggersDocContent,
          trigger.triggerName
        );

        if (!triggerSection) return false;

        // Check that the timing is documented correctly
        const hasCorrectTiming = triggerSection.includes(
          `**Timing:** ${trigger.timing}`
        );

        return hasCorrectTiming;
      }),
      { numRuns: 100 }
    );
  });

  it('property: any trigger should have correct function reference', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TRIGGER_FUNCTION_RELATIONS), (trigger) => {
        // Find the trigger section
        const triggerSection = extractTriggerSection(
          triggersDocContent,
          trigger.triggerName
        );

        if (!triggerSection) return false;

        // Check that the function is documented correctly
        const hasCorrectFunction = triggerSection.includes(
          `**Function:** ${trigger.functionName}`
        );

        return hasCorrectFunction;
      }),
      { numRuns: 100 }
    );
  });

  it('should document all public schema triggers', () => {
    PUBLIC_SCHEMA_TRIGGERS.forEach((trigger) => {
      expect(triggersDocContent).toContain(trigger.triggerName);
      expect(triggersDocContent).toContain(trigger.functionName);
    });
  });

  it('should have trigger summary table with all triggers', () => {
    // Check that the summary table exists
    expect(triggersDocContent).toContain('## Trigger Summary Table');

    // Check that all triggers appear in the summary table
    TRIGGER_FUNCTION_RELATIONS.forEach((trigger) => {
      expect(triggersDocContent).toContain(`| ${trigger.triggerName}`);
    });
  });

  it('should have function summary table with all functions', () => {
    // Check that the function summary table exists
    expect(triggersDocContent).toContain('## Function Summary Table');

    // Check that all functions appear in the summary table
    const uniqueFunctions = [
      ...new Set(TRIGGER_FUNCTION_RELATIONS.map((t) => t.functionName)),
    ];
    uniqueFunctions.forEach((functionName) => {
      expect(triggersDocContent).toContain(functionName);
    });
  });

  it('should have cross-reference section', () => {
    expect(triggersDocContent).toContain(
      '## Cross-Reference: Triggers and Functions'
    );
    expect(triggersDocContent).toContain('### By Table');
  });

  it('property: cross-reference table should list all tables with triggers', () => {
    const tablesWithTriggers = [
      ...new Set(TRIGGER_FUNCTION_RELATIONS.map((t) => t.table)),
    ];

    fc.assert(
      fc.property(fc.constantFrom(...tablesWithTriggers), (tableName) => {
        // The table should appear in the cross-reference section
        return triggersDocContent.includes(tableName);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Helper function to extract a trigger's documentation section
 */
function extractTriggerSection(doc: string, triggerName: string): string | null {
  // Find the section for this trigger (between #### headings)
  const pattern = new RegExp(
    `####\\s+${triggerName}[\\s\\S]*?(?=####\\s+|###\\s+|## |$)`,
    'i'
  );
  const match = doc.match(pattern);
  return match ? match[0] : null;
}

/**
 * Helper function to extract a function's documentation section
 */
function extractFunctionSection(
  doc: string,
  functionName: string
): string | null {
  // Find the section for this function (between #### headings)
  // Function names may have () suffix in documentation
  // Escape special regex characters in function name
  const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use greedy match until we hit a section delimiter
  const pattern = new RegExp(
    `####\\s+${escapedName}\\(\\)[\\s\\S]+?(?=\\n---\\n|\\n####\\s|\\n###\\s|\\n## )`,
    'i'
  );
  const match = doc.match(pattern);
  return match ? match[0] : null;
}
