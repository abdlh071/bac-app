-- First, drop the existing check constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_type_check;

-- Add the new check constraint with 'level' type
ALTER TABLE public.tasks ADD CONSTRAINT tasks_type_check 
CHECK (type IN ('subscription', 'daily', 'link', 'level'));

-- Now add the level tasks
INSERT INTO public.tasks (title, description, points, type, is_active) VALUES
('إجمع 5,000 نقطة و احصل على 20 نقاط', 'عند وصولك لـ 5,000 نقطة، استلم مكافأة إضافية', 20, 'level', true),
('إجمع 10,000 نقطة و احصل على 100 نقاط', 'عند وصولك لـ 10,000 نقطة، استلم مكافأة إضافية', 100, 'level', true),
('إجمع 20,000 نقطة و احصل على 150 نقاط', 'عند وصولك لـ 20,000 نقطة، استلم مكافأة إضافية', 150, 'level', true),
('إجمع 40,000 نقطة و احصل على 250 نقاط', 'عند وصولك لـ 40,000 نقطة، استلم مكافأة إضافية', 250, 'level', true),
('إجمع 100,000 نقطة و احصل على 5,000 نقاط', 'عند وصولك لـ 100,000 نقطة، استلم مكافأة إضافية', 5000, 'level', true);