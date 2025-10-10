# Content Management System - Database Setup

## 🎯 Quick Setup

Your admin portal's content management UI is ready, but the database tables need to be created in Supabase.

### Steps:

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the entire contents of `create_content_tables.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see "Success. No rows returned" (this is normal!)
   - Check the "Table Editor" to see your new tables:
     - modules
     - topics
     - lessons
     - flashcards
     - questions
     - question_options

## 📋 What This Creates

### Tables:
- **modules** - Course modules with thumbnails and ordering
- **topics** - Topics within modules
- **lessons** - Individual lessons with video support
- **flashcards** - Study flashcards for lessons
- **questions** - Quiz questions with multiple types
- **question_options** - Answer choices for questions

### Security (RLS Policies):
- **Superadmin**: Full CRUD access on all tables
- **Editor**: Create, Read, Update (cannot delete)
- **Moderator**: Read-only access

### Relationships:
```
modules
  └── topics (cascade delete)
      └── lessons (cascade delete)
          ├── flashcards (cascade delete)
          └── questions (cascade delete)
              └── question_options (cascade delete)
```

## ✅ After Running

Once the migration completes:
1. Your content management pages will work
2. You can create modules, topics, lessons, etc.
3. Analytics dashboard will activate (currently deferred)
4. All role-based permissions will be enforced

## 🐛 Troubleshooting

**Error: "relation admin_users does not exist"**
- The admin_users table needs to be created first
- Run the admin_users creation SQL before this migration

**Error: "role authenticated does not exist"**
- This is expected - the policies will work when users log in through your app
- The SQL Editor runs as a database admin, not a logged-in user

**Error: "schema auth does not exist"**
- Make sure you're running this in Supabase SQL Editor, not a local database
- Supabase provides the auth schema automatically
