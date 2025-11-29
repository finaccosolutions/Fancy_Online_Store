/*
  # Add Email and SMTP Configuration Settings

  1. New Settings
    - Add admin email address setting to site_settings table for order notifications
    - SMTP configuration will be handled via environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME)
  
  2. Data
    - Insert default admin email setting (can be updated via admin panel)
  
  3. Security
    - Existing RLS policies on site_settings table apply
*/

-- Insert admin email setting if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE key = 'adminEmail'
  ) THEN
    INSERT INTO site_settings (key, value)
    VALUES ('adminEmail', '"shafeeqkpt@gmail.com"'::jsonb);
  END IF;
END $$;

-- Insert SMTP configuration helper settings for admin panel (optional, for documentation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE key = 'smtpConfigured'
  ) THEN
    INSERT INTO site_settings (key, value)
    VALUES ('smtpConfigured', 'false'::jsonb);
  END IF;
END $$;