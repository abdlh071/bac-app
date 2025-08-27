-- إضافة دالة للتحقق من عدد المهام المكتملة للمستخدم
CREATE OR REPLACE FUNCTION public.get_user_completed_tasks_count(p_user_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  task_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO task_count
  FROM public.user_tasks
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(task_count, 0);
END;
$$;

-- إضافة شرط قفل للمهام TDL
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS unlock_condition INTEGER DEFAULT NULL;

-- تحديث مهام TDL الموجودة لإضافة شروط القفل
UPDATE public.tasks 
SET unlock_condition = 50 
WHERE type = 'tdl' AND title LIKE '%50%';

-- إضافة سياسة للسماح للأدمن بحذف المجموعات
CREATE POLICY "Group admins and system admins can delete groups" 
ON public.groups 
FOR DELETE 
USING (
  admin_id = 5705054777 OR -- Your admin ID
  admin_id = (SELECT telegram_id FROM public.users WHERE id = auth.uid())
);

-- إضافة جدول لتسجيل آخر تحديث للتصنيف
CREATE TABLE IF NOT EXISTS public.ranking_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 day'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء الإعدادات الأولية لتحديث التصنيف
INSERT INTO public.ranking_updates (last_update, next_update) 
VALUES (now(), (date_trunc('day', now()) + interval '1 day' + interval '21 hours'))
ON CONFLICT DO NOTHING;

-- Enable RLS على الجدول الجديد
ALTER TABLE public.ranking_updates ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة العامة
CREATE POLICY "Anyone can view ranking updates" 
ON public.ranking_updates 
FOR SELECT 
USING (true);

-- سياسة للتحديث من قبل النظام فقط
CREATE POLICY "System can update ranking updates" 
ON public.ranking_updates 
FOR UPDATE 
USING (true);