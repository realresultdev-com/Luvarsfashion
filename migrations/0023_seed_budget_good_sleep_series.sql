-- 0023_seed_budget_good_sleep_series.sql
-- Production Data Entry: GOOD SLEEP - BUDGET SERIES

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
  '1007',
  'GOOD SLEEP - BUDGET SERIES',
  'Ultra-affordable and durable everyday mattress collection featuring high-density EPE foam, natural eco-coir, and premium PU foam layers. Beautifully finished with vibrant quilted floral and abstract cover designs.',
  2300,
  3299,
  30,
  50,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_blue_floral_top.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_blue_floral_angle.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_brown_abstract_top.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_brown_abstract_side.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_red_floral.jpg"]',
  'cat_mattresses',
  1,
  'Best Value',
  'Budget Friendly',
  '["3 Core Layer Options: EPE With Foam, EPE With Coir, and Premium PU Foam Series","Vibrant Quilted Jacquard Fabric: Quilted top panel with heavy-duty side wall tape edge stitching","Ergonomic Support & Durability: Sag-resistant high-density EPE core combined with soft cushioning foam","Direct Factory Value: Handcrafted in Paramathi Velur, Tamil Nadu for unbeatable quality at budget prices"]',
  '[{"name":"1. EPE With Foam","hex":"#2563eb"},{"name":"2. EPE With Coir","hex":"#78350f"},{"name":"3. Premium PU Foam Series","hex":"#dc2626"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_budget_1', '1007', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_blue_floral_top.jpg', 'Blue Floral Quilt (EPE + Foam)', '#2563eb', 1, 0),
('img_budget_2', '1007', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_blue_floral_angle.jpg', 'Blue Floral Tape Edge Finish', '#2563eb', 0, 1),
('img_budget_3', '1007', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_brown_abstract_top.jpg', 'Chocolate Brown Plaid (EPE + Coir)', '#78350f', 0, 2),
('img_budget_4', '1007', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_brown_abstract_side.jpg', 'Chocolate Brown Side Profile', '#78350f', 0, 3),
('img_budget_5', '1007', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/budget_good_sleep_red_floral.jpg', 'Crimson Red Floral (Premium PU Foam)', '#dc2626', 0, 4);
