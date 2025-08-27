-- تحديث قيود جدول المهام لدعم نوع 'tdl'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_type_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_type_check 
CHECK (type IN ('subscription', 'daily', 'link', 'level', 'tdl'));

-- إضافة مهام TDL الجديدة
INSERT INTO public.tasks (title, description, type, points) VALUES
('إنشاء 15 مهمة TDL', 'قم بإنشاء 15 مهمة في قائمة مهام TDL الخاصة بك', 'tdl', 20),
('إنشاء 50 مهمة TDL', 'قم بإنشاء 50 مهمة في قائمة مهام TDL الخاصة بك', 'tdl', 50),
('إنجاز 15 مهمة TDL', 'قم بإنجاز 15 مهمة من قائمة مهام TDL الخاصة بك', 'tdl', 20),
('إنجاز 50 مهمة TDL', 'قم بإنجاز 50 مهمة من قائمة مهام TDL الخاصة بك', 'tdl', 70);

-- إنشاء جدول المجموعات
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  admin_id bigint NOT NULL, -- مرجع إلى telegram_id في جدول users
  group_code text NOT NULL UNIQUE, -- كود المجموعة للانضمام
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- إنشاء جدول أعضاء المجموعات
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id bigint NOT NULL, -- مرجع إلى telegram_id في جدول users
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id) -- منع انضمام المستخدم لنفس المجموعة مرتين
);

-- تفعيل Row Level Security للجداول الجديدة
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمجموعات
CREATE POLICY "Anyone can view groups" 
ON public.groups 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Group admins can update their groups" 
ON public.groups 
FOR UPDATE 
USING (true);

CREATE POLICY "Group admins can delete their groups" 
ON public.groups 
FOR DELETE 
USING (true);

-- سياسات RLS لأعضاء المجموعات
CREATE POLICY "Anyone can view group members" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can leave groups" 
ON public.group_members 
FOR DELETE 
USING (true);

-- إنشاء مجموعة "ريفيزا" الافتراضية للأدمن
INSERT INTO public.groups (name, description, admin_id, group_code) VALUES
('ريفيزا', 'المجموعة الرسمية لتطبيق ريفيزا - انضم وتنافس مع آلاف الطلاب', 5705054777, 'Revisa_001');

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_groups_group_code ON public.groups(group_code);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);

-- إنشاء trigger لتحديث updated_at في جدول المجموعات
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();