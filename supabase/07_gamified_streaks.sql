-- Add tracking columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Create a table specifically to track the exact dates a user was active for the "weekly calendar" view
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    active_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, active_date)
);

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity logs are viewable by everyone." ON public.user_activity_logs
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own activity logs." ON public.user_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create an RPC to safely record daily activity and calculate the streak sequence
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
    IF v_last_activity = v_yesterday THEN
        -- Streak continues
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
