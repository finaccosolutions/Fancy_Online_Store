/*
  # Add GST and Billing Fields

  ## Overview
  This migration adds support for:
  - Customer GSTIN collection in addresses
  - Billing address separate from delivery address
  - Supplier/Business details for invoicing and GST compliance
  
  ## Changes Made

  1. **Addresses Table Updates**
     - Add `is_gst_registered` boolean flag
     - Add `gstin` text field for GST Identification Number
     - Add `address_type` field to distinguish between delivery and billing addresses
  
  2. **Orders Table Updates**
     - Add `billing_address` JSONB field for separate billing address
     - Add `billing_same_as_delivery` boolean flag
  
  3. **Site Settings for Supplier Details**
     - Add business_name, business_address, business_city, business_state, business_pincode
     - Add business_phone, business_email, gst_number
     - Add invoice_terms, invoice_footer
     - These will be stored as key-value pairs in site_settings table
  
  ## Notes
  - GSTIN format: 15 characters (e.g., 27AAPFU0939F1ZV)
  - All fields are optional to maintain backward compatibility
  - Billing address defaults to delivery address if not specified
*/

-- Add GST registration fields to addresses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'is_gst_registered'
  ) THEN
    ALTER TABLE addresses ADD COLUMN is_gst_registered boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'gstin'
  ) THEN
    ALTER TABLE addresses ADD COLUMN gstin text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addresses' AND column_name = 'address_type'
  ) THEN
    ALTER TABLE addresses ADD COLUMN address_type text DEFAULT 'delivery' CHECK (address_type IN ('delivery', 'billing', 'both'));
  END IF;
END $$;

-- Add billing address fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_address jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'billing_same_as_delivery'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_same_as_delivery boolean DEFAULT true;
  END IF;
END $$;

-- Add comment explaining the structure
COMMENT ON COLUMN addresses.gstin IS 'GST Identification Number (15 characters)';
COMMENT ON COLUMN addresses.is_gst_registered IS 'Flag indicating if customer is GST registered';
COMMENT ON COLUMN addresses.address_type IS 'Type of address: delivery, billing, or both';
COMMENT ON COLUMN orders.billing_address IS 'Separate billing address if different from delivery address';
COMMENT ON COLUMN orders.billing_same_as_delivery IS 'Flag indicating if billing address is same as delivery address';

-- Create index for faster GSTIN lookups
CREATE INDEX IF NOT EXISTS idx_addresses_gstin ON addresses(gstin) WHERE gstin IS NOT NULL;