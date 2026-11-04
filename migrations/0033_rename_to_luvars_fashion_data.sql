-- Migration 0033: Update categories and hero videos for Luvars Fashion
UPDATE categories SET name = 'Graphic T-Shirts' WHERE id = 'cat_mattresses';
UPDATE categories SET name = 'Polo T-Shirts' WHERE id = 'cat_pillows';
UPDATE categories SET name = 'Oversized & Casuals' WHERE id = 'cat_bedding';

INSERT OR IGNORE INTO categories (id, name) VALUES
  ('cat_shirts', 'Casual Shirts'),
  ('cat_hoodies', 'Hoodies & Sweatshirts');

-- Update hero video titles for Luvars Fashion
UPDATE hero_videos SET title = 'Luvars Fashion: New Drop Live 🚀', subtitle = '100% Combed Cotton Graphic Tees & Polos' WHERE id = 'hv_0785b64eaf';
UPDATE hero_videos SET title = 'Wear Your Attitude. Premium Everyday Fashion', subtitle = 'Soft, breathable and made for everyday style' WHERE id = 'hv_1182ba542e';
UPDATE hero_videos SET title = 'Start with the right tee. Match with classic casuals.', subtitle = 'Explore our trending apparel drops' WHERE id = 'hv_191138dc56';
UPDATE hero_videos SET title = 'Luvars Style — Premium Comfort & Bold Prints', subtitle = 'Available in XS to 5XL' WHERE id = 'hv_db1a51fd9a';
UPDATE hero_videos SET title = 'Luvars Fashion dhan solution', subtitle = 'India’s favourite fashion destination' WHERE id = 'hv_80ad0af775';
UPDATE hero_videos SET title = 'Ready for New Fashion Trends?', subtitle = 'Shop the latest streetwear & casual collection' WHERE id = 'hv_8abd68c729';
UPDATE hero_videos SET title = 'Dive Into Pure Style', subtitle = 'Fresh drops every week' WHERE id = 'hv_57d4240e3c';
UPDATE hero_videos SET title = 'Look Sharp. Stay Comfortable.', subtitle = 'Luvars Fashion Originals' WHERE id = 'hv_502abe5452';
UPDATE hero_videos SET title = 'Choose the style that matches your personality ✨ Only at Luvars Fashion', subtitle = 'Free shipping across India' WHERE id = 'hv_8833639dd7';
