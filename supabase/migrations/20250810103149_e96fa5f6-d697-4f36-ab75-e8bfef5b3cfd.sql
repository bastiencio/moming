
-- 1) Enum for sales categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_category') THEN
    CREATE TYPE public.sales_category AS ENUM (
      'online',
      'offline_events',
      'offline_shops',
      'cws_distributor',
      'hong_kong_cws',
      'free_stock_giveaway'
    );
  END IF;
END
$$;

-- 2) Regions (flexible dimension)
CREATE TABLE IF NOT EXISTS public.cws_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'CN',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS trg_cws_regions_updated_at ON public.cws_regions;
CREATE TRIGGER trg_cws_regions_updated_at
BEFORE UPDATE ON public.cws_regions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS and policies
ALTER TABLE public.cws_regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read cws_regions" ON public.cws_regions;
CREATE POLICY "Authenticated can read cws_regions"
  ON public.cws_regions
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage cws_regions" ON public.cws_regions;
CREATE POLICY "Admins manage cws_regions"
  ON public.cws_regions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3) Monthly sales fact table
CREATE TABLE IF NOT EXISTS public.sales_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Use first day of month to represent each period (e.g., 2025-08-01)
  period_month DATE NOT NULL,
  category public.sales_category NOT NULL,
  region_id UUID NULL REFERENCES public.cws_regions(id) ON DELETE SET NULL,
  units INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  discounts NUMERIC NOT NULL DEFAULT 0,
  returns NUMERIC NOT NULL DEFAULT 0,
  taxes NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CNY',
  fx_to_cny NUMERIC NOT NULL DEFAULT 1,
  client_id UUID NULL,
  product_id UUID NULL,
  source TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.sales_monthly.period_month IS
  'Use the first day of the month to represent the period (e.g., 2025-08-01).';

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_sales_monthly_period ON public.sales_monthly (period_month);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_category ON public.sales_monthly (category);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_region ON public.sales_monthly (region_id);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_cat_period ON public.sales_monthly (category, period_month DESC);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS trg_sales_monthly_updated_at ON public.sales_monthly;
CREATE TRIGGER trg_sales_monthly_updated_at
BEFORE UPDATE ON public.sales_monthly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS and policies
ALTER TABLE public.sales_monthly ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read sales_monthly" ON public.sales_monthly;
CREATE POLICY "Authenticated can read sales_monthly"
  ON public.sales_monthly
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage sales_monthly" ON public.sales_monthly;
CREATE POLICY "Admins manage sales_monthly"
  ON public.sales_monthly
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4) Optional targets/budgets to compare plan vs actual
CREATE TABLE IF NOT EXISTS public.sales_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month DATE NOT NULL,
  category public.sales_category NOT NULL,
  region_id UUID NULL REFERENCES public.cws_regions(id) ON DELETE SET NULL,
  target_revenue NUMERIC NOT NULL DEFAULT 0,
  target_units INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CNY',
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_targets_period ON public.sales_targets (period_month);
CREATE INDEX IF NOT EXISTS idx_sales_targets_category ON public.sales_targets (category);
CREATE INDEX IF NOT EXISTS idx_sales_targets_region ON public.sales_targets (region_id);

DROP TRIGGER IF EXISTS trg_sales_targets_updated_at ON public.sales_targets;
CREATE TRIGGER trg_sales_targets_updated_at
BEFORE UPDATE ON public.sales_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read sales_targets" ON public.sales_targets;
CREATE POLICY "Authenticated can read sales_targets"
  ON public.sales_targets
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage sales_targets" ON public.sales_targets;
CREATE POLICY "Admins manage sales_targets"
  ON public.sales_targets
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5) Convenience view for charting aggregates
CREATE OR REPLACE VIEW public.sales_monthly_aggregates AS
SELECT
  date_trunc('month', period_month)::date AS period_month,
  category,
  region_id,
  currency,
  SUM(units) AS units,
  SUM(revenue) AS revenue,
  SUM(cost) AS cost,
  SUM(discounts) AS discounts,
  SUM(returns) AS returns,
  SUM(taxes) AS taxes,
  SUM(revenue - cost) AS gross_margin
FROM public.sales_monthly
GROUP BY 1, 2, 3, 4;
