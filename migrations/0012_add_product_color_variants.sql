-- Migration 0012: Add color_variants to products table
ALTER TABLE products ADD COLUMN color_variants TEXT DEFAULT '[]';
