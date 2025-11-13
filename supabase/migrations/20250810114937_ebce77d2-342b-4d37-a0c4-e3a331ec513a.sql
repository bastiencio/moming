-- Bulk insert 2024 CWS Distributor monthly units for MoMing products (from user-provided sheet)
-- Idempotent: only inserts rows that don't already exist for the same product, month, and category

WITH product_map AS (
  SELECT name, id
  FROM public.products
  WHERE name IN (
    'MoMing Lychee & Jasmin',
    'MoMing Pineapple & Lavender',
    'MoMing Pomelo & Mint',
    'MoMing Turmeric & Lemongrass'
  )
),
vals AS (
  -- Lychee & Jasmin
  SELECT 'MoMing Lychee & Jasmin'::text AS name, DATE '2024-01-01' AS period_month, 1222::int AS units UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-02-01', 701 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-03-01', 1381 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-04-01', 1999 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-05-01', 1677 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-06-01', 1310 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-07-01', 2155 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-08-01', 1520 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-09-01', 1610 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-10-01', 1146 UNION ALL
  SELECT 'MoMing Lychee & Jasmin', DATE '2024-11-01', 1106 UNION ALL
  -- Pineapple & Lavender
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-01-01', 572 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-02-01', 450 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-03-01', 697 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-04-01', 1185 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-05-01', 1646 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-06-01', 786 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-07-01', 729 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-08-01', 623 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-09-01', 1072 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-10-01', 697 UNION ALL
  SELECT 'MoMing Pineapple & Lavender', DATE '2024-11-01', 582 UNION ALL
  -- Pomelo & Mint
  SELECT 'MoMing Pomelo & Mint', DATE '2024-01-01', 753 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-02-01', 549 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-03-01', 759 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-04-01', 1477 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-05-01', 1758 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-06-01', 877 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-07-01', 1313 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-08-01', 1310 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-09-01', 1459 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-10-01', 924 UNION ALL
  SELECT 'MoMing Pomelo & Mint', DATE '2024-11-01', 2905 UNION ALL
  -- Turmeric & Lemongrass
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-01-01', 880 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-02-01', 410 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-03-01', 763 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-04-01', 1126 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-05-01', 1069 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-06-01', 1030 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-07-01', 417 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-08-01', 840 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-09-01', 924 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-10-01', 919 UNION ALL
  SELECT 'MoMing Turmeric & Lemongrass', DATE '2024-11-01', 2428
)
INSERT INTO public.sales_monthly (
  period_month, category, product_id, units, revenue, cost, discounts, returns, taxes, currency, fx_to_cny, source, notes
)
SELECT 
  v.period_month,
  'cws_distributor'::sales_category,
  pm.id,
  v.units,
  0::numeric AS revenue,
  0::numeric AS cost,
  0::numeric AS discounts,
  0::numeric AS returns,
  0::numeric AS taxes,
  'CNY'::text AS currency,
  1::numeric AS fx_to_cny,
  'bulk_import'::text AS source,
  '2024 CWS spreadsheet import (units only)'::text AS notes
FROM vals v
JOIN product_map pm ON pm.name = v.name
LEFT JOIN public.sales_monthly sm 
  ON sm.product_id = pm.id 
  AND sm.period_month = v.period_month 
  AND sm.category = 'cws_distributor'::sales_category
WHERE sm.id IS NULL;