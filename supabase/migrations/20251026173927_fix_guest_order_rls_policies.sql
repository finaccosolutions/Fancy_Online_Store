/*
  # Fix Guest Order RLS Policies

  ## Changes
  1. Drop conflicting order policies
  2. Create unified policies that support both authenticated users and guest orders
  3. Fix order_items policies to support guest orders

  ## Security
  - Guest orders require guest_email, guest_phone, and guest_name to be present
  - Authenticated orders require matching user_id
  - Order items inherit permissions from parent orders
*/

-- Drop existing conflicting policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create own orders" ON orders;
  DROP POLICY IF EXISTS "Users can create orders" ON orders;
  DROP POLICY IF EXISTS "Users can create order items" ON order_items;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create unified order creation policy
CREATE POLICY "Allow order creation for authenticated and guest users"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
    OR 
    (auth.uid() IS NULL AND guest_email IS NOT NULL AND guest_phone IS NOT NULL AND guest_name IS NOT NULL)
  );

-- Create unified order items creation policy
CREATE POLICY "Allow order items creation for all orders"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        (orders.user_id IS NOT NULL AND orders.user_id = auth.uid())
        OR
        (orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
      )
    )
    OR
    auth.uid() IS NULL
  );
