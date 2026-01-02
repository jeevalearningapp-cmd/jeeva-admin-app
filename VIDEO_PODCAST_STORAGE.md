# Video and Podcast Link Storage

## Answer: `lessons` Table

Video and podcast links are stored in the **`lessons`** table.

---

## Table: `lessons`

### Fields for Video and Podcast

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  title VARCHAR(255),
  content TEXT,
  
  -- VIDEO LINK STORED HERE ↓
  video_url TEXT,              -- Video lesson URL (MANDATORY for Learning Module)
  
  -- PODCAST LINK STORED HERE ↓
  podcast_url TEXT,            -- Podcast audio URL (OPTIONAL for Learning Module)
  
  audio_url TEXT,              -- Legacy audio field (still used)
  
  -- NEW FIELDS ADDED BY MIGRATION ↓
  is_mandatory BOOLEAN DEFAULT true,        -- Video is mandatory, podcast is optional
  content_type VARCHAR(50),                 -- 'video', 'audio', or 'text'
  
  -- OTHER FIELDS
  lesson_type VARCHAR(50),
  category VARCHAR(100),
  duration INTEGER,
  is_active BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## How It Works in Learning Module

### Structure
```
Topic (Main Topic)
  ├─ Core Notes (topic_core_notes table)
  ├─ Flash Content (topic_flash_content table)
  └─ Subtopics (topics table with parent_id)
      └─ Lessons (lessons table) ← VIDEO & PODCAST STORED HERE
          ├─ video_url (MANDATORY)
          ├─ podcast_url (OPTIONAL)
          └─ MCQs (learning_questions table)
```

### Example Data
```sql
-- Subtopic: "1.1 Prioritise People"
INSERT INTO lessons (
  topic_id,                    -- References the subtopic
  title,
  content,
  video_url,                   -- ← VIDEO LINK HERE
  podcast_url,                 -- ← PODCAST LINK HERE
  content_type,
  is_mandatory,
  duration
) VALUES (
  '22222222-2222-0002-0000-000000000002',
  'Prioritise People - Video Lesson',
  'Watch this video about prioritising people in nursing',
  'https://example.com/videos/prioritise-people.mp4',  -- Video URL
  'https://example.com/podcasts/prioritise-people.mp3', -- Podcast URL
  'video',
  true,
  900  -- 15 minutes
);
```

---

## Admin Portal UI Components

### Where Admins Add Video/Podcast Links

#### 1. VideoLessonTab Component
**File**: `src/components/content/VideoLessonTab.tsx`

**What it does**:
- Displays video upload/URL input interface
- Shows video preview
- Saves to `lessons.video_url` field
- Marks as mandatory

**API Call**:
```typescript
// Updates lessons table
PATCH /api/lessons/{id}
{
  video_url: "https://example.com/video.mp4",
  content_type: "video",
  is_mandatory: true
}
```

#### 2. PodcastTab Component
**File**: `src/components/content/PodcastTab.tsx`

**What it does**:
- Displays podcast upload/URL input interface
- Shows audio player preview
- Saves to `lessons.podcast_url` field
- Marks as optional

**API Call**:
```typescript
// Updates lessons table
PATCH /api/lessons/{id}
{
  podcast_url: "https://example.com/podcast.mp3",
  content_type: "audio",
  is_mandatory: false
}
```

---

## Field Details

### `video_url` (TEXT)
- **Purpose**: Store video lesson URL
- **Required**: YES for Learning Module subtopics
- **Format**: Full URL to video file or streaming service
- **Examples**:
  - `https://example.com/videos/lesson1.mp4`
  - `https://youtube.com/watch?v=xxxxx`
  - `https://vimeo.com/xxxxx`
  - Supabase Storage URL

### `podcast_url` (TEXT)
- **Purpose**: Store podcast audio URL
- **Required**: NO (optional)
- **Format**: Full URL to audio file
- **Examples**:
  - `https://example.com/podcasts/lesson1.mp3`
  - `https://soundcloud.com/xxxxx`
  - Supabase Storage URL

