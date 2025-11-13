-- Link analytics table to reference data for embedded selects
DO $$ BEGIN
  ALTER TABLE public.sales_monthly
    ADD CONSTRAINT fk_sales_monthly_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_sales_monthly_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_sales_monthly_region FOREIGN KEY (region_id) REFERENCES public.cws_regions(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_sales_monthly_client ON public.sales_monthly(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_product ON public.sales_monthly(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_region ON public.sales_monthly(region_id);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_period ON public.sales_monthly(period_month);
CREATE INDEX IF NOT EXISTS idx_sales_monthly_category ON public.sales_monthly(category);
