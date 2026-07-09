-- ============================================
-- SMARTSERVICES Schools - Create Storage Bucket
-- Version: 3.0.0
-- Description: Creates the "quotations" storage 
-- bucket with appropriate access policies.
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- or via psql.
-- ============================================

-- ============================================
-- 1. INSERT THE BUCKET INTO storage.buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'quotations',           -- bucket ID (used in code)
  'quotations',           -- bucket display name
  true,                   -- public bucket (true = anyone can read)
  false,                  -- avif_autodetection
  10485760,               -- file_size_limit (10MB in bytes)
  ARRAY['application/pdf']::text[]  -- only allow PDF files
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE RLS POLICY: Public read access
-- ============================================
CREATE POLICY "quotations_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'quotations');

-- ============================================
-- 3. CREATE RLS POLICY: Authenticated users can upload
-- ============================================
CREATE POLICY "quotations_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quotations' AND
  (storage.foldername(name))[1] IS NOT NULL
);

-- ============================================
-- 4. CREATE RLS POLICY: Users can update own files
-- ============================================
CREATE POLICY "quotations_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'quotations' AND owner = auth.uid())
WITH CHECK (bucket_id = 'quotations' AND owner = auth.uid());

-- ============================================
-- 5. CREATE RLS POLICY: Users can delete own files
-- ============================================
CREATE POLICY "quotations_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'quotations' AND owner = auth.uid());

-- ============================================
-- 6. GRANT bucket access permissions
-- ============================================

-- Allow anon (public) users to select (download) files
GRANT SELECT ON storage.objects TO anon;

-- Allow authenticated users to insert/update/delete
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;