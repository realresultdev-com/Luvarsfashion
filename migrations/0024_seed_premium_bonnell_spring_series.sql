-- 0024_seed_premium_bonnell_spring_series.sql
-- Production Data Entry: PREMIUM SERIES - BONNELL SPRING MATTRESS

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
  '1008',
  'PREMIUM SERIES - BONNELL SPRING MATTRESS',
  'Heavy-duty interconnected hourglass Bonnell spring mattress engineered with high-grade carbon steel coils, felt insulation, and high-density cushioning foam. Offers traditional resilient bounce, superior spine alignment, and long-lasting edge support.',
  4500,
  6499,
  30,
  35,
  '["https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_navy_floral_wrapped.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_maroon_diamond_wrapped.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_navy_floral_perspective.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_maroon_diamond_table.jpg","https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_maroon_diamond_angle.jpg"]',
  'cat_mattresses',
  1,
  'Spring Comfort',
  'Bonnell Tech',
  '["High-Tensile Hourglass Bonnell Springs: Heat-treated carbon steel coil core provides optimal spine posture and classic resilient bounce","Multi-Layer Insulation & Cushioning: High-density felt pad prevents spring detection while PU foam top layer delivers plush comfort","Heavy-Duty Edge Support: Reinforced perimeter wire prevents edge roll-off and extends mattress lifespan","Direct Factory Guarantee: Handcrafted in Paramathi Velur, Tamil Nadu backed by 5-Year Manufacturer Warranty"]',
  '[{"name":"Royal Navy Blue (Cyan Floral Quilt)","hex":"#191142"},{"name":"Imperial Maroon (Geometric Diamond Quilt)","hex":"#800020"}]'
);

INSERT OR REPLACE INTO product_images (id, product_id, image_url, color_name, color_hex, is_primary, sort_order) VALUES
('img_bonnell_1', '1008', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_navy_floral_wrapped.jpg', 'Royal Navy Blue Floral (Factory Sealed)', '#191142', 1, 0),
('img_bonnell_2', '1008', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_maroon_diamond_wrapped.jpg', 'Imperial Maroon Diamond (Factory Sealed)', '#800020', 0, 1),
('img_bonnell_3', '1008', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_navy_floral_perspective.jpg', 'Royal Navy Blue Floral (Spring Stack)', '#191142', 0, 2),
('img_bonnell_4', '1008', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_maroon_diamond_table.jpg', 'Imperial Maroon Diamond (Top View)', '#800020', 0, 3),
('img_bonnell_5', '1008', 'https://pub-e9f02df81ad34d8da252578b86423390.r2.dev/products/premium_bonnell_spring_maroon_diamond_angle.jpg', 'Imperial Maroon Diamond (Perspective)', '#800020', 0, 4);
