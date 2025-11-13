-- Create merchandising table
CREATE TABLE public.merchandising (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  picture TEXT,
  supplier_taobao_link TEXT,
  supplier_wechat_id TEXT,
  supplier_phone TEXT,
  supplier_email TEXT,
  moq INTEGER,
  cost_per_piece DECIMAL(10,2),
  production_time TEXT,
  production_details_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.merchandising ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated can read merchandising" 
ON public.merchandising 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage merchandising" 
ON public.merchandising 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_merchandising_updated_at
BEFORE UPDATE ON public.merchandising
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on searches
CREATE INDEX idx_merchandising_code ON public.merchandising(code);
CREATE INDEX idx_merchandising_category ON public.merchandising(category);
CREATE INDEX idx_merchandising_active ON public.merchandising(active);