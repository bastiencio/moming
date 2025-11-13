-- Add po_number field to invoices table
ALTER TABLE public.invoices 
ADD COLUMN po_number TEXT;