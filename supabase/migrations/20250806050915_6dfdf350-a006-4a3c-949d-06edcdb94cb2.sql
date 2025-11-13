-- Create client category pricing table
CREATE TABLE public.client_category_pricing (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    product_category product_type NOT NULL,
    custom_price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(client_id, product_category)
);

-- Enable RLS
ALTER TABLE public.client_category_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on client_category_pricing" 
ON public.client_category_pricing 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_client_category_pricing_updated_at
    BEFORE UPDATE ON public.client_category_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Remove the old pricing tier and discount columns from clients table
-- (We'll keep them for now to avoid breaking existing data, but we won't use them)
ALTER TABLE public.clients ADD COLUMN use_category_pricing boolean DEFAULT false;