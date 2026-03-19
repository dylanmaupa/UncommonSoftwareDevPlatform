-- 09_user_achievements.sql
-- Add an achievements array column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements text[] DEFAULT '{}';

-- Redefine record_user_activity to include a 1-day grace period
CREATE OR REPLACE FUNCTION public.record_user_activity(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_today DATE := current_date;
    v_yesterday DATE := current_date - interval '1 day';
    v_day_before_yesterday DATE := current_date - interval '2 days';
    v_last_activity DATE;
    v_current_streak INT;
    v_longest_streak INT;
BEGIN
    -- Fetch the user's current tracking metrics
    SELECT last_activity_date, streak, longest_streak 
    INTO v_last_activity, v_current_streak, v_longest_streak
    FROM public.profiles
    WHERE id = p_user_id;

    -- If they already logged activity today, do nothing to the streak logic
    IF v_last_activity = v_today THEN
        RETURN;
    END IF;

    -- Upsert today's date into the visual activity calendar
    INSERT INTO public.user_activity_logs (user_id, active_date)
    VALUES (p_user_id, v_today)
    ON CONFLICT (user_id, active_date) DO NOTHING;

    -- Calculate the new streak
    -- GRACE PERIOD: Streak continues if last activity was yesterday OR the day before yesterday
    IF v_last_activity = v_yesterday OR v_last_activity = v_day_before_yesterday THEN
        v_current_streak := COALESCE(v_current_streak, 0) + 1;
    ELSE
        -- Streak broken or first day
        v_current_streak := 1;
    END IF;

    -- Check if it's a new record
    IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
        v_longest_streak := v_current_streak;
    END IF;

    -- Update the profile
    UPDATE public.profiles
    SET 
        streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today
    WHERE id = p_user_id;
END;
$$;
