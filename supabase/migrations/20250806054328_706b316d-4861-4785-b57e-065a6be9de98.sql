-- Add quantity_per_box field to products table
ALTER TABLE public.products 
ADD COLUMN quantity_per_box INTEGER DEFAULT 1;