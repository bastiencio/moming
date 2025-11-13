-- Fix RLS policies for stock_movements to allow authenticated users to insert movements
DROP POLICY IF EXISTS "Admins manage stock_movements" ON public.stock_movements;

-- Create policies for authenticated users to manage stock movements
CREATE POLICY "Authenticated users can insert stock_movements" 
ON public.stock_movements 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock_movements" 
ON public.stock_movements 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stock_movements" 
ON public.stock_movements 
FOR DELETE 
TO authenticated
USING (true);

-- Keep admin access for all operations
CREATE POLICY "Admins manage stock_movements" 
ON public.stock_movements 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));