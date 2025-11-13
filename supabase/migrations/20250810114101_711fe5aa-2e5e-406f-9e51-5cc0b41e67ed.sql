-- COMPREHENSIVE SALES DATABASE FOR KOMBUCHA BUSINESS

-- 1. Sales Representatives/Staff table
CREATE TABLE IF NOT EXISTS public.sales_reps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    commission_rate DECIMAL(5,4) DEFAULT 0.0500, -- 5% default commission
    territory_regions UUID[] DEFAULT '{}', -- Array of region IDs they cover
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Payment Methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'Cash', 'Credit Card', 'WeChat Pay', 'Alipay', 'Bank Transfer', etc.
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default payment methods
INSERT INTO public.payment_methods (name) VALUES
    ('Cash'),
    ('Credit Card'),
    ('WeChat Pay'),
    ('Alipay'),
    ('Bank Transfer'),
    ('Check')
ON CONFLICT (name) DO NOTHING;

-- 3. Sales Orders (Main sales transaction table)
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    sales_rep_id UUID REFERENCES public.sales_reps(id),
    region_id UUID REFERENCES public.cws_regions(id),
    
    -- Order details
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status TEXT CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'draft',
    
    -- Financial fields
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.13, -- 13% VAT default
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Payment
    payment_method_id UUID REFERENCES public.payment_methods(id),
    payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed')) DEFAULT 'pending',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Delivery information
    delivery_address TEXT,
    delivery_notes TEXT,
    special_instructions TEXT,
    
    -- Channel information
    sales_channel TEXT CHECK (sales_channel IN ('online', 'offline_events', 'offline_shops', 'cws_distributor', 'hong_kong_cws', 'direct_sales', 'wholesale')) NOT NULL,
    source TEXT, -- Specific source within channel (e.g., 'Taobao', 'WeChat', 'Event Name')
    
    -- Metadata
    currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Sales Order Line Items
CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    line_total DECIMAL(10,2) NOT NULL,
    
    -- Product details (snapshot at time of sale)
    product_name TEXT NOT NULL, -- Snapshot of product name at sale time
    product_sku TEXT NOT NULL,   -- Snapshot of SKU at sale time
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Sales Returns table
CREATE TABLE IF NOT EXISTS public.sales_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number TEXT UNIQUE NOT NULL,
    original_order_id UUID NOT NULL REFERENCES public.sales_orders(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'processed')) DEFAULT 'pending',
    
    refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    refund_method TEXT,
    refund_processed_date DATE,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Sales Return Items
