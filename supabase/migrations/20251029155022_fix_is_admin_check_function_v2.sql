/*
  # Fix is_admin_check Function to Use admin_users Table

  ## Problem
  The `is_admin_check()` function checks the `is_admin` column in the `users` table,
  but the frontend authentication system checks the `admin_users` table instead.
  This mismatch causes authorized admin users to fail RLS checks when trying to
  update site settings.

  ## Root Cause
  - Frontend checks if user exists in `admin_users` table
  - RLS policies use `is_admin_check()` which checks `users.is_admin` column
  - All users have `is_admin = false` in the users table
  - Admin users exist in `admin_users` table but this is not checked by RLS

  ## Solution
  Update the `is_admin_check()` function to check the `admin_users` table instead
  of the `is_admin` column, making it consistent with the frontend authentication.

  ## Changes
  - Replace the existing `is_admin_check()` function using CREATE OR REPLACE
  - New function checks if auth.uid() exists in admin_users table
  - Returns true if user is found in admin_users, false otherwise
  - All dependent RLS policies will automatically use the new implementation

  ## Impact
  - Admin users in the admin_users table will now be able to update site_settings
  - RLS policies will work correctly with the frontend authentication system
  - No changes needed to existing RLS policies (they already reference this function)
*/

-- Replace the function (CREATE OR REPLACE handles dependencies automatically)
CREATE OR REPLACE FUNCTION is_admin_check()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = auth.uid()
  );
$$;

-- Add a comment to document the function
COMMENT ON FUNCTION is_admin_check IS 'Checks if the current user (auth.uid()) exists in the admin_users table. Used by RLS policies to verify admin privileges.';
