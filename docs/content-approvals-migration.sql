-- Content Approvals Table Migration
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('module', 'topic', 'lesson', 'question', 'flashcard')),
  resource_title TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL,
  reviewed_by UUID,
  review_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_submitted_by FOREIGN KEY (submitted_by) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_content_approvals_status ON content_approvals(status);
CREATE INDEX idx_content_approvals_resource_type ON content_approvals(resource_type);
CREATE INDEX idx_content_approvals_submitted_by ON content_approvals(submitted_by);
CREATE INDEX idx_content_approvals_reviewed_by ON content_approvals(reviewed_by);
CREATE INDEX idx_content_approvals_created_at ON content_approvals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmins can see all approvals
CREATE POLICY "Superadmins can view all approvals"
ON content_approvals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role = 'superadmin'
    AND admin_users.is_active = true
  )
);

-- Editors and Moderators can view approvals
CREATE POLICY "Editors and Moderators can view approvals"
ON content_approvals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('editor', 'moderator')
    AND admin_users.is_active = true
  )
);

-- Editors and Superadmins can create approvals
CREATE POLICY "Editors and Superadmins can create approvals"
ON content_approvals FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('superadmin', 'editor')
    AND admin_users.is_active = true
  )
);

-- All admin roles can update approvals (review)
CREATE POLICY "All admins can update approvals"
ON content_approvals FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Only Superadmins can delete approvals
CREATE POLICY "Only Superadmins can delete approvals"
ON content_approvals FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role = 'superadmin'
    AND admin_users.is_active = true
  )
);
