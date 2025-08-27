-- إصلاح جدول user_tasks للتأكد من عمله بشكل صحيح
-- تحديث العمود user_id ليكون bigint بدلاً من uuid لمطابقة جدول users

-- أولاً، إسقاط جدول user_tasks الحالي لإعادة إنشاؤه بشكل صحيح
DROP TABLE IF EXISTS public.user_tasks;

-- إنشاء جدول user_tasks جديد مع التصميم الصحيح
CREATE TABLE public.user_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id bigint NOT NULL, -- استخدام bigint لمطابقة telegram_id في جدول users
  task_id uuid NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id) -- منع إكمال نفس المهمة مرتين
);

-- تفعيل Row Level Security
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS
CREATE POLICY "Users can insert their own task completions" 
ON public.user_tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view all completed tasks for ranking" 
ON public.user_tasks 
FOR SELECT 
USING (true);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_task_id ON public.user_tasks(task_id);