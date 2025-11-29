/*
  # Add is_admin column to users table

  1. Changes
    - Add is_admin column to public.users table
  
  2. Security
    - Column defaults to false for regular users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;
