-- Migration 0011: Add original_price (M.R.P.) and discount_percent to products table
ALTER TABLE products ADD COLUMN original_price INTEGER DEFAULT NULL;
ALTER TABLE products ADD COLUMN discount_percent INTEGER DEFAULT NULL;
