-- Add grading columns to instructor_exercises
ALTER TABLE public.instructor_exercises
ADD COLUMN IF NOT EXISTS grade INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT NULL;

-- Drop the existing constraint so we can allow 'approved' and 'rejected' (or 'pending' mappings)
ALTER TABLE public.instructor_exercises 
DROP CONSTRAINT IF EXISTS instructor_exercises_status_check;

-- Add updated constraint allowing instructor review statuses
ALTER TABLE public.instructor_exercises
ADD CONSTRAINT instructor_exercises_status_check 
CHECK (status IN ('assigned', 'submitted', 'pending', 'reviewed', 'approved', 'rejected'));
