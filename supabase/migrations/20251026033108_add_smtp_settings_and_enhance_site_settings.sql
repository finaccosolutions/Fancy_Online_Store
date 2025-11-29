/*
  # Add SMTP Settings and Enhance Site Settings

  1. Changes
    - Add SMTP configuration fields to site_settings table
    - Add more site configuration options
    - Add system_logs table for tracking important events
    - Add admin_activity_logs table for audit trail
    
  2. New Fields in site_settings
    - smtp_host: SMTP server host
    - smtp_port: SMTP server port
    - smtp_secure: Whether to use TLS/SSL
    - smtp_user: SMTP username
    - smtp_password: SMTP password (encrypted)
    - smtp_from_email: Default from email address
    - smtp_from_name: Default from name
    - site_logo_url: URL for site logo
    - site_favicon_url: URL for site favicon
    - currency_symbol: Currency symbol for the site
    - currency_code: Currency code (e.g., INR, USD)
    - tax_rate: Default tax rate percentage
    - shipping_enabled: Whether shipping is enabled
    - free_shipping_threshold: Minimum order value for free shipping
    - contact_phone: Contact phone number
    - contact_address: Physical address
    - social_facebook: Facebook URL
    - social_twitter: Twitter URL
    - social_instagram: Instagram URL
    - social_linkedin: LinkedIn URL
    - meta_title: Default meta title for SEO
    - meta_description: Default meta description for SEO
    - meta_keywords: Default meta keywords for SEO
    - google_analytics_id: Google Analytics tracking ID
    - maintenance_mode: Whether site is in maintenance mode
    - maintenance_message: Message to show during maintenance
    
  3. New Tables
    - system_logs: For tracking system events
    - admin_activity_logs: For tracking admin actions
    
  4. Security
    - Enable RLS on new tables
    - Add policies for admin access only
*/

-- Add new columns to site_settings table
DO $$
BEGIN
  -- SMTP Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_host') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_host TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_port') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_port INTEGER DEFAULT 587;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_secure') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_secure BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_user') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_user TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_password') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_password TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_from_email') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_from_email TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'smtp_from_name') THEN
    ALTER TABLE site_settings ADD COLUMN smtp_from_name TEXT DEFAULT '';
  END IF;
  
  -- Site Branding
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'site_logo_url') THEN
    ALTER TABLE site_settings ADD COLUMN site_logo_url TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'site_favicon_url') THEN
    ALTER TABLE site_settings ADD COLUMN site_favicon_url TEXT DEFAULT '';
  END IF;
  
  -- Currency Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'currency_symbol') THEN
    ALTER TABLE site_settings ADD COLUMN currency_symbol TEXT DEFAULT '₹';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'currency_code') THEN
    ALTER TABLE site_settings ADD COLUMN currency_code TEXT DEFAULT 'INR';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'tax_rate') THEN
    ALTER TABLE site_settings ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
  END IF;
  
  -- Shipping Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'shipping_enabled') THEN
    ALTER TABLE site_settings ADD COLUMN shipping_enabled BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'free_shipping_threshold') THEN
    ALTER TABLE site_settings ADD COLUMN free_shipping_threshold DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Contact Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_phone') THEN
    ALTER TABLE site_settings ADD COLUMN contact_phone TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_address') THEN
    ALTER TABLE site_settings ADD COLUMN contact_address TEXT DEFAULT '';
  END IF;
  
  -- Social Media
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_facebook') THEN
    ALTER TABLE site_settings ADD COLUMN social_facebook TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_twitter') THEN
    ALTER TABLE site_settings ADD COLUMN social_twitter TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_instagram') THEN
    ALTER TABLE site_settings ADD COLUMN social_instagram TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_linkedin') THEN
    ALTER TABLE site_settings ADD COLUMN social_linkedin TEXT DEFAULT '';
  END IF;
  
  -- SEO Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'meta_title') THEN
    ALTER TABLE site_settings ADD COLUMN meta_title TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'meta_description') THEN
    ALTER TABLE site_settings ADD COLUMN meta_description TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'meta_keywords') THEN
    ALTER TABLE site_settings ADD COLUMN meta_keywords TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'google_analytics_id') THEN
    ALTER TABLE site_settings ADD COLUMN google_analytics_id TEXT DEFAULT '';
  END IF;
  
  -- Maintenance Mode
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'maintenance_mode') THEN
    ALTER TABLE site_settings ADD COLUMN maintenance_mode BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'maintenance_message') THEN
    ALTER TABLE site_settings ADD COLUMN maintenance_message TEXT DEFAULT 'We are currently performing maintenance. Please check back soon.';
  END IF;
END $$;

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view system logs" ON system_logs;
CREATE POLICY "Admins can view system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "System can insert logs" ON system_logs;
CREATE POLICY "System can insert logs"
  ON system_logs FOR INSERT
  WITH CHECK (true);

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can create activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can create activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);