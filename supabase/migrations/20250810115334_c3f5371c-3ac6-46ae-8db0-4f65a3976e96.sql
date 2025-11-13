-- Compute revenue for 2024 CWS Distributor sales using client category pricing
-- Set client_id to CWS China and revenue = units * client_category_pricing.custom_price (by product category)
-- Idempotent: only updates rows where revenue is 0 or null

DO $$
DECLARE
  v_client uuid := '14a64eed-cf23-4d0c-81db-b4dcdbfcc576'; -- CWS China
BEGIN
  -- Ensure pricing exists for this client (will no-op if already present)
  -- No inserts here; assume pricing already configured as per audit

  UPDATE public.sales_monthly sm
  SET 
    client_id = v_client,
    revenue = COALESCE(sm.units, 0) * ccp.custom_price,
    updated_at = now()
  FROM public.products p
  JOIN public.client_category_pricing ccp
    ON ccp.client_id = v_client
   AND ccp.product_category = p.category
  WHERE sm.product_id = p.id
    AND sm.category = 'cws_distributor'::sales_category
    AND DATE_PART('year', sm.period_month) = 2024
    AND COALESCE(sm.revenue, 0) = 0;
END $$;