-- 0021_seed_spine_support_series.sql
-- Production Data Entry: SPINE SUPPORT SERIES

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
  '1005',
  'SPINE SUPPORT SERIES',
  'Doctor-recommended orthopedic spine support mattress collection. Engineered with high-density bonded foam, memory foam alignment layers, and Bonnell spring support. Designed for chronic lower back pain relief and zero sagging.',
  8300,
  11999,
  31,
  25,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_buddy_packaging.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_foam_layers.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_factory_table.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_latex_assembly.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_pocket_springs.jpg"]',
  'cat_mattresses',
  1,
  'Special',
  'Orthopedic Care',
  '["3 Specialized Orthopedic Formulations: Ortho Bonnell Spring + Memory Foam, Ortho Bonded Foam + Memory Foam, and Ortho Bonded Foam + Super Soft Foam","Doctor Recommended Spinal Alignment: Relieves lumbar spine pressure points and neutralizes lower back pain","High-Density Rebonded Core: Prevents center sagging even after 100,000 heavy pressure cycles","10-Year Warranty & 100-Night Home Trial: Handcrafted in Paramathi Velur, Tamil Nadu with factory-sealed protective packaging"]',
  '[{"name":"1. Ortho Bonnell Spring with Memory Foam","hex":"#191142"},{"name":"2. Ortho Bonded Foam with Memory Foam","hex":"#0ea9df"},{"name":"3. Ortho Bonded Foam with Super Soft Foam","hex":"#16a34a"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_spine_1', '1005', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_buddy_packaging.jpg', 'Finished Buddy Mattress Packaging', '#191142', 1, 0),
('img_spine_2', '1005', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_foam_layers.jpg', '2. Ortho Bonded Foam with Memory Foam', '#0ea9df', 0, 1),
('img_spine_3', '1005', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_factory_table.jpg', '3. Ortho Bonded Foam with Super Soft Foam', '#16a34a', 0, 2),
('img_spine_4', '1005', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_latex_assembly.jpg', '1. Ortho Bonnell Spring with Memory Foam', '#191142', 0, 3),
('img_spine_5', '1005', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/spine_support_pocket_springs.jpg', 'Encased Pocket & Bonnell Spring Layer', '#0ea9df', 0, 4);