CREATE TABLE IF NOT EXISTS public.sales_return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES public.sales_returns(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.sales_order_items(id),
    
    quantity_returned INTEGER NOT NULL CHECK (quantity_returned > 0),
    unit_refund_amount DECIMAL(10,2) NOT NULL,
    line_refund_total DECIMAL(10,2) NOT NULL,
    
    condition TEXT CHECK (condition IN ('new', 'damaged', 'expired', 'defective')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Create sequences for order numbers
CREATE SEQUENCE IF NOT EXISTS public.sales_order_sequence START 1000;
CREATE SEQUENCE IF NOT EXISTS public.return_sequence START 1000;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_orders_client_id ON public.sales_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON public.sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON public.sales_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_sales_channel ON public.sales_orders(sales_channel);
CREATE INDEX IF NOT EXISTS idx_sales_orders_region_id ON public.sales_orders(region_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON public.sales_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON public.sales_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_sales_returns_order_id ON public.sales_returns(original_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_client_id ON public.sales_returns(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_date ON public.sales_returns(return_date);

-- 9. Enable RLS on all tables
ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_return_items ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
-- Sales Reps policies
CREATE POLICY "Authenticated can read sales_reps" ON public.sales_reps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage sales_reps" ON public.sales_reps FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment Methods policies
CREATE POLICY "Authenticated can read payment_methods" ON public.payment_methods FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage payment_methods" ON public.payment_methods FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sales Orders policies
CREATE POLICY "Authenticated can read sales_orders" ON public.sales_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage sales_orders" ON public.sales_orders FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sales Order Items policies
CREATE POLICY "Authenticated can read sales_order_items" ON public.sales_order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage sales_order_items" ON public.sales_order_items FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sales Returns policies
CREATE POLICY "Authenticated can read sales_returns" ON public.sales_returns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage sales_returns" ON public.sales_returns FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sales Return Items policies
CREATE POLICY "Authenticated can read sales_return_items" ON public.sales_return_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage sales_return_items" ON public.sales_return_items FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 11. Create functions for automated calculations and number generation

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number = 'SO-' || to_char(NEW.order_date, 'YYYY') || '-' || LPAD(nextval('public.sales_order_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to generate return numbers
CREATE OR REPLACE FUNCTION public.generate_return_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.return_number IS NULL OR NEW.return_number = '' THEN
    NEW.return_number = 'RET-' || to_char(NEW.return_date, 'YYYY') || '-' || LPAD(nextval('public.return_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION public.calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  order_subtotal DECIMAL(10,2);
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(line_total), 0) INTO order_subtotal
  FROM public.sales_order_items 
  WHERE order_id = NEW.order_id;
  
  -- Update the order totals
  UPDATE public.sales_orders SET
    subtotal = order_subtotal,
    tax_amount = ROUND((order_subtotal - COALESCE(discount_amount, 0)) * COALESCE(tax_rate, 0), 2),
    total_amount = order_subtotal - COALESCE(discount_amount, 0) + 
                   ROUND((order_subtotal - COALESCE(discount_amount, 0)) * COALESCE(tax_rate, 0), 2) + 
                   COALESCE(shipping_cost, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update inventory on sales
CREATE OR REPLACE FUNCTION public.update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease inventory when order item is added/updated
  IF TG_OP = 'INSERT' THEN
    UPDATE public.inventory 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE product_id = NEW.product_id;
    
    -- Record stock movement
    INSERT INTO public.stock_movements (product_id, movement_type, quantity, reason, reference_id)
    VALUES (NEW.product_id, 'out', NEW.quantity, 'Sale', NEW.order_id);
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust inventory based on quantity change
    UPDATE public.inventory 
    SET current_stock = current_stock - (NEW.quantity - OLD.quantity),
        updated_at = now()
    WHERE product_id = NEW.product_id;
    
    -- Record stock movement if quantity changed
    IF NEW.quantity != OLD.quantity THEN
      INSERT INTO public.stock_movements (product_id, movement_type, quantity, reason, reference_id)
      VALUES (NEW.product_id, 
              CASE WHEN NEW.quantity > OLD.quantity THEN 'out' ELSE 'in' END,
              ABS(NEW.quantity - OLD.quantity), 
              'Sale adjustment', 
              NEW.order_id);
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Return inventory when order item is deleted
    UPDATE public.inventory 
    SET current_stock = current_stock + OLD.quantity,
        updated_at = now()
    WHERE product_id = OLD.product_id;
    
    -- Record stock movement
    INSERT INTO public.stock_movements (product_id, movement_type, quantity, reason, reference_id)
    VALUES (OLD.product_id, 'in', OLD.quantity, 'Sale cancellation', OLD.order_id);
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 12. Create triggers
-- Order number generation
DROP TRIGGER IF EXISTS trg_generate_order_number ON public.sales_orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Return number generation  
DROP TRIGGER IF EXISTS trg_generate_return_number ON public.sales_returns;
CREATE TRIGGER trg_generate_return_number
  BEFORE INSERT ON public.sales_returns
  FOR EACH ROW EXECUTE FUNCTION public.generate_return_number();

-- Order total calculations
DROP TRIGGER IF EXISTS trg_calculate_order_totals ON public.sales_order_items;
CREATE TRIGGER trg_calculate_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.sales_order_items
  FOR EACH ROW EXECUTE FUNCTION public.calculate_order_totals();

-- Inventory management
DROP TRIGGER IF EXISTS trg_update_inventory_on_sale ON public.sales_order_items;
CREATE TRIGGER trg_update_inventory_on_sale
  AFTER INSERT OR UPDATE OR DELETE ON public.sales_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_sale();

-- Updated at triggers
DROP TRIGGER IF EXISTS trg_set_updated_at_sales_orders ON public.sales_orders;
CREATE TRIGGER trg_set_updated_at_sales_orders
  BEFORE UPDATE ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_sales_returns ON public.sales_returns;
CREATE TRIGGER trg_set_updated_at_sales_returns
  BEFORE UPDATE ON public.sales_returns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_sales_reps ON public.sales_reps;
CREATE TRIGGER trg_set_updated_at_sales_reps
  BEFORE UPDATE ON public.sales_reps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();