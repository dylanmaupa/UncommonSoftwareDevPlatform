-- 12_fix_streaks_logic.sql
-- Add a broken_streaks column to profiles to track how many times a user lost their streak.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS broken_streaks INT DEFAULT 0;

-- Redefine record_user_activity to enforce a strict 1-day streak rule.
CREATE OR REPLACE FUNCTION public.record_user_activity(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_today DATE := current_date;
    v_yesterday DATE := current_date - interval '1 day';
    v_last_activity DATE;
    v_current_streak INT;
    v_longest_streak INT;
    v_broken_streaks INT;
BEGIN
    -- Fetch the user's current tracking metrics
    SELECT last_activity_date, streak, longest_streak, broken_streaks
    INTO v_last_activity, v_current_streak, v_longest_streak, v_broken_streaks
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

    -- Check if a streak was broken (missed yesterday and had an active streak)
    IF v_last_activity IS NOT NULL AND v_last_activity < v_yesterday AND COALESCE(v_current_streak, 0) > 0 THEN
        v_broken_streaks := COALESCE(v_broken_streaks, 0) + 1;
    END IF;

    -- Calculate the new streak
    -- Strict 1-day rule: Streak continues ONLY if last activity was exactly yesterday
    IF v_last_activity = v_yesterday THEN
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
        last_activity_date = v_today,
        broken_streaks = COALESCE(v_broken_streaks, 0)
    WHERE id = p_user_id;
END;
$$;
