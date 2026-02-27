ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;

CREATE OR REPLACE FUNCTION public.add_user_xp(p_user_id UUID, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + p_amount
    WHERE id = p_user_id;
END;
$$;
