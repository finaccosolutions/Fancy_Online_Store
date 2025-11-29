/*
  # Fix Infinite Recursion in Users Table RLS Policies

  ## Problem
  The "Admins can view all users" policy on the users table creates infinite recursion
  because it references the users table within its own policy check.

  ## Solution
  1. Drop the problematic "Admins can view all users" policy
  2. Create a security definer function to check admin status without recursion
  3. Recreate the admin policy using the function
  4. Add a public read policy for site_settings to allow unauthenticated access

  ## Security Notes
  - The is_admin_check() function is SECURITY DEFINER but safe because it only checks a boolean flag
  - Uses explicit schema qualification to prevent search_path attacks
  - Site settings are made publicly readable (needed for frontend display)
*/

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create a helper function that checks admin status without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- Recreate the admin policy using the function
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (public.is_admin_check());

-- Fix site_settings policies - add public read access
DROP POLICY IF EXISTS "Only admins can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;

-- Allow anyone to read site settings
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

-- Update all other admin-checking policies to use the new function
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (public.is_admin_check());

-- Update orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (public.is_admin_check());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

-- Update categories policies
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

-- Update order_items policies
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (public.is_admin_check());

-- Update order_tracking policies
DROP POLICY IF EXISTS "Admins can manage order tracking" ON order_tracking;

CREATE POLICY "Admins can manage order tracking"
  ON order_tracking FOR ALL
  TO authenticated
  USING (public.is_admin_check())
  WITH CHECK (public.is_admin_check());

-- Update system_logs policies
DROP POLICY IF EXISTS "Admins can view system logs" ON system_logs;

CREATE POLICY "Admins can view system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_check());

-- Update admin_activity_logs policies
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can create activity logs" ON admin_activity_logs;

CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_check());

CREATE POLICY "Admins can create activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_check());

-- Update order_cancellation_reasons policies
DROP POLICY IF EXISTS "Admins can view all order cancellation reasons" ON order_cancellation_reasons;

CREATE POLICY "Admins can view all order cancellation reasons"
  ON order_cancellation_reasons FOR SELECT
  TO authenticated
  USING (public.is_admin_check());
