#!/bin/bash

# ============================================================================
# Automated Database Backup Script
# ============================================================================
# Purpose: Automate backup of questions and question_options tables
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
BACKUP_DIR="${SCRIPT_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_SUBDIR="${BACKUP_DIR}/${TIMESTAMP}"

# Database connection (from environment or .env file)
if [ -f "${SCRIPT_DIR}/../../.env" ]; then
    source "${SCRIPT_DIR}/../../.env"
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable not set${NC}"
    echo "Please set it in your .env file or export it:"
    echo "  export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres'"
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

# Main backup process
main() {
    print_header "Database Backup Script - Learning Module Restructure"
    
    echo ""
    print_info "Backup timestamp: ${TIMESTAMP}"
    print_info "Backup directory: ${BACKUP_SUBDIR}"
    echo ""
    
    # Create backup directory
    print_info "Creating backup directory..."
    mkdir -p "${BACKUP_SUBDIR}"
    print_success "Backup directory created"
    
    # Run SQL backup script
    print_info "Running SQL backup script..."
    if psql "$SUPABASE_DB_URL" -f "${SCRIPT_DIR}/backup_questions_tables.sql" > "${BACKUP_SUBDIR}/backup_log.txt" 2>&1; then
        print_success "SQL backup script completed"
    else
        print_error "SQL backup script failed. Check ${BACKUP_SUBDIR}/backup_log.txt for details"
        exit 1
    fi
    
    # Copy CSV files from server to local backup directory
    print_info "Copying CSV files to backup directory..."
    
    # Note: This assumes CSV files are accessible locally
    # If running on a remote server, you may need to adjust this
    if [ -f "/tmp/questions_backup.csv" ]; then
        cp /tmp/questions_backup.csv "${BACKUP_SUBDIR}/questions_backup.csv"
        print_success "questions_backup.csv copied"
    else
        print_warning "questions_backup.csv not found in /tmp"
    fi
    
    if [ -f "/tmp/question_options_backup.csv" ]; then
        cp /tmp/question_options_backup.csv "${BACKUP_SUBDIR}/question_options_backup.csv"
        print_success "question_options_backup.csv copied"
    else
        print_warning "question_options_backup.csv not found in /tmp"
    fi
    
    # Export backup metadata
    print_info "Exporting backup metadata..."
    psql "$SUPABASE_DB_URL" -c "
        COPY (
            SELECT * FROM backup_metadata 
            WHERE backup_name = 'pre_migration_backup'
            ORDER BY backup_date DESC
        ) TO STDOUT WITH CSV HEADER
    " > "${BACKUP_SUBDIR}/backup_metadata.csv" 2>&1
    print_success "Backup metadata exported"
    
    # Generate backup summary
    print_info "Generating backup summary..."
    cat > "${BACKUP_SUBDIR}/BACKUP_SUMMARY.txt" << EOF
============================================================================
BACKUP SUMMARY
============================================================================
Backup Date: $(date)
Backup Timestamp: ${TIMESTAMP}
Backup Location: ${BACKUP_SUBDIR}

Files Created:
- questions_backup.csv
- question_options_backup.csv
- backup_metadata.csv
- backup_log.txt
- BACKUP_SUMMARY.txt

Database Backup Tables:
- questions_backup
- question_options_backup

Row Counts:
EOF
    
    psql "$SUPABASE_DB_URL" -t -c "
        SELECT 
            'Questions: ' || COUNT(*) || ' rows'
        FROM questions_backup
        UNION ALL
        SELECT 
            'Question Options: ' || COUNT(*) || ' rows'
        FROM question_options_backup;
    " >> "${BACKUP_SUBDIR}/BACKUP_SUMMARY.txt" 2>&1
    
    cat >> "${BACKUP_SUBDIR}/BACKUP_SUMMARY.txt" << EOF

Verification Status:
EOF
    
    psql "$SUPABASE_DB_URL" -t -c "
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM questions) = (SELECT COUNT(*) FROM questions_backup)
                THEN '✓ Questions backup verified'
                ELSE '✗ Questions backup count mismatch'
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM question_options) = (SELECT COUNT(*) FROM question_options_backup)
                THEN '✓ Question options backup verified'
                ELSE '✗ Question options backup count mismatch'
            END;
    " >> "${BACKUP_SUBDIR}/BACKUP_SUMMARY.txt" 2>&1
    
    cat >> "${BACKUP_SUBDIR}/BACKUP_SUMMARY.txt" << EOF

Next Steps:
1. Review this backup summary
2. Verify CSV files are readable
3. Test restore procedure on development database
4. Copy backup to secure cloud storage
5. Proceed with migration when ready

Restore Instructions:
See BACKUP_RESTORE_GUIDE.md for detailed restore procedures

============================================================================
EOF
    
    print_success "Backup summary generated"
    
    # Display summary
    echo ""
    print_header "BACKUP COMPLETED SUCCESSFULLY"
    echo ""
    cat "${BACKUP_SUBDIR}/BACKUP_SUMMARY.txt"
    echo ""
    
    # Compress backup (optional)
    print_info "Compressing backup..."
    cd "${BACKUP_DIR}"
    tar -czf "${TIMESTAMP}.tar.gz" "${TIMESTAMP}"
    print_success "Backup compressed to ${TIMESTAMP}.tar.gz"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -sh "${TIMESTAMP}.tar.gz" | cut -f1)
    print_info "Backup size: ${BACKUP_SIZE}"
    
    echo ""
    print_success "All backup operations completed successfully!"
    echo ""
    print_warning "IMPORTANT: Copy backup to secure cloud storage before proceeding with migration"
    echo ""
    print_info "Backup location: ${BACKUP_SUBDIR}"
    print_info "Compressed backup: ${BACKUP_DIR}/${TIMESTAMP}.tar.gz"
    echo ""
}

# Run main function
main "$@"
