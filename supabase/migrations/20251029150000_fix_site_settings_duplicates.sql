/*
  # Fix Site Settings Duplicate Keys Issue

  ## Problem
  The site_settings table contains duplicate entries for the same key values, causing
  "Cannot coerce the result to a single JSON object" errors when updating settings.

  ## Root Cause
  - Multiple rows exist for the same key value
  - No unique constraint was properly enforced on the key column
  - Updates using .single() fail when multiple rows match

  ## Solution
  1. Remove all duplicate entries, keeping only the most recent one for each key
  2. Ensure the unique constraint on the key column is properly enforced
  3. Add an index for better query performance

  ## Changes
  - Delete duplicate rows (keeping the newest entry for each key)
  - Verify unique constraint exists on key column
  - Add index on key column for performance

  ## Data Safety
  - This migration keeps the most recent value for each setting key
  - Older duplicate entries are removed as they represent stale data
*/

-- Step 1: Remove duplicate entries, keeping only the most recent one for each key
DELETE FROM site_settings
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           key,
           ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC, created_at DESC, id DESC) AS row_num
    FROM site_settings
  ) t
  WHERE row_num > 1
);

-- Step 2: Ensure unique constraint exists on key column
-- First, check if constraint already exists and drop it if needed, then recreate
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'site_settings_key_key'
  ) THEN
    ALTER TABLE site_settings DROP CONSTRAINT site_settings_key_key;
  END IF;

  -- Add unique constraint
  ALTER TABLE site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
END $$;

-- Step 3: Add index on key column for better query performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Step 4: Add a comment to the table for documentation
COMMENT ON TABLE site_settings IS 'Stores site-wide configuration settings as key-value pairs. Each key must be unique.';
