-- ============================================
-- SMARTSERVICES Schools - PDF Storage Bucket
-- Version: 8.0.0
-- Description: Creates the "pdf" storage bucket for
--   user-uploaded files from the "Nouvelle demande"
--   form (PDFs, images). Also allows anon (public)
--   upload so app.html can upload directly without
--   requiring a Supabase Auth session.
-- Run this in Supabase SQL Editor.
-- ============================================

-- ============================================
-- 1. CREATE THE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'pdf',           -- bucket ID (used in code)
  'pdf',           -- bucket display name
  true,            -- public bucket (anyone can read via URL)
  false,           -- avif_autodetection
  20971520,        -- file_size_limit (20MB in bytes)
  ARRAY['application/pdf','image/png','image/jpeg','image/gif','image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. STORAGE RLS POLICIES
-- ============================================

-- Allow anyone (anon) to read files
DROP POLICY IF EXISTS "pdf_public_read" ON storage.objects;
CREATE POLICY "pdf_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf');

-- Allow anon uploads (used by app.html without auth session)
DROP POLICY IF EXISTS "pdf_anon_upload" ON storage.objects;
CREATE POLICY "pdf_anon_upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'pdf');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "pdf_authenticated_upload" ON storage.objects;
CREATE POLICY "pdf_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf');

-- ============================================
-- 3. GRANTS
-- ============================================
GRANT SELECT ON storage.objects TO anon;
GRANT INSERT ON storage.objects TO anon;
GRANT INSERT ON storage.objects TO authenticated;

-- ============================================
-- 4. TABLE RLS — ensure anon can INSERT into documents table
-- ============================================
DROP POLICY IF EXISTS "anon_can_insert_documents" ON public.documents;
CREATE POLICY "anon_can_insert_documents" ON public.documents
  FOR INSERT WITH CHECK (true);
