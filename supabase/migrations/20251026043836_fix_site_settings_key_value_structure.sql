/*
  # Fix Site Settings Table Structure

  ## Problem
  The site_settings table was incorrectly modified to have individual columns for each setting
  (smtp_host, smtp_port, site_name, etc.) instead of using a proper key-value structure.
  This approach is inefficient and inflexible.

  ## Solution
  1. Drop all the incorrectly added columns
  2. Keep only the original key-value structure: id, key, value, created_at, updated_at
  3. All settings will be stored as key-value pairs in the value JSONB column

  ## Changes
  - Remove all setting-specific columns (91 columns)
  - Maintain the original key-value design with:
    - `key` (text, unique) - The setting identifier
    - `value` (jsonb) - The setting value
    - Standard id, created_at, updated_at columns

  ## Migration Strategy
  - Safe to drop columns as they contain no valuable data
  - The key-value structure is more maintainable and flexible
*/

DO $$
BEGIN
  -- Drop all setting-specific columns
  ALTER TABLE site_settings 
    DROP COLUMN IF EXISTS smtp_host,
    DROP COLUMN IF EXISTS smtp_port,
    DROP COLUMN IF EXISTS smtp_secure,
    DROP COLUMN IF EXISTS smtp_user,
    DROP COLUMN IF EXISTS smtp_password,
    DROP COLUMN IF EXISTS smtp_from_email,
    DROP COLUMN IF EXISTS smtp_from_name,
    DROP COLUMN IF EXISTS site_logo_url,
    DROP COLUMN IF EXISTS site_favicon_url,
    DROP COLUMN IF EXISTS currency_symbol,
    DROP COLUMN IF EXISTS currency_code,
    DROP COLUMN IF EXISTS tax_rate,
    DROP COLUMN IF EXISTS shipping_enabled,
    DROP COLUMN IF EXISTS free_shipping_threshold,
    DROP COLUMN IF EXISTS contact_phone,
    DROP COLUMN IF EXISTS contact_address,
    DROP COLUMN IF EXISTS social_facebook,
    DROP COLUMN IF EXISTS social_twitter,
    DROP COLUMN IF EXISTS social_instagram,
    DROP COLUMN IF EXISTS social_linkedin,
    DROP COLUMN IF EXISTS meta_title,
    DROP COLUMN IF EXISTS meta_description,
    DROP COLUMN IF EXISTS meta_keywords,
    DROP COLUMN IF EXISTS google_analytics_id,
    DROP COLUMN IF EXISTS maintenance_mode,
    DROP COLUMN IF EXISTS maintenance_message,
    DROP COLUMN IF EXISTS admin_email,
    DROP COLUMN IF EXISTS hero_title,
    DROP COLUMN IF EXISTS hero_subtitle,
    DROP COLUMN IF EXISTS about_hero_title,
    DROP COLUMN IF EXISTS about_hero_subtitle,
    DROP COLUMN IF EXISTS about_story_paragraph1,
    DROP COLUMN IF EXISTS about_story_paragraph2,
    DROP COLUMN IF EXISTS about_years_experience,
    DROP COLUMN IF EXISTS about_happy_customers,
    DROP COLUMN IF EXISTS about_premium_fragrances,
    DROP COLUMN IF EXISTS about_value_quality_title,
    DROP COLUMN IF EXISTS about_value_quality_description,
    DROP COLUMN IF EXISTS about_value_customer_title,
    DROP COLUMN IF EXISTS about_value_customer_description,
    DROP COLUMN IF EXISTS about_value_global_title,
    DROP COLUMN IF EXISTS about_value_global_description,
    DROP COLUMN IF EXISTS about_value_passion_title,
    DROP COLUMN IF EXISTS about_value_passion_description,
    DROP COLUMN IF EXISTS about_why_choose1,
    DROP COLUMN IF EXISTS about_why_choose2,
    DROP COLUMN IF EXISTS about_why_choose3,
    DROP COLUMN IF EXISTS about_why_choose4,
    DROP COLUMN IF EXISTS about_why_choose5,
    DROP COLUMN IF EXISTS about_why_choose6,
    DROP COLUMN IF EXISTS about_cta_title,
    DROP COLUMN IF EXISTS about_cta_subtitle,
    DROP COLUMN IF EXISTS contact_hero_subtitle,
    DROP COLUMN IF EXISTS contact_address_line1,
    DROP COLUMN IF EXISTS contact_address_line2,
    DROP COLUMN IF EXISTS contact_city,
    DROP COLUMN IF EXISTS contact_country,
    DROP COLUMN IF EXISTS contact_phone1,
    DROP COLUMN IF EXISTS contact_phone2,
    DROP COLUMN IF EXISTS contact_email1,
    DROP COLUMN IF EXISTS contact_email2,
    DROP COLUMN IF EXISTS contact_email3,
    DROP COLUMN IF EXISTS contact_hours_mon_fri,
    DROP COLUMN IF EXISTS contact_hours_sat,
    DROP COLUMN IF EXISTS contact_hours_sun,
    DROP COLUMN IF EXISTS contact_hours_holidays,
    DROP COLUMN IF EXISTS contact_form_title,
    DROP COLUMN IF EXISTS contact_form_subtitle,
    DROP COLUMN IF EXISTS contact_faq_title,
    DROP COLUMN IF EXISTS contact_faq_subtitle,
    DROP COLUMN IF EXISTS contact_faq1_question,
    DROP COLUMN IF EXISTS contact_faq1_answer,
    DROP COLUMN IF EXISTS contact_faq2_question,
    DROP COLUMN IF EXISTS contact_faq2_answer,
    DROP COLUMN IF EXISTS contact_faq3_question,
    DROP COLUMN IF EXISTS contact_faq3_answer,
    DROP COLUMN IF EXISTS contact_faq4_question,
    DROP COLUMN IF EXISTS contact_faq4_answer,
    DROP COLUMN IF EXISTS contact_faq5_question,
    DROP COLUMN IF EXISTS contact_faq5_answer,
    DROP COLUMN IF EXISTS footer_company_description,
    DROP COLUMN IF EXISTS footer_social_facebook,
    DROP COLUMN IF EXISTS footer_social_instagram,
    DROP COLUMN IF EXISTS footer_social_twitter,
    DROP COLUMN IF EXISTS footer_copyright_text,
    DROP COLUMN IF EXISTS site_name,
    DROP COLUMN IF EXISTS logo_url,
    DROP COLUMN IF EXISTS primary_color,
    DROP COLUMN IF EXISTS secondary_color;
END $$;