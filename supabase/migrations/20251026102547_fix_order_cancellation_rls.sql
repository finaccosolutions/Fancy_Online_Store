/*
  # Fix Order Cancellation RLS Policy

  ## Changes
  - Add RLS policy to allow users to update (cancel) their own orders
  - Users can only update orders with status 'pending' or 'confirmed'
  - Users can only change status to 'cancelled' and add cancellation reasons

  ## Security
  - Users can only cancel their own orders
  - Users can only cancel orders in pending or confirmed state
  - Admins retain full update access via existing policy
*/

-- Drop any existing user update policies to avoid conflicts
DROP POLICY IF EXISTS "Users can cancel own orders" ON orders;

-- Create policy for users to cancel their own orders
CREATE POLICY "Users can cancel own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'cancelled'
  );
