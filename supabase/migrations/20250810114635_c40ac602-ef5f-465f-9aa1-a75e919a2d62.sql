-- Fix SECURITY DEFINER view vulnerability by recreating as SECURITY INVOKER
-- This ensures the view respects the querying user's RLS policies, not the view creator's

DROP VIEW IF EXISTS public.sales_monthly_aggregates;

-- Recreate the view as SECURITY INVOKER (default, but explicit for clarity)
CREATE VIEW public.sales_monthly_aggregates 
WITH (security_invoker = true) AS
SELECT 
  period_month,
  category,
  region_id,
  currency,
  SUM(units) as units,
  SUM(revenue) as revenue,
  SUM(cost) as cost,
  SUM(taxes) as taxes,
  SUM(returns) as returns,
  SUM(discounts) as discounts,
  SUM(revenue - cost) as gross_margin
FROM public.sales_monthly
GROUP BY period_month, category, region_id, currency
ORDER BY period_month DESC, category;

-- Enable RLS on the view (inheritance from base table, but explicit)
ALTER VIEW public.sales_monthly_aggregates SET (security_invoker = true);

-- Add comment explaining the security model
COMMENT ON VIEW public.sales_monthly_aggregates IS 'Aggregated sales data view. Uses SECURITY INVOKER to respect querying user RLS policies from sales_monthly table.';