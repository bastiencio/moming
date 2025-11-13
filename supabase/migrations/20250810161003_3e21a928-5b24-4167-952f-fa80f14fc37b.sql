-- Allow authenticated users to update inventory so stock adjustments reflect in UI
CREATE POLICY "Authenticated users can update inventory"
ON public.inventory
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert inventory (for completeness)
CREATE POLICY "Authenticated users can insert inventory"
ON public.inventory
FOR INSERT
TO authenticated
WITH CHECK (true);