/*
  # Fix Order Tracking RLS Policies

  1. Problem
    - Admins cannot update order status due to restrictive RLS policies on order_tracking table
    - Current policies don't allow admins to insert order tracking records
    
  2. Solution
    - Add admin policies for order_tracking table
    - Allow admins to insert, update, and delete order tracking records
    - Keep user policies for viewing their own order tracking
    
  3. Security
    - Admins can perform all operations on order_tracking
    - Users can only view tracking for their own orders
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own order tracking" ON order_tracking;

-- Recreate user view policy
CREATE POLICY "Users can view own order tracking"
  ON order_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Add admin policies for full access
DROP POLICY IF EXISTS "Admins can view all order tracking" ON order_tracking;
CREATE POLICY "Admins can view all order tracking"
  ON order_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert order tracking" ON order_tracking;
CREATE POLICY "Admins can insert order tracking"
  ON order_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update order tracking" ON order_tracking;
CREATE POLICY "Admins can update order tracking"
  ON order_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete order tracking" ON order_tracking;
CREATE POLICY "Admins can delete order tracking"
  ON order_tracking FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Also add system policy to allow edge functions to insert tracking records
DROP POLICY IF EXISTS "System can insert order tracking" ON order_tracking;
CREATE POLICY "System can insert order tracking"
  ON order_tracking FOR INSERT
  WITH CHECK (true);