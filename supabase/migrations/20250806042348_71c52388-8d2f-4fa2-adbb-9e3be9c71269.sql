-- Fix security warnings by setting proper search paths for functions

-- Update the function to update timestamps with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update the stock status function with proper search path
CREATE OR REPLACE FUNCTION public.update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= 0 THEN
    NEW.stock_status = 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.min_stock_level THEN
    NEW.stock_status = 'low_stock';
  ELSE
    NEW.stock_status = 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update the invoice number generation function with proper search path
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'INV-' || to_char(NEW.created_at, 'YYYY') || '-' || LPAD(nextval('public.invoice_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';