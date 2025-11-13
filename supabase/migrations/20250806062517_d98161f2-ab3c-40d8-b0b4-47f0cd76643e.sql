-- Add new client fields for better organization
ALTER TABLE public.clients 
ADD COLUMN company_name TEXT,
ADD COLUMN contact_person TEXT,
ADD COLUMN contact_tel TEXT;