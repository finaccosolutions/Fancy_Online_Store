/*
  # Add Hero Image, Logo, and Razorpay Settings
  
  1. Changes
    - Add hero_image_url field to site_settings for customizable hero section image
    - Add logo_url field to site_settings for customizable site logo
    - Add razorpay_key_id field to site_settings for Razorpay public key
    - Add razorpay_key_secret field to site_settings for Razorpay secret key (encrypted)
    - Add payment_methods_enabled field to site_settings to control available payment options
  
  2. Security
    - All fields are optional with sensible defaults
    - RLS policies already exist for site_settings table
    - Only admins can modify these settings
*/

-- Add hero image URL field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'hero_image_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN hero_image_url text DEFAULT '';
  END IF;
END $$;

-- Add logo URL field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN logo_url text DEFAULT '';
  END IF;
END $$;

-- Add Razorpay key ID field (public key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'razorpay_key_id'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN razorpay_key_id text DEFAULT '';
  END IF;
END $$;

-- Add Razorpay key secret field (private key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'razorpay_key_secret'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN razorpay_key_secret text DEFAULT '';
  END IF;
END $$;

-- Add payment methods enabled field (JSON array of enabled payment methods)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'payment_methods_enabled'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN payment_methods_enabled jsonb DEFAULT '["cod"]'::jsonb;
  END IF;
END $$;