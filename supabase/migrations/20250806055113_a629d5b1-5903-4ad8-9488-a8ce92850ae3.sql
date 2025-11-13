-- Add tax fields to invoices table
ALTER TABLE public.invoices 
ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN tax_included BOOLEAN DEFAULT false;