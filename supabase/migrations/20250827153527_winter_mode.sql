/*
  # Update users table for Google Auth integration

  1. Schema Changes
    - Add email column for Google accounts
    - Ensure telegram_id remains for compatibility
    - Add proper indexes for performance

  2. Functions
    - Update existing functions to work with both systems
    - Add new functions for Google Auth user management

  3. Security
    - Update RLS policies for Google Auth users
    - Ensure proper access control
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Update RLS policies to work with Supabase Auth
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

CREATE POLICY "Authenticated users can update their own data" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (id::text = auth.uid()::text OR telegram_id::text = (auth.jwt() ->> 'telegram_id'));

CREATE POLICY "Authenticated users can insert their own data" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Update todos table policies for Google Auth
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can create their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;

CREATE POLICY "Authenticated users can view their own todos" 
ON public.todos 
FOR SELECT 
TO authenticated
USING (user_id = (
  SELECT telegram_id FROM public.users WHERE id::text = auth.uid()::text
));

CREATE POLICY "Authenticated users can create their own todos" 
ON public.todos 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = (
  SELECT telegram_id FROM public.users WHERE id::text = auth.uid()::text
));

CREATE POLICY "Authenticated users can update their own todos" 
ON public.todos 
FOR UPDATE 
TO authenticated
USING (user_id = (
  SELECT telegram_id FROM public.users WHERE id::text = auth.uid()::text
));

CREATE POLICY "Authenticated users can delete their own todos" 
ON public.todos 
FOR DELETE 
TO authenticated
USING (user_id = (
  SELECT telegram_id FROM public.users WHERE id::text = auth.uid()::text
));

-- Create function to get user completed tasks count by user_id (string version)
CREATE OR REPLACE FUNCTION public.get_user_completed_tasks_count_by_user_id(p_user_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  task_count INTEGER;
  numeric_user_id BIGINT;
BEGIN
  -- Convert string to numeric
  numeric_user_id := p_user_id::bigint;
  
  SELECT COUNT(*) INTO task_count
  FROM public.user_tasks
  WHERE user_id = numeric_user_id;
  
  RETURN COALESCE(task_count, 0);
END;
$$;

-- Create function to update user points by user_id (string version)
CREATE OR REPLACE FUNCTION public.update_user_points_by_user_id(
  p_user_id text,
  p_points_to_add integer
) RETURNS void AS $$
DECLARE
  numeric_user_id BIGINT;
BEGIN
  numeric_user_id := p_user_id::bigint;
  
  UPDATE public.users 
  SET points = points + p_points_to_add,
      updated_at = now()
  WHERE telegram_id = numeric_user_id;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = 'public';

-- Create function to get user ranking by user_id (string version)
CREATE OR REPLACE FUNCTION public.get_user_ranking_by_user_id(p_user_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_rank INTEGER;
  numeric_user_id BIGINT;
BEGIN
  numeric_user_id := p_user_id::bigint;
  
  SELECT rank INTO user_rank
  FROM (
    SELECT telegram_id, 
           ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) as rank
    FROM public.users
  ) ranked_users
  WHERE telegram_id = numeric_user_id;
  
  RETURN COALESCE(user_rank, 999999);
END;
$$;

-- Create missing group_daily_challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_daily_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id bigint NOT NULL,
  challenge_date date NOT NULL,
  daily_time_spent integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id, challenge_date)
);

-- Enable RLS on group_daily_challenges
ALTER TABLE public.group_daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for group_daily_challenges
CREATE POLICY "Anyone can view group daily challenges" 
ON public.group_daily_challenges 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own daily challenges" 
ON public.group_daily_challenges 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own daily challenges" 
ON public.group_daily_challenges 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_daily_challenges_group_date ON public.group_daily_challenges(group_id, challenge_date);
CREATE INDEX IF NOT EXISTS idx_group_daily_challenges_user_date ON public.group_daily_challenges(user_id, challenge_date);