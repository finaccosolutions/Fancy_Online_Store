/*
  # Fix Product Table Duplicate Columns
  
  1. Issues Addressed
    - Remove duplicate columns that cause product update issues
    - The table has both `price_inclusive_tax` and `price_inclusive_of_tax`
    - The table has both `delivery_days` and `default_delivery_days`
    - This causes data to be saved to one column while being read from another
  
  2. Changes
    - Drop the older duplicate columns: `price_inclusive_tax` and `delivery_days`
    - Keep the standardized columns: `price_inclusive_of_tax` and `default_delivery_days`
  
  3. Notes
    - This ensures consistency between frontend form and database
    - Data migration is not needed as these are new features
*/

-- Drop duplicate columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price_inclusive_tax'
  ) THEN
    ALTER TABLE products DROP COLUMN price_inclusive_tax;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'delivery_days'
  ) THEN
    ALTER TABLE products DROP COLUMN delivery_days;
  END IF;
END $$;
