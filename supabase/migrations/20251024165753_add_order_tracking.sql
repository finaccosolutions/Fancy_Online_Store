/*
  # Add Order Tracking System

  1. New Tables
    - `order_tracking` - Track order status changes and shipping updates
  
  2. Changes
    - Add tracking_number column to orders table
    - Add estimated_delivery column to orders table
    - Add cancellation_reason column to orders table
  
  3. Security
    - Enable RLS on order_tracking table
    - Add policies for users to view their own tracking
    - Admin policies for managing tracking updates
*/

-- Add new columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
  ) THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE orders ADD COLUMN cancellation_reason text;
  END IF;
END $$;

-- Create order tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  location text,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for order_tracking
CREATE POLICY "Users can view own order tracking" ON order_tracking FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);

CREATE POLICY "Admins can manage order tracking" ON order_tracking FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Function to automatically add tracking entry when order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO order_tracking (order_id, status, description)
    VALUES (
      NEW.id,
      NEW.status,
      CASE NEW.status
        WHEN 'pending' THEN 'Order placed and awaiting confirmation'
        WHEN 'confirmed' THEN 'Order confirmed and being prepared'
        WHEN 'shipped' THEN 'Order has been shipped'
        WHEN 'delivered' THEN 'Order delivered successfully'
        WHEN 'cancelled' THEN 'Order has been cancelled'
        ELSE 'Status updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS track_order_status_trigger ON orders;
CREATE TRIGGER track_order_status_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();

-- Insert initial tracking for existing orders
INSERT INTO order_tracking (order_id, status, description, created_at)
SELECT id, status,
  CASE status
    WHEN 'pending' THEN 'Order placed and awaiting confirmation'
    WHEN 'confirmed' THEN 'Order confirmed and being prepared'
    WHEN 'shipped' THEN 'Order has been shipped'
    WHEN 'delivered' THEN 'Order delivered successfully'
    WHEN 'cancelled' THEN 'Order has been cancelled'
    ELSE 'Order created'
  END,
  created_at
FROM orders
WHERE NOT EXISTS (
  SELECT 1 FROM order_tracking WHERE order_tracking.order_id = orders.id
);
