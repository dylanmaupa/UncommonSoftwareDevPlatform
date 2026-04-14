-- =======================================================
-- Migration 18: Fix existing exercises with empty hub_location
-- Backfills hub_location on instructor_exercises rows that
-- were inserted with a NULL or empty hub_location due to the
-- race condition bug fixed in AssignExerciseModal.tsx.
-- =======================================================

UPDATE public.instructor_exercises ie
SET hub_location = p.hub_location
FROM public.profiles p
WHERE ie.instructor_id = p.id
  AND (ie.hub_location IS NULL OR ie.hub_location = '');
