CREATE TABLE IF NOT EXISTS public.instructor_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: for direct assignments, NULL for hub-wide
  hub_location TEXT NOT NULL, -- Hub/location where assignment is visible to all students
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python' CHECK (language IN ('python', 'javascript')),
  starter_code TEXT DEFAULT '',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'submitted', 'reviewed')),
  submission_code TEXT,
  submission_output TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_instructor_exercises_instructor_id
  ON public.instructor_exercises (instructor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_instructor_exercises_student_id
  ON public.instructor_exercises (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_instructor_exercises_hub_location
  ON public.instructor_exercises (hub_location, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_instructor_exercises_status
  ON public.instructor_exercises (status);

CREATE OR REPLACE FUNCTION public.set_instructor_exercises_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_instructor_exercises_updated_at ON public.instructor_exercises;
CREATE TRIGGER trg_set_instructor_exercises_updated_at
  BEFORE UPDATE ON public.instructor_exercises
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_instructor_exercises_updated_at();

ALTER TABLE public.instructor_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Instructors can read their exercises" ON public.instructor_exercises;
CREATE POLICY "Instructors can read their exercises"
  ON public.instructor_exercises
  FOR SELECT
  USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Students can read assigned exercises" ON public.instructor_exercises;
CREATE POLICY "Students can read assigned exercises"
  ON public.instructor_exercises
  FOR SELECT
  USING (
    -- Student can read if directly assigned
    auth.uid() = student_id
    -- OR if the assignment is in their hub (students can read all hub assignments)
    OR hub_location IN (
      SELECT hub_location FROM public.profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

DROP POLICY IF EXISTS "Instructors can assign exercises" ON public.instructor_exercises;
CREATE POLICY "Instructors can assign exercises"
  ON public.instructor_exercises
  FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Students can submit assigned exercises" ON public.instructor_exercises;
CREATE POLICY "Students can submit assigned exercises"
  ON public.instructor_exercises
  FOR UPDATE
  USING (
    -- Student can submit if directly assigned
    auth.uid() = student_id
    -- OR if the assignment is in their hub
    OR hub_location IN (
      SELECT hub_location FROM public.profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  )
  WITH CHECK (
    -- Student can update/submit if directly assigned
    auth.uid() = student_id
    -- OR if the assignment is in their hub
    OR hub_location IN (
      SELECT hub_location FROM public.profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

DROP POLICY IF EXISTS "Instructors can update owned exercises" ON public.instructor_exercises;
CREATE POLICY "Instructors can update owned exercises"
  ON public.instructor_exercises
  FOR UPDATE
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can delete owned exercises" ON public.instructor_exercises;
CREATE POLICY "Instructors can delete owned exercises"
  ON public.instructor_exercises
  FOR DELETE
  USING (auth.uid() = instructor_id);
