/*
  # Add Product and Site Settings Fields for Enhanced Features

  ## New Product Fields
  1. `price_inclusive_tax` (boolean)
     - Indicates if product price includes GST
     - Default: false
     - Used for GST calculation at checkout

  2. `delivery_days` (integer)
     - Default delivery time gap in days
     - Default: 7
     - Used to calculate estimated delivery date

  ## New Site Settings
  1. `delivery_charge` (decimal)
     - Global delivery charge setting
     - Can be overridden at checkout
     - Stored in site_settings table

  ## Changes
  - Adds new columns to products table
  - Adds delivery_charge to site_settings (via key-value)
  - Updates existing products to have default values
*/

-- Add new columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price_inclusive_tax'
  ) THEN
    ALTER TABLE products ADD COLUMN price_inclusive_tax boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'delivery_days'
  ) THEN
    ALTER TABLE products ADD COLUMN delivery_days integer DEFAULT 7;
  END IF;
END $$;

-- Add delivery_charge to site_settings if it doesn't exist
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES ('delivery_charge', '100', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Add comment for documentation
COMMENT ON COLUMN products.price_inclusive_tax IS 'Indicates if the product price includes GST';
COMMENT ON COLUMN products.delivery_days IS 'Default number of days for delivery after order is placed';