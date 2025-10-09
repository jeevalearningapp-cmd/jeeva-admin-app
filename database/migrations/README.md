# Database Migrations

This directory contains SQL migration files for the Jeeva Admin Portal database.

## Running Migrations

To run these migrations in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from the migration file
4. Execute the SQL

## Migration Files

- `create_app_settings.sql` - Creates the app_settings table for platform configuration

## Notes

- All migrations include RLS (Row Level Security) policies
- Tables use UUID primary keys
- Timestamps are automatically managed with triggers
- Default values are set for all required fields
