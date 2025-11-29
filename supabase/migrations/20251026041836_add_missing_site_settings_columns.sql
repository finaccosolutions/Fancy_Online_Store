/*
  # Add Missing Site Settings Columns

  1. New Columns Added
    - admin_email: Admin email for order notifications
    - hero_title: Homepage hero section title
    - hero_subtitle: Homepage hero section subtitle
    - about_hero_title: About page hero title
    - about_hero_subtitle: About page hero subtitle
    - about_story_paragraph1: First paragraph of about story
    - about_story_paragraph2: Second paragraph of about story
    - about_years_experience: Years of experience text
    - about_happy_customers: Happy customers count text
    - about_premium_fragrances: Premium fragrances count text
    - about_value_quality_title: Quality value title
    - about_value_quality_description: Quality value description
    - about_value_customer_title: Customer value title
    - about_value_customer_description: Customer value description
    - about_value_global_title: Global reach value title
    - about_value_global_description: Global reach value description
    - about_value_passion_title: Passion value title
    - about_value_passion_description: Passion value description
    - about_why_choose1 to about_why_choose6: Why choose us points
    - about_cta_title: About page CTA title
    - about_cta_subtitle: About page CTA subtitle
    - contact_hero_subtitle: Contact page hero subtitle
    - contact_address_line1: Contact address line 1
    - contact_address_line2: Contact address line 2
    - contact_city: Contact city
    - contact_country: Contact country
    - contact_phone1: Contact phone number 1
    - contact_phone2: Contact phone number 2
    - contact_email1: Contact email 1
    - contact_email2: Contact email 2
    - contact_email3: Contact email 3
    - contact_hours_mon_fri: Business hours Monday to Friday
    - contact_hours_sat: Business hours Saturday
    - contact_hours_sun: Business hours Sunday
    - contact_hours_holidays: Business hours holidays
    - contact_form_title: Contact form title
    - contact_form_subtitle: Contact form subtitle
    - contact_faq_title: FAQ section title
    - contact_faq_subtitle: FAQ section subtitle
    - contact_faq1_question to contact_faq5_question: FAQ questions
    - contact_faq1_answer to contact_faq5_answer: FAQ answers
    - footer_company_description: Footer company description
    - footer_social_facebook: Footer Facebook URL
    - footer_social_instagram: Footer Instagram URL
    - footer_social_twitter: Footer Twitter URL
    - footer_copyright_text: Footer copyright text

  2. Purpose
    - Allow full customization of all page content through admin panel
    - Prevent 400 errors when saving settings
    - Support multi-page content management
*/

