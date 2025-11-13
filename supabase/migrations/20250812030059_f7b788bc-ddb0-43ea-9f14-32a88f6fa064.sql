-- Fix RLS policies for client_category_pricing to allow authenticated users to insert/update
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins manage client_category_pricing" ON client_category_pricing;

-- Create new policies allowing authenticated users to manage client category pricing
CREATE POLICY "Authenticated users can manage client_category_pricing" 
ON client_category_pricing 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);