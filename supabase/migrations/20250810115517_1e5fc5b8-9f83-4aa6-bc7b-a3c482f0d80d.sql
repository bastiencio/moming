-- Insert CWS HK 2025 monthly sales (units) with revenue computed from client category pricing
-- Maps spreadsheet SKUs to our 6 products by product name (small bottles here)
-- Idempotent: avoid duplicates when rerun

DO $$
DECLARE
  v_client uuid := 'bf2dce4e-658b-490b-9098-40fde0313c2f'; -- CWS HK
BEGIN
  WITH product_map AS (
    SELECT id, name, category FROM public.products
    WHERE name IN (
      'MoMing Turmeric & Lemongrass',
      'MoMing Lychee & Jasmin',
      'MoMing Pomelo & Mint'
    )
  ),
  price_by_category AS (
    SELECT ccp.product_category, ccp.custom_price
    FROM public.client_category_pricing ccp
    WHERE ccp.client_id = v_client
  ),
  vals AS (
    -- Turmeric & Lemongrass
    SELECT 'MoMing Turmeric & Lemongrass'::text AS name, DATE '2025-01-01' AS period_month, 120::int AS units UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-02-01', 25 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-03-01', 192 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-04-01', 120 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-05-01', 156 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-06-01', 169 UNION ALL
    -- Lychee & Jasmin
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-01-01', 288 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-02-01', 145 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-03-01', 193 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-04-01', 336 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-05-01', 203 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-06-01', 241 UNION ALL
    -- Pomelo & Mint
    SELECT 'MoMing Pomelo & Mint', DATE '2025-01-01', 168 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-02-01', 73 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-03-01', 193 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-04-01', 216 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-05-01', 107 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-06-01', 193
  )
  INSERT INTO public.sales_monthly (
    period_month, category, client_id, product_id, units, revenue, cost, discounts, returns, taxes, currency, fx_to_cny, source, notes
  )
  SELECT 
    v.period_month,
    'hong_kong_cws'::sales_category,
    v_client,
    pm.id,
    v.units,
    (v.units * pbc.custom_price)::numeric as revenue,
    0::numeric as cost,
    0::numeric as discounts,
    0::numeric as returns,
    0::numeric as taxes,
    'HKD'::text as currency,
    1::numeric as fx_to_cny,
    'bulk_import'::text as source,
    '2025 CWS HK spreadsheet import'::text as notes
  FROM vals v
  JOIN product_map pm ON pm.name = v.name
  JOIN price_by_category pbc ON pbc.product_category = pm.category
  LEFT JOIN public.sales_monthly sm
    ON sm.product_id = pm.id
   AND sm.client_id = v_client
   AND sm.period_month = v.period_month
   AND sm.category = 'hong_kong_cws'::sales_category
  WHERE sm.id IS NULL;
END $$;