DO $$
BEGIN
  -- Admin Email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'admin_email') THEN
    ALTER TABLE site_settings ADD COLUMN admin_email TEXT DEFAULT 'admin@example.com';
  END IF;

  -- Home Page Hero Section
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_title') THEN
    ALTER TABLE site_settings ADD COLUMN hero_title TEXT DEFAULT 'Discover Your Signature Scent';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_subtitle') THEN
    ALTER TABLE site_settings ADD COLUMN hero_subtitle TEXT DEFAULT 'Experience luxury fragrances that define your personality.';
  END IF;

  -- About Page Content
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_hero_title') THEN
    ALTER TABLE site_settings ADD COLUMN about_hero_title TEXT DEFAULT 'About Us';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_hero_subtitle') THEN
    ALTER TABLE site_settings ADD COLUMN about_hero_subtitle TEXT DEFAULT 'Crafting memories through exquisite fragrances';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_story_paragraph1') THEN
    ALTER TABLE site_settings ADD COLUMN about_story_paragraph1 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_story_paragraph2') THEN
    ALTER TABLE site_settings ADD COLUMN about_story_paragraph2 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_years_experience') THEN
    ALTER TABLE site_settings ADD COLUMN about_years_experience TEXT DEFAULT '5+';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_happy_customers') THEN
    ALTER TABLE site_settings ADD COLUMN about_happy_customers TEXT DEFAULT '10K+';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_premium_fragrances') THEN
    ALTER TABLE site_settings ADD COLUMN about_premium_fragrances TEXT DEFAULT '100+';
  END IF;

  -- About Page Values
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_quality_title') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_quality_title TEXT DEFAULT 'Quality Excellence';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_quality_description') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_quality_description TEXT DEFAULT 'We source only the finest fragrances';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_customer_title') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_customer_title TEXT DEFAULT 'Customer First';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_customer_description') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_customer_description TEXT DEFAULT 'Your satisfaction is our priority';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_global_title') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_global_title TEXT DEFAULT 'Global Reach';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_global_description') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_global_description TEXT DEFAULT 'Bringing international luxury fragrances';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_passion_title') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_passion_title TEXT DEFAULT 'Passion Driven';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_value_passion_description') THEN
    ALTER TABLE site_settings ADD COLUMN about_value_passion_description TEXT DEFAULT 'Our love for fragrances drives us';
  END IF;

  -- About Page Why Choose Us
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_why_choose1') THEN
    ALTER TABLE site_settings ADD COLUMN about_why_choose1 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_why_choose2') THEN
    ALTER TABLE site_settings ADD COLUMN about_why_choose2 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_why_choose3') THEN
    ALTER TABLE site_settings ADD COLUMN about_why_choose3 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_why_choose4') THEN
    ALTER TABLE site_settings ADD COLUMN about_why_choose4 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_why_choose5') THEN
    ALTER TABLE site_settings ADD COLUMN about_why_choose5 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_why_choose6') THEN
    ALTER TABLE site_settings ADD COLUMN about_why_choose6 TEXT DEFAULT '';
  END IF;

  -- About Page CTA
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_cta_title') THEN
    ALTER TABLE site_settings ADD COLUMN about_cta_title TEXT DEFAULT 'Ready to Find Your Signature Scent?';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_cta_subtitle') THEN
    ALTER TABLE site_settings ADD COLUMN about_cta_subtitle TEXT DEFAULT 'Explore our curated collection of premium fragrances';
  END IF;

  -- Contact Page Hero
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_hero_subtitle') THEN
    ALTER TABLE site_settings ADD COLUMN contact_hero_subtitle TEXT DEFAULT 'Have questions about our fragrances?';
  END IF;

  -- Contact Page Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_address_line1') THEN
    ALTER TABLE site_settings ADD COLUMN contact_address_line1 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_address_line2') THEN
    ALTER TABLE site_settings ADD COLUMN contact_address_line2 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_city') THEN
    ALTER TABLE site_settings ADD COLUMN contact_city TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_country') THEN
    ALTER TABLE site_settings ADD COLUMN contact_country TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_phone1') THEN
    ALTER TABLE site_settings ADD COLUMN contact_phone1 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_phone2') THEN
    ALTER TABLE site_settings ADD COLUMN contact_phone2 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_email1') THEN
    ALTER TABLE site_settings ADD COLUMN contact_email1 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_email2') THEN
    ALTER TABLE site_settings ADD COLUMN contact_email2 TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_email3') THEN
    ALTER TABLE site_settings ADD COLUMN contact_email3 TEXT DEFAULT '';
  END IF;

  -- Contact Page Business Hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_hours_mon_fri') THEN
    ALTER TABLE site_settings ADD COLUMN contact_hours_mon_fri TEXT DEFAULT 'Monday - Friday: 10AM - 8PM';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_hours_sat') THEN
    ALTER TABLE site_settings ADD COLUMN contact_hours_sat TEXT DEFAULT 'Saturday: 10AM - 8PM';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_hours_sun') THEN
    ALTER TABLE site_settings ADD COLUMN contact_hours_sun TEXT DEFAULT 'Sunday: 11AM - 6PM';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_hours_holidays') THEN
    ALTER TABLE site_settings ADD COLUMN contact_hours_holidays TEXT DEFAULT 'Holidays: 12PM - 5PM';
  END IF;

  -- Contact Page Form Section
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_form_title') THEN
    ALTER TABLE site_settings ADD COLUMN contact_form_title TEXT DEFAULT 'Send Us a Message';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_form_subtitle') THEN
    ALTER TABLE site_settings ADD COLUMN contact_form_subtitle TEXT DEFAULT 'Fill out the form below';
  END IF;

  -- Contact Page FAQ Section
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq_title') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq_title TEXT DEFAULT 'Frequently Asked Questions';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq_subtitle') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq_subtitle TEXT DEFAULT 'Quick answers to common questions';
  END IF;

  -- Contact FAQ 1
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq1_question') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq1_question TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq1_answer') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq1_answer TEXT DEFAULT '';
  END IF;

  -- Contact FAQ 2
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq2_question') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq2_question TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq2_answer') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq2_answer TEXT DEFAULT '';
  END IF;

  -- Contact FAQ 3
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq3_question') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq3_question TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq3_answer') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq3_answer TEXT DEFAULT '';
  END IF;

  -- Contact FAQ 4
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq4_question') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq4_question TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq4_answer') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq4_answer TEXT DEFAULT '';
  END IF;

  -- Contact FAQ 5
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq5_question') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq5_question TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_faq5_answer') THEN
    ALTER TABLE site_settings ADD COLUMN contact_faq5_answer TEXT DEFAULT '';
  END IF;

  -- Footer Content
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footer_company_description') THEN
    ALTER TABLE site_settings ADD COLUMN footer_company_description TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footer_social_facebook') THEN
    ALTER TABLE site_settings ADD COLUMN footer_social_facebook TEXT DEFAULT '#';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footer_social_instagram') THEN
    ALTER TABLE site_settings ADD COLUMN footer_social_instagram TEXT DEFAULT '#';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footer_social_twitter') THEN
    ALTER TABLE site_settings ADD COLUMN footer_social_twitter TEXT DEFAULT '#';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footer_copyright_text') THEN
    ALTER TABLE site_settings ADD COLUMN footer_copyright_text TEXT DEFAULT '© 2025 All rights reserved.';
  END IF;
END $$;