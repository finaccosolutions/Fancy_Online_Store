/*
  # Add Image URL Settings for Admin Management

  1. New Columns
    - `hero_image_url` (text) - URL for hero section image
    - `logo_url` (text) - URL for site logo
    - `banner_image_url` (text) - URL for banner images
    - `favicon_url` (text) - URL for site favicon

  2. Purpose
    - Allows admins to manage all images used in the site from admin settings panel
    - Supports changing hero section image, logo, and other visual elements dynamically

  3. Security
    - These are settings-only columns, no RLS changes needed
    - RLS already enabled on site_settings table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'hero_image_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN hero_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'banner_image_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN banner_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'favicon_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN favicon_url text;
  END IF;
END $$;