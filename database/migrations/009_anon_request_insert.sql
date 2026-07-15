-- ============================================
-- SMARTSERVICES Schools - Anonymous Permissions Fix
-- Version: 2.0.0
-- Description:
--   Fix missing table-level GRANTs for anon role so
--   unauthenticated users can submit fast requests
--   with file uploads from index.html.
-- ============================================

-- 1. GRANT INSERT on requests so anon users can submit requests
GRANT INSERT ON public.requests TO anon;

-- 2. GRANT INSERT/UPDATE on documents so anon users can save file references
GRANT INSERT ON public.documents TO anon;
GRANT UPDATE ON public.documents TO anon;

-- 3. RLS policy for anon document inserts (safety net if 008 not applied)
DROP POLICY IF EXISTS "anon_can_insert_documents" ON public.documents;
CREATE POLICY "anon_can_insert_documents" ON public.documents
  FOR INSERT WITH CHECK (true);

-- 4. Ensure pdf bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf',
  'pdf',
  true,
  20971520,
  ARRAY['application/pdf','image/png','image/jpeg','image/gif','image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for pdf bucket (idempotent - won't error if already exist)
DROP POLICY IF EXISTS "pdf_anon_upload" ON storage.objects;
CREATE POLICY "pdf_anon_upload"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'pdf');

DROP POLICY IF EXISTS "pdf_public_read" ON storage.objects;
CREATE POLICY "pdf_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pdf');

GRANT SELECT ON storage.objects TO anon;
GRANT INSERT ON storage.objects TO anon;
