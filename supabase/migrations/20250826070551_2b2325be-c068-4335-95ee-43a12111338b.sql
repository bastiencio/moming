-- Allow authenticated users to insert invoices
CREATE POLICY "Authenticated users can create invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

-- Allow authenticated users to update invoices
CREATE POLICY "Authenticated users can update invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);