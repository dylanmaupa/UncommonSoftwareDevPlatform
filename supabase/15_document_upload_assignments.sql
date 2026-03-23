-- Support instructor assignments that require uploaded documents
ALTER TABLE public.instructor_exercises
DROP CONSTRAINT IF EXISTS instructor_exercises_language_check;

ALTER TABLE public.instructor_exercises
ADD CONSTRAINT instructor_exercises_language_check
CHECK (language IN ('python', 'javascript', 'document'));

ALTER TABLE public.instructor_exercises
ADD COLUMN IF NOT EXISTS formatting_requirements TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_document_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_document_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_document_size BIGINT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_document_mime_type TEXT DEFAULT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-documents',
  'assignment-documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can view assignment documents" ON storage.objects;
CREATE POLICY "Authenticated users can view assignment documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'assignment-documents');

DROP POLICY IF EXISTS "Users can upload their own assignment documents" ON storage.objects;
CREATE POLICY "Users can upload their own assignment documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own assignment documents" ON storage.objects;
CREATE POLICY "Users can update their own assignment documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'assignment-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'assignment-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own assignment documents" ON storage.objects;
CREATE POLICY "Users can delete their own assignment documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assignment-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
