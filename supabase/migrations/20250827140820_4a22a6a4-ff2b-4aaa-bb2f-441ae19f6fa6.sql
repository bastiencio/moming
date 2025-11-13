-- Update invoice defaults: tax rate to 13% and tax included to true
ALTER TABLE public.invoices 
ALTER COLUMN tax_rate SET DEFAULT 13.00,
ALTER COLUMN tax_included SET DEFAULT true;