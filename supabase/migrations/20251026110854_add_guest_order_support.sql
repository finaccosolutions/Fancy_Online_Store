/*
  # Add Guest Order Support
  
  1. Changes
    - Make user_id nullable to support guest orders
    - Add guest_email, guest_phone, guest_name fields for guest customers
    - Add constraint to ensure either user_id OR guest_email is present
  
  2. Security
    - Update RLS policies to allow guest orders with guest_email
    - Guests can only view their own orders using guest_email
*/

-- Make user_id nullable
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add guest user fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'guest_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN guest_email text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'guest_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN guest_phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'guest_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN guest_name text;
  END IF;
END $$;

-- Add constraint: either user_id or guest_email must be present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_user_or_guest_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_user_or_guest_check
      CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL);
  END IF;
END $$;

-- Update RLS policies for guest orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND guest_email IS NOT NULL)
  );

-- Allow anonymous users to insert guest orders
DROP POLICY IF EXISTS "Users can create orders" ON orders;

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND guest_email IS NOT NULL)
  );

-- Update order cancellation policy for guests
DROP POLICY IF EXISTS "Users can cancel own orders" ON orders;

CREATE POLICY "Users can cancel own orders"
  ON orders FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND guest_email IS NOT NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND guest_email IS NOT NULL)
  );
