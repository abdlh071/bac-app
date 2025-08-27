-- Remove the auth-based policies and create simpler ones
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;

-- Create simple policies that allow system access for admin operations
CREATE POLICY "System can view all tasks" 
ON public.tasks 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "System can update all tasks" 
ON public.tasks 
FOR UPDATE 
TO public
USING (true);

CREATE POLICY "System can delete all tasks" 
ON public.tasks 
FOR DELETE 
TO public
USING (true);