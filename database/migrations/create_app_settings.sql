-- Create app_settings table for platform configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- General Settings
  site_name VARCHAR(255) NOT NULL DEFAULT 'Jeeva Learning Platform',
  site_description TEXT,
  contact_email VARCHAR(255),
  support_email VARCHAR(255),
  logo_url TEXT,
  favicon_url TEXT,
  
  -- Feature Toggles
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  registration_enabled BOOLEAN NOT NULL DEFAULT true,
  email_verification_required BOOLEAN NOT NULL DEFAULT true,
  
  -- File Upload Settings
  max_file_upload_size INTEGER NOT NULL DEFAULT 5, -- in MB
  allowed_file_types TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
  
  -- Security Settings
  session_timeout INTEGER NOT NULL DEFAULT 60, -- in minutes
  password_min_length INTEGER NOT NULL DEFAULT 8,
  password_require_uppercase BOOLEAN NOT NULL DEFAULT true,
  password_require_lowercase BOOLEAN NOT NULL DEFAULT true,
  password_require_numbers BOOLEAN NOT NULL DEFAULT true,
  password_require_special_chars BOOLEAN NOT NULL DEFAULT true,
  
  -- Notification Settings
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  new_user_signup BOOLEAN NOT NULL DEFAULT true,
  content_submitted BOOLEAN NOT NULL DEFAULT true,
  content_approved BOOLEAN NOT NULL DEFAULT true,
  content_rejected BOOLEAN NOT NULL DEFAULT true,
  subscription_expiring BOOLEAN NOT NULL DEFAULT true,
  subscription_renewed BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

-- Insert default settings if table is empty
INSERT INTO app_settings (
  site_name,
  site_description,
  contact_email,
  support_email
) 
SELECT
  'Jeeva Learning Platform',
  'Comprehensive learning management system for students',
  'contact@jeeva.com',
  'support@jeeva.com'
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Enable Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated admin users can read/write settings
CREATE POLICY "Admin users can view settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Superadmin can update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'superadmin'
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'superadmin'
      AND admin_users.is_active = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON app_settings(updated_at DESC);
