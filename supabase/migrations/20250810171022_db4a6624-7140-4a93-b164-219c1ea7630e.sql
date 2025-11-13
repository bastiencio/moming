
-- 1) Add currency, exchange rate, original totals, and language to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'CNY',
  ADD COLUMN IF NOT EXISTS fx_to_cny numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subtotal_original numeric,
  ADD COLUMN IF NOT EXISTS tax_amount_original numeric,
  ADD COLUMN IF NOT EXISTS total_amount_original numeric,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'zh';

-- 2) Backfill original totals for existing data (assume existing totals are in CNY)
UPDATE public.invoices
SET
  subtotal_original = COALESCE(subtotal_original, subtotal),
  tax_amount_original = COALESCE(tax_amount_original, tax_amount),
  total_amount_original = COALESCE(total_amount_original, total_amount)
WHERE subtotal IS NOT NULL;
