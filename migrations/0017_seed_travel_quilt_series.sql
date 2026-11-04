-- 0017_seed_travel_quilt_series.sql
-- Production Data Entry: TRAVEL QUILT SERIES

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
  '1001',
  'TRAVEL QUILT SERIES',
  'Travel mattress available in Roll Quilt, Two Folding Mattress, and Three Folding Mattress options. Lightweight, portable, and durable comfort for travel and home.',
  750,
  999,
  25,
  50,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/travel_quilt_series.jpg"]',
  'cat_mattresses',
  1,
  'Special',
  'Best Seller',
  '["Roll Quilt: Easy to roll, compact, and lightweight travel mattress","Two Folding Mattress: Dual-fold design for quick setup and space-saving storage","Three Folding Mattress: Triple-fold design for extra cushioning and effortless portability","Handcrafted with durable quilted cotton fabric for maximum sleeping comfort on the go"]',
  '[{"name":"Roll Quilt","hex":"#c23b3b"},{"name":"Two Folding Mattress","hex":"#d47a32"},{"name":"Three Folding Mattress","hex":"#387b5a"}]'
);

INSERT OR REPLACE INTO product_images (
  id,
  product_id,
  image_url,
  color_name,
  color_hex,
  is_primary,
  sort_order
) VALUES (
  'img_travel_quilt_1',
  '1001',
  'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/travel_quilt_series.jpg',
  'Red Quilted Print',
  '#c23b3b',
  1,
  0
);
