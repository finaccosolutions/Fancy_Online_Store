/*
  # Add Comprehensive E-commerce Features

  1. New Columns for Products
    - `price_inclusive_of_tax` (boolean) - Whether product price includes GST
    - `default_delivery_days` (integer) - Default days between order and delivery

  2. New Columns for Orders
    - `expected_delivery_date` (timestamptz) - Calculated expected delivery date
    - `cancellation_reason_type` (text) - Predefined reason or 'other'
    - Modify `cancellation_reason` to accept longer text

  3. New Settings for Site
    - `delivery_charge` (numeric) - Flat delivery charge for all orders
    - Update existing delivery logic

  4. Indexes for Performance
    - Add indexes for commonly queried fields

  ## Changes Made
  - Products table: Added price_inclusive_of_tax and default_delivery_days
  - Orders table: Added expected_delivery_date and cancellation_reason_type
  - Site_settings table: Ensure delivery_charge is available
*/

-- Add new columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price_inclusive_of_tax'
  ) THEN
    ALTER TABLE products ADD COLUMN price_inclusive_of_tax boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'default_delivery_days'
  ) THEN
    ALTER TABLE products ADD COLUMN default_delivery_days integer DEFAULT 7;
    COMMENT ON COLUMN products.default_delivery_days IS 'Default days between order date and delivery date';
  END IF;
END $$;

-- Add new columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'expected_delivery_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN expected_delivery_date timestamptz;
    COMMENT ON COLUMN orders.expected_delivery_date IS 'Expected delivery date calculated at order time';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancellation_reason_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN cancellation_reason_type text;
    COMMENT ON COLUMN orders.cancellation_reason_type IS 'Predefined cancellation reason category';
  END IF;
END $$;

-- Ensure cancellation_reason can hold longer text
ALTER TABLE orders ALTER COLUMN cancellation_reason TYPE text;

-- Add delivery_charge to site_settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'delivery_charge'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN delivery_charge numeric(10, 2) DEFAULT 0;
    COMMENT ON COLUMN site_settings.delivery_charge IS 'Flat delivery charge applied to all orders (0 for free delivery)';
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_expected_delivery_date ON orders(expected_delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_cancellation_reason_type ON orders(cancellation_reason_type) WHERE cancellation_reason_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_price_inclusive_tax ON products(price_inclusive_of_tax);

-- Update existing products to have default delivery days if null
UPDATE products SET default_delivery_days = 7 WHERE default_delivery_days IS NULL;
UPDATE products SET price_inclusive_of_tax = false WHERE price_inclusive_of_tax IS NULL;