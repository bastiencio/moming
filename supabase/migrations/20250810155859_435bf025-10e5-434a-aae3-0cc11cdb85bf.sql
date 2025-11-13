-- Update RLS policies for merchandising table to allow authenticated users to manage items
DROP POLICY IF EXISTS "Admins manage merchandising" ON public.merchandising;

-- Create policies for authenticated users to manage merchandising items
CREATE POLICY "Authenticated users can insert merchandising" 
ON public.merchandising 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update merchandising" 
ON public.merchandising 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete merchandising" 
ON public.merchandising 
FOR DELETE 
TO authenticated
USING (true);