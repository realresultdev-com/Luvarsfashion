-- 0003_buddy_mattress_data.sql
-- Remove all legacy/static mock products, categories, orders from database
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
