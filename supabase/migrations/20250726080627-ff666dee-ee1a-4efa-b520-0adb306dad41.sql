-- Add admin access policies for tasks table

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT _user_id IN (5705054777, 123456789)
$$;

-- Policy to allow admins to view all tasks (including inactive ones)
CREATE POLICY "Admins can view all tasks" 
ON public.tasks 
FOR SELECT 
TO public
USING (public.is_admin(auth.jwt() ->> 'telegram_id')::bigint);

-- Policy to allow admins to update tasks
CREATE POLICY "Admins can update tasks" 
ON public.tasks 
FOR UPDATE 
TO public
USING (public.is_admin(auth.jwt() ->> 'telegram_id')::bigint);

-- Policy to allow admins to delete tasks
CREATE POLICY "Admins can delete tasks" 
ON public.tasks 
FOR DELETE 
TO public
USING (public.is_admin(auth.jwt() ->> 'telegram_id')::bigint);