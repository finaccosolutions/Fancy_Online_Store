/*
  # Add stock_quantity column to products table

  1. Changes
    - Add `stock_quantity` column to products table
    - Set default value to 0
    - Allow NULL values for backward compatibility

  2. Notes
    - This column tracks the quantity of each product in stock
    - Used by admin panel for inventory management
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;
END $$;