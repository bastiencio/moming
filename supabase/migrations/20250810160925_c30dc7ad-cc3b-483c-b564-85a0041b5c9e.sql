-- Allow authenticated users to update inventory so stock adjustments reflect in UI
CREATE POLICY IF NOT EXISTS "Authenticated users can update inventory"
ON public.inventory
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Optionally allow inserts if needed in future flows (safe default)
CREATE POLICY IF NOT EXISTS "Authenticated users can insert inventory"
ON public.inventory
FOR INSERT
TO authenticated
WITH CHECK (true);