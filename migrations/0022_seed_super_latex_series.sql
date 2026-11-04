-- 0022_seed_super_latex_series.sql
-- Production Data Entry: SUPER LATEX SERIES

INSERT OR REPLACE INTO products (
  id,
  name,
  description,
  price,
  original_price,
  discount_percent,
  stock,
  images,
  category_id,
  is_trending,
  offer_badge_prefix,
  offer_badge_value,
  about,
  color_variants
) VALUES (
  '1006',
  'SUPER LATEX SERIES',
  '100% natural organic Pinocore latex luxury mattress collection. Engineered with pin-core ventilation, buoyant pressure-free bounce, and hypoallergenic organic latex. Available in Single Side Tape Edge and Removable Zipper Cover finishes.',
  17000,
  23999,
  29,
  20,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_stack.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_grid_quilt.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_wave_swirl.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_foam_slabs.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_zipper_cover.jpg"]',
  'cat_mattresses',
  1,
  'Special',
  'Organic Luxury',
  '["3 Premium Latex Core Formulations: Full Latex Mattress, HR Foam with Pure Latex, and Bonded Foam with Pure Latex","2 Enclosure Styles Included: Single Side Tape Edge finish and Removable Premium Zipper Cover for easy maintenance","100% Natural Organic Pinocore Latex: Breathable open-cell structure dissipates body heat for sweat-free deep sleep","Zero Motion Transfer & 10-Year Warranty: Handcrafted in Paramathi Velur, Tamil Nadu with eco-certified skin-safe fabrics"]',
  '[{"name":"1. Full Latex Mattress","hex":"#10b981"},{"name":"2. HR Foam with Pure Latex","hex":"#0ea9df"},{"name":"3. Bonded Foam with Pure Latex","hex":"#191142"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_latex_1', '1006', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_stack.jpg', '1. Full Latex Mattress Stack', '#10b981', 1, 0),
('img_latex_2', '1006', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_grid_quilt.jpg', '2. HR Foam with Pure Latex (Grid Quilt)', '#0ea9df', 0, 1),
('img_latex_3', '1006', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_wave_swirl.jpg', '3. Bonded Foam with Pure Latex (Swirl Quilt)', '#191142', 0, 2),
('img_latex_4', '1006', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_foam_slabs.jpg', 'Pinocore Organic Latex Foam Slabs', '#10b981', 0, 3),
('img_latex_5', '1006', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/super_latex_zipper_cover.jpg', 'Removable Zipper Cover Enclosure', '#191142', 0, 4);
