-- Fix security warnings for functions with mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

CREATE OR REPLACE FUNCTION public.create_recurring_task(
  p_user_id BIGINT,
  p_title TEXT,
  p_description TEXT,
  p_due_date TIMESTAMP WITH TIME ZONE,
  p_priority TEXT,
  p_category TEXT,
  p_repeat_type TEXT
)
RETURNS UUID AS $$
DECLARE
  task_id UUID;
BEGIN
  INSERT INTO public.todos (
    user_id, title, description, due_date, priority, category, repeat_type
  ) VALUES (
    p_user_id, p_title, p_description, p_due_date, p_priority, p_category, p_repeat_type
  ) RETURNING id INTO task_id;
  
  RETURN task_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER
   SET search_path = '';