-- Add display_order column to products table
ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create index for sorting
CREATE INDEX products_display_order_idx ON products(display_order);
