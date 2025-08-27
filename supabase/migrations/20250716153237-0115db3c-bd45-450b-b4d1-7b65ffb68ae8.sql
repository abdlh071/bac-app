
-- Create users table to store user information and points
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  photo_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table to store available tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'daily', 'link')),
  url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_tasks table to track completed tasks
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all user data for ranking" 
  ON public.users 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  TO public
  USING (true);

CREATE POLICY "Users can insert their own data" 
  ON public.users 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create policies for tasks table
CREATE POLICY "Anyone can view active tasks" 
  ON public.tasks 
  FOR SELECT 
  TO public
  USING (is_active = true);

-- Create policies for user_tasks table
CREATE POLICY "Users can view all completed tasks for ranking" 
  ON public.user_tasks 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can insert their own task completions" 
  ON public.user_tasks 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Insert default tasks
INSERT INTO public.tasks (title, description, points, type, url) VALUES
('متابعة القناة الرسمية', 'اشترك في قناتنا الرسمية على تلغرام', 100, 'subscription', 'https://t.me/Askeladd_Channel'),
('تسجيل الدخول اليومي', 'سجل دخولك يومياً واحصل على نقاط', 50, 'daily', null);

-- Create function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_telegram_id BIGINT,
  p_points_to_add INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET points = points + p_points_to_add,
      updated_at = now()
  WHERE telegram_id = p_telegram_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user ranking
CREATE OR REPLACE FUNCTION public.get_user_ranking(p_telegram_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
  user_rank INTEGER;
BEGIN
  SELECT rank INTO user_rank
  FROM (
    SELECT telegram_id, 
           ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) as rank
    FROM public.users
  ) ranked_users
  WHERE telegram_id = p_telegram_id;
  
  RETURN COALESCE(user_rank, 999999);
END;
$$ LANGUAGE plpgsql;
