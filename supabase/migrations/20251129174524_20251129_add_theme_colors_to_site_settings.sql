/*
  # Add Theme Color Configuration to Site Settings

  1. New Columns Added to site_settings Table:
    - primary_bg_color (text): Main background color (e.g., #0A8DB0 for blue)
    - primary_text_color (text): Main text color
    - secondary_bg_color (text): Secondary background color
    - accent_color (text): Accent/highlight color (e.g., #D4AF37 for yellow)
    - button_primary_color (text): Primary button color
    - button_hover_color (text): Primary button hover state color
    - border_color (text): Default border color
    - footer_bg_color (text): Footer background color
    - header_bg_color (text): Header background color

  2. Default Values Set:
    - primary_bg_color: #0A8DB0 (blue)
    - primary_text_color: #ffffff (white)
    - secondary_bg_color: #f3f4f6 (light gray)
    - accent_color: #D4AF37 (yellow)
    - button_primary_color: #0A8DB0 (blue)
    - button_hover_color: #0891b2 (darker blue)
    - border_color: #e5e7eb (light gray)
    - footer_bg_color: #1e293b (dark slate)
    - header_bg_color: #ffffff (white)

  3. Security: RLS is already enabled on site_settings table
*/

DO $$
BEGIN
  -- Add primary_bg_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'primary_bg_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN primary_bg_color text DEFAULT '#0A8DB0';
  END IF;

  -- Add primary_text_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'primary_text_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN primary_text_color text DEFAULT '#ffffff';
  END IF;

  -- Add secondary_bg_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'secondary_bg_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN secondary_bg_color text DEFAULT '#f3f4f6';
  END IF;

  -- Add accent_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'accent_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN accent_color text DEFAULT '#D4AF37';
  END IF;

  -- Add button_primary_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'button_primary_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN button_primary_color text DEFAULT '#0A8DB0';
  END IF;

  -- Add button_hover_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'button_hover_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN button_hover_color text DEFAULT '#0891b2';
  END IF;

  -- Add border_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'border_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN border_color text DEFAULT '#e5e7eb';
  END IF;

  -- Add footer_bg_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'footer_bg_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN footer_bg_color text DEFAULT '#1e293b';
  END IF;

  -- Add header_bg_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'header_bg_color'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN header_bg_color text DEFAULT '#ffffff';
  END IF;
END $$;
