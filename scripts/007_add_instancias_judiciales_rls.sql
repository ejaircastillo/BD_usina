-- Migration script to add missing RLS policy for instancias_judiciales table
-- This table had RLS enabled but no policy was created, blocking all operations

-- First, ensure RLS is enabled on the table (idempotent)
ALTER TABLE public.instancias_judiciales ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to make this script idempotent)
DROP POLICY IF EXISTS "Allow all operations on instancias_judiciales" ON public.instancias_judiciales;

-- Create permissive policy for all operations (matching the pattern used for other tables)
CREATE POLICY "Allow all operations on instancias_judiciales" 
ON public.instancias_judiciales 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verify the policy was created
-- You can run: SELECT * FROM pg_policies WHERE tablename = 'instancias_judiciales';
