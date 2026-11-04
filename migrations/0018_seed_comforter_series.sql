-- 0018_seed_comforter_series.sql
-- Production Data Entry: LUXURY QUILTED COMFORTER (Updated with 8 design & packaging views)

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
  '1002',
  'LUXURY QUILTED COMFORTER',
  'Ultra-soft breathable microfiber comforter set. Premium hollow-fiber filling, all-season thermal warmth, hypoallergenic fabric, and 7 elegant designer prints with luxury bag packaging.',
  800,
  1199,
  33,
  50,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_black_floral.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_grey_palm.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_plaid_check.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_maroon_leaves.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_strawberry.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_geometric_triangles.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_purple_feather_1.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_bag_packaging.jpg"]',
  'cat_bedding',
  1,
  'Special',
  'Best Value',
  '["Ultra-Soft Microfiber: Crafted with high-density breathable fabric for year-round cozy warmth","Hypoallergenic Hollow-Fiber Filling: Ensures plush loft without clumping or shifting","7 Designer Prints: Geometric Triangles SG-226, Royal Purple Feathers, Black Floral, Grey Palm, Plaid Check, Maroon Leaves, and Strawberry Blossom","Includes Protective Storage Bag: Comes packaged in a premium navy transparent handle bag for easy storage"]',
  '[{"name":"Geometric Triangles SG-226","hex":"#5a6f87"},{"name":"Royal Purple Feathers","hex":"#453856"},{"name":"Black Floral","hex":"#262626"},{"name":"Grey Palm Leaves","hex":"#7a8b9e"},{"name":"Plaid Check","hex":"#7a3e3e"},{"name":"Maroon Heart Leaves","hex":"#542533"},{"name":"Strawberry Blossom","hex":"#2e706c"}]'
);

DELETE FROM product_images WHERE product_id = '1002';

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_comforter_1', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_geometric_triangles.jpg', 'Geometric Triangles SG-226', '#5a6f87', 1, 0),
('img_comforter_2', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_purple_feather_1.jpg', 'Royal Purple Feathers', '#453856', 0, 1),
('img_comforter_3', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_black_floral.jpg', 'Black Floral', '#262626', 0, 2),
('img_comforter_4', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_grey_palm.jpg', 'Grey Palm Leaves', '#7a8b9e', 0, 3),
('img_comforter_5', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_plaid_check.jpg', 'Plaid Check', '#7a3e3e', 0, 4),
('img_comforter_6', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_maroon_leaves.jpg', 'Maroon Heart Leaves', '#542533', 0, 5),
('img_comforter_7', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_strawberry.jpg', 'Strawberry Blossom', '#2e706c', 0, 6),
('img_comforter_8', '1002', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/comforter_bag_packaging.jpg', 'Storage Bag Packaging', '#191142', 0, 7);
