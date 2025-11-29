/*
  # Add Basic Site Settings Columns

  1. New Columns
    - site_name: Site name/title
    - logo_url: Site logo URL
    - primary_color: Primary brand color
    - secondary_color: Secondary brand color

  2. Purpose
    - Add columns that the admin form is trying to save
    - These are separate from the legacy key/value JSONB structure
*/

DO $$
BEGIN
  -- Basic Site Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'site_name') THEN
    ALTER TABLE site_settings ADD COLUMN site_name TEXT DEFAULT 'Velora Tradings';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'logo_url') THEN
    ALTER TABLE site_settings ADD COLUMN logo_url TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'primary_color') THEN
    ALTER TABLE site_settings ADD COLUMN primary_color TEXT DEFAULT '#815536';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'secondary_color') THEN
    ALTER TABLE site_settings ADD COLUMN secondary_color TEXT DEFAULT '#c9baa8';
  END IF;
END $$;