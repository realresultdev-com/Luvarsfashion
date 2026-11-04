-- Add offer badge prefix and value columns to categories and products table
ALTER TABLE categories ADD COLUMN offer_badge_prefix TEXT DEFAULT 'Starting';
ALTER TABLE categories ADD COLUMN offer_badge_value TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN offer_badge_prefix TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN offer_badge_value TEXT DEFAULT NULL;

