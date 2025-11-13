-- Create enum for product types
CREATE TYPE public.product_type AS ENUM ('small_bottle', 'large_bottle', 'keg');

-- Add new column with the enum type
ALTER TABLE products ADD COLUMN product_type product_type DEFAULT 'small_bottle';

-- Update the new column based on current category values with proper casting
UPDATE products 
SET product_type = CASE 
  WHEN category LIKE '%small%' OR category = 'kombucha' THEN 'small_bottle'::product_type
  WHEN category LIKE '%large%' OR category LIKE '%750%' THEN 'large_bottle'::product_type
  WHEN category LIKE '%keg%' OR category LIKE '%20l%' THEN 'keg'::product_type
  ELSE 'small_bottle'::product_type
END;

-- Drop the old category column and rename product_type to category
ALTER TABLE products DROP COLUMN category;
ALTER TABLE products RENAME COLUMN product_type TO category;

-- Make the column NOT NULL
ALTER TABLE products ALTER COLUMN category SET NOT NULL;