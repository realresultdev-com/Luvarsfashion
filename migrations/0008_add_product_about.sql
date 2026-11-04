-- Add about column to products table for key-value product specifications/details
ALTER TABLE products ADD COLUMN about TEXT DEFAULT '[]';
