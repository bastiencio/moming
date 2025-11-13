-- Remove old pricing columns from clients table since we now use category-based pricing
ALTER TABLE public.clients 
DROP COLUMN IF EXISTS pricing_tier,
DROP COLUMN IF EXISTS discount_percentage,
DROP COLUMN IF EXISTS use_category_pricing;