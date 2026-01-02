# Requirements Document

## Introduction

This specification defines the comprehensive database documentation for the Jeeva Learning platform. The documentation consolidates all Supabase PostgreSQL database artifacts including tables, columns, relationships, triggers, functions, RLS policies, and indexes into a single authoritative reference for future development and maintenance.

## Glossary

- **Supabase**: Backend-as-a-Service providing PostgreSQL database, authentication, and storage
- **RLS**: Row Level Security - PostgreSQL security policies for data access control
- **Trigger**: Database mechanism that automatically executes a function when specified events occur
- **Function**: Stored procedure written in PL/pgSQL that performs database operations
- **Foreign Key**: Constraint that establishes relationships between tables
- **Index**: Database structure that improves query performance
- **JSONB**: PostgreSQL binary JSON data type for storing structured data

## Requirements

### Requirement 1: Table Schema Documentation

**User Story:** As a developer, I want complete documentation of all database tables with their columns, data types, and constraints, so that I can understand the data model and write correct queries.

#### Acceptance Criteria

1. WHEN a developer reads the documentation THEN the Database_Documentation SHALL list all 53 tables in the public schema with their purpose
2. WHEN a developer views a table definition THEN the Database_Documentation SHALL display column name, data type, nullability, default value, and constraints for each column
3. WHEN a developer needs to understand table relationships THEN the Database_Documentation SHALL show all foreign key references with ON DELETE behavior
4. WHEN a developer views table metadata THEN the Database_Documentation SHALL include primary key, unique constraints, and check constraints

### Requirement 2: Trigger Documentation

**User Story:** As a developer, I want documentation of all database triggers, so that I can understand automated behaviors and avoid conflicts when modifying data.

#### Acceptance Criteria

1. WHEN a developer reads trigger documentation THEN the Database_Documentation SHALL list all 18 triggers with their schema, name, timing, and event type
2. WHEN a developer views a trigger definition THEN the Database_Documentation SHALL show the associated function name and the table it operates on
3. WHEN a developer needs to understand trigger behavior THEN the Database_Documentation SHALL describe what each trigger does and when it fires
4. WHEN a developer modifies related tables THEN the Database_Documentation SHALL warn about trigger side effects

### Requirement 3: Function Documentation

**User Story:** As a developer, I want documentation of all database functions, so that I can reuse existing logic and understand stored procedures.

#### Acceptance Criteria

1. WHEN a developer reads function documentation THEN the Database_Documentation SHALL list all PL/pgSQL functions with their purpose
2. WHEN a developer views a function definition THEN the Database_Documentation SHALL show input parameters, return type, and security context
3. WHEN a developer needs to call a function THEN the Database_Documentation SHALL provide usage examples with sample inputs and outputs
4. WHEN a function is used by triggers THEN the Database_Documentation SHALL cross-reference the trigger that invokes it

### Requirement 4: RLS Policy Documentation

**User Story:** As a developer, I want documentation of all Row Level Security policies, so that I can understand data access controls and implement secure queries.

#### Acceptance Criteria

1. WHEN a developer reads RLS documentation THEN the Database_Documentation SHALL list all tables with RLS enabled and their policy names
2. WHEN a developer views a policy definition THEN the Database_Documentation SHALL show the operation type (SELECT/INSERT/UPDATE/DELETE) and the USING/WITH CHECK expressions
3. WHEN a developer needs to understand access patterns THEN the Database_Documentation SHALL provide a policy matrix showing which roles can perform which operations
4. WHEN tables lack RLS policies THEN the Database_Documentation SHALL identify them and recommend appropriate policies

### Requirement 5: Index Documentation

**User Story:** As a developer, I want documentation of all database indexes, so that I can optimize queries and understand performance characteristics.

#### Acceptance Criteria

1. WHEN a developer reads index documentation THEN the Database_Documentation SHALL list all indexes with their table, columns, and type
2. WHEN a developer views an index definition THEN the Database_Documentation SHALL show whether it is unique, partial, or composite
3. WHEN a developer needs to optimize queries THEN the Database_Documentation SHALL recommend indexes for common query patterns
4. WHEN indexes are missing for foreign keys THEN the Database_Documentation SHALL identify them as potential performance issues

### Requirement 6: Relationship Diagram

**User Story:** As a developer, I want visual entity-relationship diagrams, so that I can quickly understand the database structure.

#### Acceptance Criteria

1. WHEN a developer views the documentation THEN the Database_Documentation SHALL include a high-level ER diagram showing all table relationships
2. WHEN a developer needs domain-specific views THEN the Database_Documentation SHALL provide focused diagrams for each domain (Auth, Content, Progress, Payments, Notifications, AI)
3. WHEN relationships are complex THEN the Database_Documentation SHALL use Mermaid syntax for rendering diagrams
4. WHEN cardinality matters THEN the Database_Documentation SHALL indicate one-to-one, one-to-many, and many-to-many relationships

### Requirement 7: Data Type Reference

**User Story:** As a developer, I want a reference of custom data types and enums, so that I can use consistent values across the application.

#### Acceptance Criteria

1. WHEN a developer needs enum values THEN the Database_Documentation SHALL list all columns with CHECK constraints and their allowed values
2. WHEN a developer uses JSONB columns THEN the Database_Documentation SHALL document the expected JSON structure with examples
3. WHEN a developer uses array columns THEN the Database_Documentation SHALL specify the element type and typical usage
4. WHEN custom types exist THEN the Database_Documentation SHALL define them with their purpose

### Requirement 8: Migration Reference

**User Story:** As a developer, I want a reference of database migrations, so that I can understand schema evolution and apply changes correctly.

#### Acceptance Criteria

1. WHEN a developer reads migration documentation THEN the Database_Documentation SHALL list all migration files in chronological order
2. WHEN a developer views a migration THEN the Database_Documentation SHALL summarize the changes made
3. WHEN a developer needs to rollback THEN the Database_Documentation SHALL indicate which migrations are reversible
4. WHEN schema conflicts exist THEN the Database_Documentation SHALL document resolution strategies

