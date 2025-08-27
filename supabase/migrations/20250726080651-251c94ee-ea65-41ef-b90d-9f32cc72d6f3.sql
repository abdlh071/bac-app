-- Create a simple function to check admin access using users table
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND telegram_id IN (5705054777, 123456789)
  )
$$;

-- Drop the previous function if it exists
DROP FUNCTION IF EXISTS public.is_admin(bigint);

-- Policy to allow admins to view all tasks (including inactive ones)
CREATE POLICY "Admins can view all tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());

-- Policy to allow admins to update tasks
CREATE POLICY "Admins can update tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

-- Policy to allow admins to delete tasks
CREATE POLICY "Admins can delete tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());