-- 0019_seed_bedsheet_series.sql
-- Production Data Entry: BED SHEET SERIES

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
  '1003',
  'BED SHEET SERIES',
  'Premium 100% super-soft Glace Cotton double bedsheet set with 2 matching pillow covers. High thread count, skin-safe colors, shrink-proof, and fade-resistant designer prints.',
  450,
  699,
  35,
  50,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_mario_7029.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_smiley_3051.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_animal_3025.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_checkerboard_4012.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_rose_3078.png"]',
  'cat_bedding',
  1,
  'Special',
  'Hot Deal',
  '["100% Super Soft Glace Cotton: High-density fine yarn weaving for luxury breathability","Includes 2 Large Pillow Covers: Complete matching double bedsheet set","Vibrant Color Fast Prints: Tested against color fading and fabric pilling after multiple washes","5 Trending Design Variants: Mario Lattice #7029, Smiley Yellow #3051, Cartoon Animal #3025, Checkerboard #4012, and Rose Floral #3078"]',
  '[{"name":"Mario Lattice #7029","hex":"#bd2a3b"},{"name":"Smiley Yellow #3051","hex":"#eab308"},{"name":"Cartoon Animal #3025","hex":"#38bdf8"},{"name":"Checkerboard #4012","hex":"#16a34a"},{"name":"Espresso Rose #3078","hex":"#78350f"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_bedsheet_1', '1003', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_mario_7029.jpg', 'Mario Lattice #7029', '#bd2a3b', 1, 0),
('img_bedsheet_2', '1003', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_smiley_3051.jpg', 'Smiley Yellow #3051', '#eab308', 0, 1),
('img_bedsheet_3', '1003', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_animal_3025.jpg', 'Cartoon Animal #3025', '#38bdf8', 0, 2),
('img_bedsheet_4', '1003', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_checkerboard_4012.jpg', 'Checkerboard #4012', '#16a34a', 0, 3),
('img_bedsheet_5', '1003', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/bedsheet_rose_3078.png', 'Espresso Rose #3078', '#78350f', 0, 4);
