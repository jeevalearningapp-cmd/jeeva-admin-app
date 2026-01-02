#!/bin/bash

# ============================================================================
# Test Restore Script for Development Database
# ============================================================================
# Purpose: Test restore procedure on development database before production
# Date: 2024-12-24
# Related Task: 0.2 Backup Existing Database
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for development database URL
if [ -z "$DEV_SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: DEV_SUPABASE_DB_URL environment variable not set${NC}"
    echo "Please set it before running this script:"
    echo "  export DEV_SUPABASE_DB_URL='postgresql://postgres:[DEV_PASSWORD]@db.[DEV_PROJECT_REF].supabase.co:5432/postgres'"
    exit 1
fi

# Functions
print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Main test restore process
main() {
    print_header "Test Restore on Development Database"
    
    echo ""
    print_warning "This will test the restore procedure on your DEVELOPMENT database"
    print_warning "Make sure you are NOT connected to production!"
    echo ""
    
    # Confirm development database
    print_info "Checking database connection..."
    DB_NAME=$(psql "$DEV_SUPABASE_DB_URL" -t -c "SELECT current_database();")
    print_info "Connected to database: ${DB_NAME}"
    
    echo ""
    read -p "Is this your DEVELOPMENT database? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_error "Restore cancelled by user"
        exit 1
    fi
    
    # Check if backup tables exist
    print_info "Checking for backup tables..."
    BACKUP_EXISTS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_name IN ('questions_backup', 'question_options_backup');
    ")
    
    if [ "$BACKUP_EXISTS" -lt 2 ]; then
        print_error "Backup tables not found in development database"
        print_info "You need to copy backup tables from production first:"
        echo ""
        echo "  pg_dump \"\$PROD_SUPABASE_DB_URL\" -t questions_backup -t question_options_backup | psql \"\$DEV_SUPABASE_DB_URL\""
        echo ""
        exit 1
    fi
    
    print_success "Backup tables found"
    
    # Get row counts before restore
    print_info "Getting row counts before restore..."
    BACKUP_QUESTIONS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM questions_backup;")
    BACKUP_OPTIONS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM question_options_backup;")
    
    print_info "Backup contains:"
    print_info "  - Questions: ${BACKUP_QUESTIONS} rows"
    print_info "  - Question Options: ${BACKUP_OPTIONS} rows"
    
    echo ""
    read -p "Proceed with restore? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_error "Restore cancelled by user"
        exit 1
    fi
    
    # Run restore script
    print_info "Running restore script..."
    if psql "$DEV_SUPABASE_DB_URL" -f "${SCRIPT_DIR}/restore_questions_backup.sql" > /tmp/restore_test_log.txt 2>&1; then
        print_success "Restore script completed"
    else
        print_error "Restore script failed. Check /tmp/restore_test_log.txt for details"
        cat /tmp/restore_test_log.txt
        exit 1
    fi
    
    # Verify restore
    print_info "Verifying restore..."
    
    RESTORED_QUESTIONS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM questions;")
    RESTORED_OPTIONS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM question_options;")
    
    print_info "Restored:"
    print_info "  - Questions: ${RESTORED_QUESTIONS} rows"
    print_info "  - Question Options: ${RESTORED_OPTIONS} rows"
    
    # Check integrity
    print_info "Checking data integrity..."
    
    # Check for orphaned question options
    ORPHANED=$(psql "$DEV_SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM question_options qo
        LEFT JOIN questions q ON q.id = qo.question_id
        WHERE q.id IS NULL;
    ")
    
    if [ "$ORPHANED" -gt 0 ]; then
        print_error "Found ${ORPHANED} orphaned question options!"
    else
        print_success "No orphaned question options"
    fi
    
    # Check for questions without options
    NO_OPTIONS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM questions q
        LEFT JOIN question_options qo ON qo.question_id = q.id
        WHERE qo.id IS NULL;
    ")
    
    if [ "$NO_OPTIONS" -gt 0 ]; then
        print_warning "Found ${NO_OPTIONS} questions without options"
    else
        print_success "All questions have options"
    fi
    
    # Check constraints
    print_info "Checking constraints..."
    CONSTRAINTS=$(psql "$DEV_SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM pg_constraint
        WHERE conrelid IN ('questions'::regclass, 'question_options'::regclass);
    ")
    print_info "Found ${CONSTRAINTS} constraints"
    
    # Check indexes
    print_info "Checking indexes..."
    INDEXES=$(psql "$DEV_SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM pg_indexes
        WHERE tablename IN ('questions', 'question_options');
    ")
    print_info "Found ${INDEXES} indexes"
    
    # Generate test report
    print_info "Generating test report..."
    cat > /tmp/restore_test_report.txt << EOF
============================================================================
RESTORE TEST REPORT
============================================================================
Test Date: $(date)
Database: ${DB_NAME}

Backup Row Counts:
- Questions: ${BACKUP_QUESTIONS}
- Question Options: ${BACKUP_OPTIONS}

Restored Row Counts:
- Questions: ${RESTORED_QUESTIONS}
- Question Options: ${RESTORED_OPTIONS}

Data Integrity:
- Orphaned Options: ${ORPHANED}
- Questions Without Options: ${NO_OPTIONS}
- Constraints: ${CONSTRAINTS}
- Indexes: ${INDEXES}

Verification Status:
EOF
    
    if [ "$BACKUP_QUESTIONS" -eq "$RESTORED_QUESTIONS" ] && [ "$BACKUP_OPTIONS" -eq "$RESTORED_OPTIONS" ] && [ "$ORPHANED" -eq 0 ]; then
        echo "✓ RESTORE TEST PASSED" >> /tmp/restore_test_report.txt
        echo "" >> /tmp/restore_test_report.txt
        echo "The restore procedure works correctly on development database." >> /tmp/restore_test_report.txt
        echo "You can proceed with confidence on production when needed." >> /tmp/restore_test_report.txt
    else
        echo "✗ RESTORE TEST FAILED" >> /tmp/restore_test_report.txt
        echo "" >> /tmp/restore_test_report.txt
        echo "Issues detected during restore. Review the details above." >> /tmp/restore_test_report.txt
        echo "DO NOT proceed with production restore until issues are resolved." >> /tmp/restore_test_report.txt
    fi
    
    cat >> /tmp/restore_test_report.txt << EOF

Next Steps:
1. Review this test report
2. Test application functionality with restored data
3. Verify all CRUD operations work correctly
4. If test passed, document the procedure
5. If test failed, investigate and fix issues

============================================================================
EOF
    
    # Display report
    echo ""
    print_header "RESTORE TEST COMPLETED"
    echo ""
    cat /tmp/restore_test_report.txt
    echo ""
    
    if [ "$BACKUP_QUESTIONS" -eq "$RESTORED_QUESTIONS" ] && [ "$BACKUP_OPTIONS" -eq "$RESTORED_OPTIONS" ] && [ "$ORPHANED" -eq 0 ]; then
        print_success "Restore test PASSED!"
        print_info "Test report saved to: /tmp/restore_test_report.txt"
    else
        print_error "Restore test FAILED!"
        print_warning "Review the report and fix issues before production restore"
        print_info "Test report saved to: /tmp/restore_test_report.txt"
        exit 1
    fi
}

# Run main function
main "$@"
