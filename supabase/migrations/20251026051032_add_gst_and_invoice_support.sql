/*
  # Add GST and Invoice Support

  ## Changes Made

  1. **Products Table Updates**
     - Add `gst_percentage` column (default 18% for GST)
     - Add `hsn_code` column for HSN/SAC code

  2. **Orders Table Updates**
     - Add `subtotal` column (amount before tax)
     - Add `cgst_amount` column (Central GST)
     - Add `sgst_amount` column (State GST)
     - Add `igst_amount` column (Integrated GST)
     - Add `shipping_charges` column
     - Add `discount_amount` column
     - Add `customer_state` column (to determine GST type)
     - Add `invoice_number` column (auto-generated)

  3. **Order Items Table Updates**
     - Add `gst_percentage` column (snapshot of product GST at time of order)
     - Add `gst_amount` column (calculated GST for this item)
     - Add `subtotal` column (price * quantity before GST)

  4. **Site Settings for Business/Supplier Info**
     - These will be added via key-value pairs in site_settings table
     - No schema changes needed as site_settings uses jsonb

  ## Notes
  - All monetary columns use numeric type for precision
  - Default GST is 18% (can be customized per product)
  - Invoice numbers will be generated automatically
*/

-- Add GST fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'gst_percentage'
  ) THEN
    ALTER TABLE products ADD COLUMN gst_percentage numeric DEFAULT 18 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'hsn_code'
  ) THEN
    ALTER TABLE products ADD COLUMN hsn_code text;
  END IF;
END $$;

-- Add detailed tax breakdown to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal numeric NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'cgst_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN cgst_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'sgst_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN sgst_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'igst_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN igst_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_charges'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_charges numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_state'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_number text;
  END IF;
END $$;

-- Add GST fields to order_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'gst_percentage'
  ) THEN
    ALTER TABLE order_items ADD COLUMN gst_percentage numeric DEFAULT 18;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'gst_amount'
  ) THEN
    ALTER TABLE order_items ADD COLUMN gst_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE order_items ADD COLUMN subtotal numeric DEFAULT 0;
  END IF;
END $$;

-- Create index on invoice_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number ON orders(invoice_number);

-- Create a function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM orders
  WHERE invoice_number LIKE 'INV-' || current_year || '-%';
  
  invoice_num := 'INV-' || current_year || '-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invoice numbers for new orders
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invoice_number ON orders;
CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();