### `audio_url` (TEXT)
- **Purpose**: Legacy audio field (still used in old system)
- **Note**: May be deprecated in favor of `podcast_url`

### `content_type` (VARCHAR)
- **Purpose**: Identify lesson type
- **Values**: 'video', 'audio', 'text'
- **Usage**: Helps UI determine which player to show

### `is_mandatory` (BOOLEAN)
- **Purpose**: Mark if content is required
- **Values**: 
  - `true` for video lessons (mandatory)
  - `false` for podcasts (optional)

---

## Database Relationships

```
topics (Subtopic)
  ↓ (topic_id)
lessons (Video + Podcast)
  ↓ (video_lesson_id)
learning_questions (MCQs mapped to video)
```

### Foreign Keys
- `lessons.topic_id` → `topics.id` (CASCADE DELETE)
- `learning_questions.video_lesson_id` → `lessons.id` (CASCADE DELETE)

---

## Migration Changes

The migration added these new fields to the existing `lessons` table:

```sql
-- Added by learning_module_restructure.sql
ALTER TABLE lessons ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
ALTER TABLE lessons ADD COLUMN content_type VARCHAR(50) CHECK (content_type IN ('video', 'audio', 'text'));
ALTER TABLE lessons ADD COLUMN podcast_url TEXT;
```

**Before Migration**:
- `lessons` table had `video_url` and `audio_url`

**After Migration**:
- `lessons` table has `video_url`, `audio_url`, AND `podcast_url`
- Plus `is_mandatory` and `content_type` fields

---

## API Endpoints

### Get Lesson (with video/podcast)
```
GET /api/lessons/{id}

Response:
{
  "id": "uuid",
  "topic_id": "uuid",
  "title": "Lesson Title",
  "video_url": "https://example.com/video.mp4",
  "podcast_url": "https://example.com/podcast.mp3",
  "content_type": "video",
  "is_mandatory": true,
  "duration": 900
}
```

### Update Video URL
```
PATCH /api/lessons/{id}
{
  "video_url": "https://example.com/new-video.mp4",
  "content_type": "video",
  "is_mandatory": true
}
```

### Update Podcast URL
```
PATCH /api/lessons/{id}
{
  "podcast_url": "https://example.com/new-podcast.mp3",
  "content_type": "audio",
  "is_mandatory": false
}
```

---

## Storage Options

### 1. Supabase Storage (Recommended)
```
https://[project-id].supabase.co/storage/v1/object/public/videos/lesson1.mp4
https://[project-id].supabase.co/storage/v1/object/public/podcasts/lesson1.mp3
```

### 2. External Services
- YouTube, Vimeo (for videos)
- SoundCloud, Spotify (for podcasts)
- AWS S3, Cloudflare R2
- Any public URL

### 3. Direct Upload
- Upload files to Supabase Storage
- Get public URL
- Store URL in `video_url` or `podcast_url`

---

## Validation Rules

### Video (Mandatory)
- ✅ Must have `video_url` populated
- ✅ `is_mandatory` = true
- ✅ Required for subtopic completion
- ❌ Subtopic cannot be completed without video

### Podcast (Optional)
- ✅ Can have `podcast_url` populated
- ✅ `is_mandatory` = false
- ✅ Not required for subtopic completion
- ✅ Enhances learning experience

---

## Summary

| Field | Table | Purpose | Required | Type |
|-------|-------|---------|----------|------|
| `video_url` | `lessons` | Video lesson link | ✅ Yes | TEXT |
| `podcast_url` | `lessons` | Podcast audio link | ❌ No | TEXT |
| `audio_url` | `lessons` | Legacy audio link | ❌ No | TEXT |
| `content_type` | `lessons` | Content type identifier | ✅ Yes | VARCHAR |
| `is_mandatory` | `lessons` | Required flag | ✅ Yes | BOOLEAN |

**Key Point**: Both video and podcast URLs are stored in the **same table** (`lessons`), but in **different fields** (`video_url` vs `podcast_url`).
