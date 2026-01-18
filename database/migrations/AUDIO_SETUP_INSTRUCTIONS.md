# Audio Support Setup Instructions

## Overview

This migration adds audio/podcast support to lessons, allowing administrators to upload mp3 and wav audio files.

## What This Migration Does

- Adds `audio_url` column to the `lessons` table
- Creates an index for better query performance
- Supports both mp3 and wav audio formats

## How to Run This Migration

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration

1. Copy the contents of `add_audio_to_lessons.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify the Migration

Run this query to verify the column was added:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lessons' AND column_name = 'audio_url';
```

You should see:

- column_name: `audio_url`
- data_type: `text`

## Usage

Once this migration is complete, you can:

- Upload mp3 or wav audio files to lessons
- Store the file URL in the `audio_url` field
- Play audio content in your mobile app

## Rollback (if needed)

If you need to remove the audio support:

```sql
ALTER TABLE lessons DROP COLUMN IF EXISTS audio_url;
```
