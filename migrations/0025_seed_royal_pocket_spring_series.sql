-- 0025_seed_royal_pocket_spring_series.sql
-- Production Data Entry: ROYAL SERIES - POCKET SPRING MATTRESS

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
  '1009',
  'ROYAL SERIES - POCKET SPRING MATTRESS',
  'Luxurious zero motion-transfer pocket spring mattress collection featuring individually wrapped coil springs available in Tight Top, Natural Latex, and Memory Foam luxury layers. Offered in plush Pillow Top and Euro Top models for cloud-like comfort.',
  6500,
  8999,
  28,
  30,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_navy_pillowtop.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_navy_corner.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_stack_wrapped.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_grey_swirl.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_grey_lattice.jpg"]',
  'cat_mattresses',
  1,
  'Zero Motion',
  'Pocket Spring',
  '["3 Premium Comfort Options: Pocket Spring Tight Top, Pocket Spring with Natural Latex, and Pocket Spring with Memory Foam","Dual Model Styles: Available in plush Pillow Top and sleek Euro Top designs for customized cloud-soft luxury","Individually Encased Pocket Coils: Hundreds of independent coils contour to body curves without disturbing your sleep partner","10-Year Factory Warranty: Handcrafted in Paramathi Velur, Tamil Nadu with high-grade steel springs and breathable bamboo fabric"]',
  '[{"name":"1. Pocket Spring Tight Top","hex":"#0ea9df"},{"name":"2. Pocket Spring with Natural Latex","hex":"#10b981"},{"name":"3. Pocket Spring with Memory Foam","hex":"#191142"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_royal_1', '1009', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_navy_pillowtop.jpg', 'Deep Navy Euro / Pillow Top', '#191142', 1, 0),
('img_royal_2', '1009', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_navy_corner.jpg', 'Pillow Top Contour Corner Detail', '#191142', 0, 1),
('img_royal_3', '1009', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_stack_wrapped.jpg', 'Factory Sealed Pocket Spring Stack', '#0ea9df', 0, 2),
('img_royal_4', '1009', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_grey_swirl.jpg', 'Natural Latex Quilted Top (Swirl)', '#10b981', 0, 3),
('img_royal_5', '1009', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/royal_pocket_spring_grey_lattice.jpg', 'Memory Foam Quilted Top (Lattice Grid)', '#191142', 0, 4);
