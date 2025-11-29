/*
  # Add sales tracking and category images for Trendy Bazar

  1. New Columns
    - `products.sales_count` - Track number of units sold
    - `products.featured` - Mark products as featured/top-selling
    - `categories.image_url` - Category display image
    - `categories.description` - Category description
  
  2. Purpose
    - Enable tracking of top-selling products
    - Allow category browsing with visual representation
    - Support featured product display on homepage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sales_count'
  ) THEN
    ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'featured'
  ) THEN
    ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE categories ADD COLUMN image_url TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'description'
  ) THEN
    ALTER TABLE categories ADD COLUMN description TEXT DEFAULT '';
  END IF;
END $$;