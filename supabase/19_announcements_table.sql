-- =======================================================
-- Migration 19: Announcements Table
-- Creates hub-level and individual student announcements.
-- =======================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hub_location  TEXT NOT NULL,
  student_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = hub-wide
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  pinned        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_announcements_hub
  ON public.announcements (hub_location, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_instructor
  ON public.announcements (instructor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_student
  ON public.announcements (student_id, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_announcements_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE PROCEDURE public.set_announcements_updated_at();

-- RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Instructors: full access to their own announcements
DROP POLICY IF EXISTS "Instructors can manage own announcements" ON public.announcements;
CREATE POLICY "Instructors can manage own announcements"
  ON public.announcements
  FOR ALL
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- Students: read hub-wide or individually addressed announcements
DROP POLICY IF EXISTS "Students can read their announcements" ON public.announcements;
CREATE POLICY "Students can read their announcements"
  ON public.announcements
  FOR SELECT
  USING (
    -- Hub-wide: matches student hub
    (student_id IS NULL AND hub_location IN (
      SELECT hub_location FROM public.profiles
      WHERE id = auth.uid() AND role = 'student'
    ))
    OR
    -- Direct: addressed to this specific student
    student_id = auth.uid()
  );
