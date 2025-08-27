-- Create tasks table for To-Do List functionality
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  pomodoro_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own todos" 
ON public.todos 
FOR SELECT 
USING (user_id = (
  SELECT telegram_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can create their own todos" 
ON public.todos 
FOR INSERT 
WITH CHECK (user_id = (
  SELECT telegram_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update their own todos" 
ON public.todos 
FOR UPDATE 
USING (user_id = (
  SELECT telegram_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their own todos" 
ON public.todos 
FOR DELETE 
USING (user_id = (
  SELECT telegram_id FROM public.users WHERE id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
CREATE INDEX idx_todos_priority ON public.todos(priority);
CREATE INDEX idx_todos_completed ON public.todos(is_completed);

-- Function to create recurring tasks
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
$$ LANGUAGE plpgsql SECURITY DEFINER;