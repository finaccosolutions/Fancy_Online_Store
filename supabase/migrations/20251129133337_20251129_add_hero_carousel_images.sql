/*
  # Add Hero Carousel Images Support

  1. New Table
    - `hero_carousel_images`
      - `id` (uuid, primary key)
      - `image_url` (text, required)
      - `display_order` (integer, for ordering)
      - `is_active` (boolean, to enable/disable images)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `hero_carousel_images` table
    - Add policy to allow public read access (for hero display)
    - Add policy for admin to manage carousel images
*/

CREATE TABLE IF NOT EXISTS hero_carousel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_carousel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active carousel images"
  ON hero_carousel_images FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage carousel images"
  ON hero_carousel_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
