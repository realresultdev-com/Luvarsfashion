-- 0016_clear_fake_products.sql
-- Comprehensive database wipe of all mock/test records (orders, order items, reviews, product images, user searches, products)
-- so the database is 100% clean for real production data.

PRAGMA foreign_keys = OFF;

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM product_images;
DELETE FROM user_searches;
DELETE FROM products;

PRAGMA foreign_keys = ON;
