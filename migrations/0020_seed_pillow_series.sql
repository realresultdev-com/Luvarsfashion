-- 0020_seed_pillow_series.sql
-- Production Data Entry: ORTHOPEDIC PILLOW SERIES

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
  '1004',
  'ORTHOPEDIC PILLOW SERIES',
  'Therapeutic cervical neck support and orthopedic alignment pillows. Available in 6 specialized variations: Micro Fibre, Memory Foam Contour, Memory Foam Neck Guard, Pure Latex Contour, Pure Latex Neck Guard, and Pure Latex Shredded Pillow.',
  250,
  499,
  50,
  50,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_latex_contour_linen.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_latex_pincore.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_latex_stacked.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_memory_contour.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_slow_rebound_diagram.jpg"]',
  'cat_pillows',
  1,
  'Special',
  'Top Rated',
  '["6 Ergonomic Pillow Variations: Micro Fibre, Memory Foam Contour, Memory Foam Neck Guard, Pure Latex Contour, Pure Latex Neck Guard, & Pure Latex Shredded","5-Second Slow Rebound Memory Foam: Relieves cervical pressure points and supports natural neck curvature","Organic Pin-Core Latex Airflow: Breathable open-cell natural latex dissipates body heat","Washable Hypoallergenic Outer Cover: Removable zipper cover made with soft skin-safe bamboo knit fabric"]',
  '[{"name":"1. Micro Fibre Pillow","hex":"#38bdf8"},{"name":"2. Memory Foam Contour Pillow","hex":"#818cf8"},{"name":"3. Memory Foam Neck Guard Pillow","hex":"#6366f1"},{"name":"4. Pure Latex Contour Pillow","hex":"#f59e0b"},{"name":"5. Pure Latex Neck Guard Pillow","hex":"#d97706"},{"name":"6. Pure Latex Shredded Pillow","hex":"#b45309"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_pillow_1', '1004', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_latex_contour_linen.jpg', '4. Pure Latex Contour Pillow', '#f59e0b', 1, 0),
('img_pillow_2', '1004', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_latex_pincore.jpg', '5. Pure Latex Neck Guard Pillow', '#d97706', 0, 1),
('img_pillow_3', '1004', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_latex_stacked.jpg', '6. Pure Latex Shredded Pillow', '#b45309', 0, 2),
('img_pillow_4', '1004', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_memory_contour.jpg', '2. Memory Foam Contour Pillow', '#818cf8', 0, 3),
('img_pillow_5', '1004', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/pillow_slow_rebound_diagram.jpg', '3. Memory Foam Neck Guard Pillow', '#6366f1', 0, 4);
