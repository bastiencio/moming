-- Add Chinese name field to products table
ALTER TABLE public.products 
ADD COLUMN name_chinese TEXT;