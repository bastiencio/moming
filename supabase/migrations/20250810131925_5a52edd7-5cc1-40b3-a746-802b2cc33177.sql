-- Drop existing restrictive policies for sales_monthly
DROP POLICY IF EXISTS "Admins manage sales_monthly" ON public.sales_monthly;

-- Create new policies for authenticated users to manage sales data
CREATE POLICY "Authenticated users can insert sales_monthly" 
ON public.sales_monthly 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales_monthly" 
ON public.sales_monthly 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales_monthly" 
ON public.sales_monthly 
FOR DELETE 
TO authenticated 
USING (true);