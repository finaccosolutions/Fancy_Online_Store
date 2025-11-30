/*
  # Add Missing Admin Management Tables

  1. New Tables
    - `faqs` - FAQ entries with categories
    - `email_templates` - Email templates for system notifications
    - `testimonials` - Customer testimonials/reviews
    - `coupons` - Discount codes and campaigns
    - `help_articles` - Help center articles
    - `page_content` - Dynamic page content sections
    - `navigation_menu` - Custom navigation menu items
    
  2. Security
    - Enable RLS on all tables
    - Add policies for admin-only access
    
  3. Features
    - FAQ with categories and ordering
    - Email templates with variables
    - Testimonials with rating and approval
    - Coupons with expiry and usage tracking
    - Help articles with categories
    - Page content with sections
    - Navigation menu with hierarchy
*/

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  template_type text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_image_url text,
  rating numeric CHECK (rating >= 1 AND rating <= 5),
  testimonial_text text NOT NULL,
  product_purchased text,
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  max_usage integer,
  current_usage integer DEFAULT 0,
  min_purchase_amount numeric DEFAULT 0,
  max_purchase_amount numeric,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  applicable_to text DEFAULT 'all',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Help Articles Table
CREATE TABLE IF NOT EXISTS help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  subcategory text,
  display_order integer DEFAULT 0,
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published help articles"
  ON help_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage help articles"
  ON help_articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Page Content Table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_key text NOT NULL,
  section_title text,
  section_content text NOT NULL,
  section_order integer DEFAULT 0,
  image_url text,
  button_text text,
  button_link text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_name, section_key)
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active page content"
  ON page_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage page content"
  ON page_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Navigation Menu Table
CREATE TABLE IF NOT EXISTS navigation_menu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_name text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  display_order integer DEFAULT 0,
  parent_id uuid,
  is_active boolean DEFAULT true,
  open_in_new_tab boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (parent_id) REFERENCES navigation_menu(id) ON DELETE CASCADE
);

ALTER TABLE navigation_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active menu items"
  ON navigation_menu FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage navigation menu"
  ON navigation_menu FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faqs_category_active ON faqs(category, is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);

CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved, is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_valid ON coupons(is_active, valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);
CREATE INDEX IF NOT EXISTS idx_help_articles_published_category ON help_articles(is_published, category);

CREATE INDEX IF NOT EXISTS idx_page_content_page_section ON page_content(page_name, section_key);
CREATE INDEX IF NOT EXISTS idx_page_content_active ON page_content(is_active);

CREATE INDEX IF NOT EXISTS idx_navigation_menu_active_order ON navigation_menu(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_parent ON navigation_menu(parent_id);
