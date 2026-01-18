# Flashcard System Setup

## Overview

The flashcard system enables topic-level memorization cards for the Learning Module. Flashcards help students review key concepts through a front/back card format.

## Prerequisites

Before running this migration, ensure you've completed:

1. Initial database setup (`create_content_tables.sql`)
2. NMC restructuring migration (`restructure_for_nmc_modules.sql`)

## Migration Steps

### 1. Run the Flashcard Migration

Open your Supabase SQL Editor and execute:

```sql
-- Copy and paste contents from add_category_to_flashcards.sql
```

This migration:

- ✅ Adds `category` column to flashcards table
- ✅ Creates index for efficient category-based queries
- ✅ Makes `lesson_id` nullable for backward compatibility
- ✅ Enables topic-level organization (Numeracy, NMC Code, etc.)

### 2. Verify Migration Success

Check that flashcards table now has:

- `category` column (VARCHAR 100)
- `lesson_id` is nullable
- Index `idx_flashcards_category` exists

## Usage in Admin Portal

### Creating Flashcards

1. Navigate to **Content Management** page
2. Select **Learning Module**
3. Choose a topic (e.g., "NMC Code")
4. Click **Flashcards** tab
5. Click **Add Flashcard** or use CSV bulk upload

### CSV Bulk Upload Format

```csv
front,back,image_url
"What is the NMC Code?","A set of professional standards nurses must uphold...",""
"Define Mental Capacity","A person's ability to make a specific decision...",""
```

**Template includes:**

- `front` (required): Question or term
- `back` (required): Answer or definition
- `image_url` (optional): URL to helpful image

### Features

- ✨ **CRUD Operations**: Create, edit, delete individual flashcards
- 📤 **Bulk CSV Upload**: Import multiple flashcards at once
- 🎯 **Topic-Specific**: Flashcards organized by Learning Module topics
- 👁️ **Active/Inactive Toggle**: Control visibility to students
- 🖼️ **Image Support**: Add visual aids to flashcards

## Mobile App Integration

Once created in admin portal, flashcards:

- Appear in the Learning Module for the respective topic
- Students can flip cards to reveal answers
- Support spaced repetition learning
- Track review progress

## Database Schema

### Flashcard Structure

```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id),  -- Now nullable
  category VARCHAR(100),                    -- NEW: Topic association
  front TEXT NOT NULL,                      -- Question/Term
  back TEXT NOT NULL,                       -- Answer/Definition
  image_url TEXT,                           -- Optional image
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Category Values (Learning Module Topics)

- Numeracy
- The NMC Code
- Mental Capacity Act
- Safeguarding
- Consent & Confidentiality
- Equality & Diversity
- Duty of Candour
- Cultural Adaptation

## Troubleshooting

**Error: "relation flashcards does not exist"**
→ Run `create_content_tables.sql` first

**Error: "column category does not exist"**
→ Run this migration (`add_category_to_flashcards.sql`)

**Flashcards not showing in Admin Portal**
→ Ensure you've selected a topic in the Learning Module

**CSV upload fails**
→ Verify CSV format matches template (front, back, image_url columns)
