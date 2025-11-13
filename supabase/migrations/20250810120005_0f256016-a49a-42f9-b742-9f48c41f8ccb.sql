-- Insert 2025 CWS Distributor sales (Jan–May) from spreadsheet, mapping 6 SKUs to products
-- Client: CWS China, category: cws_distributor, currency: CNY
-- Revenue = units × client_category_pricing by product_category
-- Idempotent: skip if row already exists

DO $$
DECLARE
  v_client uuid := '14a64eed-cf23-4d0c-81db-b4dcdbfcc576'; -- CWS China
BEGIN
  WITH product_map AS (
    SELECT id, name, category FROM public.products
    WHERE name IN (
      'Cuvée Flori',
      'Cuvée West Lake',
      'MoMing Lychee & Jasmin',
      'MoMing Pineapple & Lavender',
      'MoMing Pomelo & Mint',
      'MoMing Turmeric & Lemongrass'
    )
  ),
  price_by_category AS (
    SELECT ccp.product_category, ccp.custom_price
    FROM public.client_category_pricing ccp
    WHERE ccp.client_id = v_client
  ),
  vals AS (
    -- Flori 750ml (maps to Cuvée Flori)
    SELECT 'Cuvée Flori'::text AS name, DATE '2025-01-01' AS period_month, 1::int AS units UNION ALL
    SELECT 'Cuvée Flori', DATE '2025-02-01', 59 UNION ALL
    SELECT 'Cuvée Flori', DATE '2025-03-01', 162 UNION ALL
    SELECT 'Cuvée Flori', DATE '2025-04-01', 225 UNION ALL
    SELECT 'Cuvée Flori', DATE '2025-05-01', 230 UNION ALL
    -- Lychee Jasmine (maps to MoMing Lychee & Jasmin)
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-01-01', 1653 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-02-01', 1055 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-03-01', 1074 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-04-01', 2253 UNION ALL
    SELECT 'MoMing Lychee & Jasmin', DATE '2025-05-01', 1505 UNION ALL
    -- Pineapple Lavender
    SELECT 'MoMing Pineapple & Lavender', DATE '2025-01-01', 630 UNION ALL
    SELECT 'MoMing Pineapple & Lavender', DATE '2025-02-01', 414 UNION ALL
    SELECT 'MoMing Pineapple & Lavender', DATE '2025-03-01', 534 UNION ALL
    SELECT 'MoMing Pineapple & Lavender', DATE '2025-04-01', 1423 UNION ALL
    SELECT 'MoMing Pineapple & Lavender', DATE '2025-05-01', 1544 UNION ALL
    -- Pomelo Mint
    SELECT 'MoMing Pomelo & Mint', DATE '2025-01-01', 801 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-02-01', 582 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-03-01', 840 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-04-01', 1751 UNION ALL
    SELECT 'MoMing Pomelo & Mint', DATE '2025-05-01', 1000 UNION ALL
    -- Turmeric & Lemongrass
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-01-01', 541 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-02-01', 345 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-03-01', 605 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-04-01', 866 UNION ALL
    SELECT 'MoMing Turmeric & Lemongrass', DATE '2025-05-01', 973 UNION ALL
    -- West Lake 750ml (maps to Cuvée West Lake)
    SELECT 'Cuvée West Lake', DATE '2025-01-01', 1 UNION ALL
    SELECT 'Cuvée West Lake', DATE '2025-02-01', 36 UNION ALL
    SELECT 'Cuvée West Lake', DATE '2025-03-01', 134 UNION ALL
    SELECT 'Cuvée West Lake', DATE '2025-04-01', 112 UNION ALL
    SELECT 'Cuvée West Lake', DATE '2025-05-01', 102
  )
  INSERT INTO public.sales_monthly (
    period_month, category, client_id, product_id, units, revenue, cost, discounts, returns, taxes, currency, fx_to_cny, source, notes
  )
  SELECT 
    v.period_month,
    'cws_distributor'::sales_category,
    v_client,
    pm.id,
    v.units,
    (v.units * pbc.custom_price)::numeric as revenue,
    0::numeric as cost,
    0::numeric as discounts,
    0::numeric as returns,
    0::numeric as taxes,
    'CNY'::text as currency,
    1::numeric as fx_to_cny,
    'bulk_import'::text as source,
    '2025 CWS distributor spreadsheet import (Jan–May)'::text as notes
  FROM vals v
  JOIN product_map pm ON pm.name = v.name
  JOIN price_by_category pbc ON pbc.product_category = pm.category
  LEFT JOIN public.sales_monthly sm
    ON sm.product_id = pm.id
   AND sm.client_id = v_client
   AND sm.period_month = v.period_month
   AND sm.category = 'cws_distributor'::sales_category
  WHERE sm.id IS NULL;
END $$;