-- 16_direct_messages_and_attachments.sql
-- Run this in your Supabase SQL Editor

-- 1. Alter instructor_exercises to support attachments
ALTER TABLE public.instructor_exercises 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 2. Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON public.direct_messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON public.direct_messages (receiver_id, created_at DESC);

-- Enable RLS for messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages they sent or received
DROP POLICY IF EXISTS "Participants can read messages" ON public.direct_messages;
CREATE POLICY "Participants can read messages"
  ON public.direct_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can insert messages if they are the sender
DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
CREATE POLICY "Users can send messages"
  ON public.direct_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update read_at only if they are the receiver
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON public.direct_messages;
CREATE POLICY "Receivers can mark messages as read"
  ON public.direct_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 3. Create Storage Bucket for assignments if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignments', 'assignments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for the assignments bucket
DROP POLICY IF EXISTS "Public can view assignment documents" ON storage.objects;
CREATE POLICY "Public can view assignment documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignments');

DROP POLICY IF EXISTS "Authenticated users can upload assignments" ON storage.objects;
CREATE POLICY "Authenticated users can upload assignments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assignments' AND auth.role() = 'authenticated');
