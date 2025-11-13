-- Create storage bucket for merchandise images
INSERT INTO storage.buckets (id, name, public) VALUES ('merchandise', 'merchandise', true);

-- Create RLS policies for merchandise images
CREATE POLICY "Anyone can view merchandise images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'merchandise');

CREATE POLICY "Authenticated users can upload merchandise images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'merchandise' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update merchandise images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'merchandise' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete merchandise images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'merchandise' AND auth.role() = 'authenticated');