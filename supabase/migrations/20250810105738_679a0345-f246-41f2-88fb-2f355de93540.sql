-- SECURITY HARDENING MIGRATION
-- 1) CREATE SEQUENCE FOR INVOICE NUMBERS IF MISSING
CREATE SEQUENCE IF NOT EXISTS public.invoice_sequence;

-- 2) ENSURE RLS ENABLED ON TARGET TABLES
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_category_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cws_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;

-- 3) DROP OVERLY PERMISSIVE POLICIES
DO $$
BEGIN
  -- Utility to drop a policy if it exists
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='clients' AND policyname='Allow all operations on clients';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on clients" ON public.clients'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_pricing' AND policyname='Allow all operations on client_pricing';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on client_pricing" ON public.client_pricing'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_category_pricing' AND policyname='Allow all operations on client_category_pricing';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on client_category_pricing" ON public.client_category_pricing'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Allow all operations on products';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on products" ON public.products'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory' AND policyname='Allow all operations on inventory';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on inventory" ON public.inventory'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='stock_movements' AND policyname='Allow all operations on stock_movements';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on stock_movements" ON public.stock_movements'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoices' AND policyname='Allow all operations on invoices';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on invoices" ON public.invoices'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice_items' AND policyname='Allow all operations on invoice_items';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on invoice_items" ON public.invoice_items'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Allow all operations on events';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on events" ON public.events'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='event_sales' AND policyname='Allow all operations on event_sales';
  IF FOUND THEN EXECUTE 'DROP POLICY "Allow all operations on event_sales" ON public.event_sales'; END IF;

  -- Profiles public read
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Profiles are viewable by everyone';
  IF FOUND THEN EXECUTE 'DROP POLICY "Profiles are viewable by everyone" ON public.profiles'; END IF;
END $$;

-- 4) CREATE SAFE POLICIES
-- Helper macro via SQL comments; we define explicitly for each table

-- clients
CREATE POLICY "Authenticated can read clients"
ON public.clients
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage clients"
ON public.clients
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- client_pricing
CREATE POLICY "Authenticated can read client_pricing"
ON public.client_pricing
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage client_pricing"
ON public.client_pricing
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- client_category_pricing
CREATE POLICY "Authenticated can read client_category_pricing"
ON public.client_category_pricing
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage client_category_pricing"
ON public.client_category_pricing
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products
CREATE POLICY "Authenticated can read products"
ON public.products
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- inventory
CREATE POLICY "Authenticated can read inventory"
ON public.inventory
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage inventory"
ON public.inventory
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- stock_movements
CREATE POLICY "Authenticated can read stock_movements"
ON public.stock_movements
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage stock_movements"
ON public.stock_movements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- invoices
CREATE POLICY "Authenticated can read invoices"
ON public.invoices
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage invoices"
ON public.invoices
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- invoice_items
CREATE POLICY "Authenticated can read invoice_items"
ON public.invoice_items
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage invoice_items"
ON public.invoice_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- events
CREATE POLICY "Authenticated can read events"
ON public.events
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage events"
ON public.events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- event_sales
CREATE POLICY "Authenticated can read event_sales"
ON public.event_sales
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage event_sales"
ON public.event_sales
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles: restrict read, allow admin read/manage, keep existing insert/update self
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) INTEGRITY TRIGGERS
-- invoices: auto-generate invoice_number
DROP TRIGGER IF EXISTS trg_generate_invoice_number ON public.invoices;
CREATE TRIGGER trg_generate_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- inventory: maintain stock_status
DROP TRIGGER IF EXISTS trg_update_stock_status ON public.inventory;
CREATE TRIGGER trg_update_stock_status
BEFORE INSERT OR UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.update_stock_status();

-- updated_at automation across tables that have updated_at
DROP TRIGGER IF EXISTS trg_set_updated_at_clients ON public.clients;
CREATE TRIGGER trg_set_updated_at_clients
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_products ON public.products;
CREATE TRIGGER trg_set_updated_at_products
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_inventory ON public.inventory;
CREATE TRIGGER trg_set_updated_at_inventory
BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_invoices ON public.invoices;
CREATE TRIGGER trg_set_updated_at_invoices
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_events ON public.events;
CREATE TRIGGER trg_set_updated_at_events
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_client_category_pricing ON public.client_category_pricing;
CREATE TRIGGER trg_set_updated_at_client_category_pricing
BEFORE UPDATE ON public.client_category_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_cws_regions ON public.cws_regions;
CREATE TRIGGER trg_set_updated_at_cws_regions
BEFORE UPDATE ON public.cws_regions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_sales_monthly ON public.sales_monthly;
CREATE TRIGGER trg_set_updated_at_sales_monthly
BEFORE UPDATE ON public.sales_monthly
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_sales_targets ON public.sales_targets;
CREATE TRIGGER trg_set_updated_at_sales_targets
BEFORE UPDATE ON public.sales_targets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_profiles ON public.profiles;
CREATE TRIGGER trg_set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();