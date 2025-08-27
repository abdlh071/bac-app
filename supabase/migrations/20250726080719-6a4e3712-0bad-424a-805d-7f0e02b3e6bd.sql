-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.update_user_points(p_telegram_id bigint, p_points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.users 
  SET points = points + p_points_to_add,
      updated_at = now()
  WHERE telegram_id = p_telegram_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_ranking(p_telegram_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND telegram_id IN (5705054777, 123456789)
  )
$$;