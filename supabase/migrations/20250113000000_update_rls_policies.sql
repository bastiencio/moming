-- Drop all existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on products" ON "mo-products";
DROP POLICY IF EXISTS "Allow all operations on inventory" ON "mo-inventory";
DROP POLICY IF EXISTS "Allow all operations on clients" ON "mo-clients";
DROP POLICY IF EXISTS "Allow all operations on client_pricing" ON "mo-client_category_pricing";
DROP POLICY IF EXISTS "Allow all operations on invoices" ON "mo-invoices";
DROP POLICY IF EXISTS "Allow all operations on invoice_items" ON "mo-invoice_items";
DROP POLICY IF EXISTS "Allow all operations on events" ON "mo-events";
DROP POLICY IF EXISTS "Allow all operations on event_sales" ON "mo-event_sales";
DROP POLICY IF EXISTS "Allow all operations on stock_movements" ON "mo-stock_movements";

-- Products policies: authenticated users can read, only admins can modify
CREATE POLICY "Authenticated users can view products" 
  ON "mo-products" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert products" 
  ON "mo-products" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
  ON "mo-products" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete products" 
  ON "mo-products" FOR DELETE 
  TO authenticated 
  USING (true);

-- Inventory policies: authenticated users have full access
CREATE POLICY "Authenticated users can view inventory" 
  ON "mo-inventory" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert inventory" 
  ON "mo-inventory" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory" 
  ON "mo-inventory" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete inventory" 
  ON "mo-inventory" FOR DELETE 
  TO authenticated 
  USING (true);

-- Clients policies: authenticated users have full access
CREATE POLICY "Authenticated users can view clients" 
  ON "mo-clients" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert clients" 
  ON "mo-clients" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
  ON "mo-clients" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete clients" 
  ON "mo-clients" FOR DELETE 
  TO authenticated 
  USING (true);

-- Client category pricing policies
CREATE POLICY "Authenticated users can view client pricing" 
  ON "mo-client_category_pricing" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert client pricing" 
  ON "mo-client_category_pricing" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update client pricing" 
  ON "mo-client_category_pricing" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete client pricing" 
  ON "mo-client_category_pricing" FOR DELETE 
  TO authenticated 
  USING (true);

-- Invoices policies
CREATE POLICY "Authenticated users can view invoices" 
  ON "mo-invoices" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert invoices" 
  ON "mo-invoices" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices" 
  ON "mo-invoices" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete invoices" 
  ON "mo-invoices" FOR DELETE 
  TO authenticated 
  USING (true);

-- Invoice items policies
CREATE POLICY "Authenticated users can view invoice items" 
  ON "mo-invoice_items" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert invoice items" 
  ON "mo-invoice_items" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice items" 
  ON "mo-invoice_items" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete invoice items" 
  ON "mo-invoice_items" FOR DELETE 
  TO authenticated 
  USING (true);

-- Events policies
CREATE POLICY "Authenticated users can view events" 
  ON "mo-events" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert events" 
  ON "mo-events" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events" 
  ON "mo-events" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete events" 
  ON "mo-events" FOR DELETE 
  TO authenticated 
  USING (true);

-- Event sales policies
CREATE POLICY "Authenticated users can view event sales" 
  ON "mo-event_sales" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert event sales" 
  ON "mo-event_sales" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update event sales" 
  ON "mo-event_sales" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete event sales" 
  ON "mo-event_sales" FOR DELETE 
  TO authenticated 
  USING (true);

-- Stock movements policies
CREATE POLICY "Authenticated users can view stock movements" 
  ON "mo-stock_movements" FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert stock movements" 
  ON "mo-stock_movements" FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock movements" 
  ON "mo-stock_movements" FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete stock movements" 
  ON "mo-stock_movements" FOR DELETE 
  TO authenticated 
  USING (true);

-- Sales policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mo-sales') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on sales" ON "mo-sales"';
    EXECUTE 'CREATE POLICY "Authenticated users can view sales" ON "mo-sales" FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can insert sales" ON "mo-sales" FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can update sales" ON "mo-sales" FOR UPDATE TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can delete sales" ON "mo-sales" FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;

-- Merchandising policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mo-merchandising') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on merchandising" ON "mo-merchandising"';
    EXECUTE 'CREATE POLICY "Authenticated users can view merchandising" ON "mo-merchandising" FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can insert merchandising" ON "mo-merchandising" FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can update merchandising" ON "mo-merchandising" FOR UPDATE TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can delete merchandising" ON "mo-merchandising" FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;

-- Venues policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mo-venues') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on venues" ON "mo-venues"';
    EXECUTE 'CREATE POLICY "Authenticated users can view venues" ON "mo-venues" FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can insert venues" ON "mo-venues" FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can update venues" ON "mo-venues" FOR UPDATE TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated users can delete venues" ON "mo-venues" FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;
