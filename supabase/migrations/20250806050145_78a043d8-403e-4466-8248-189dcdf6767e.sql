-- Update the products table to use specific bottle/keg types instead of generic category
-- First, update existing records to use new values
UPDATE products 
SET category = CASE 
  WHEN category = 'kombucha' THEN 'small_bottle'
  WHEN category = 'jun' THEN 'large_bottle' 
  ELSE 'small_bottle'
END;

-- Create enum for product types
CREATE TYPE public.product_type AS ENUM ('small_bottle', 'large_bottle', 'keg');

-- Add new column with the enum type
ALTER TABLE products ADD COLUMN product_type product_type DEFAULT 'small_bottle';

-- Update the new column based on current category values
UPDATE products 
SET product_type = CASE 
  WHEN category LIKE '%small%' OR category = 'kombucha' THEN 'small_bottle'
  WHEN category LIKE '%large%' OR category LIKE '%750%' THEN 'large_bottle'
  WHEN category LIKE '%keg%' OR category LIKE '%20l%' THEN 'keg'
  ELSE 'small_bottle'
END;

-- Drop the old category column and rename product_type to category
ALTER TABLE products DROP COLUMN category;
ALTER TABLE products RENAME COLUMN product_type TO category;

-- Make the column NOT NULL
ALTER TABLE products ALTER COLUMN category SET NOT NULL;