-- ============================================
-- SMARTSERVICES Schools - Storage RLS Policies
-- Version: 4.0.0
-- Description: RLS policies for the "quotations" storage bucket
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read/download files from quotations bucket
CREATE POLICY "public_read_quotations"
ON storage.objects
FOR SELECT
USING (bucket_id = 'quotations');

-- Policy 2: Authenticated users can upload files
CREATE POLICY "auth_upload_quotations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quotations');

-- Policy 3: Authenticated users can update files
CREATE POLICY "auth_update_quotations"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'quotations')
WITH CHECK (bucket_id = 'quotations');

-- Policy 4: Authenticated users can delete files
CREATE POLICY "auth_delete_quotations"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'quotations');

-- Grant permissions
GRANT SELECT ON storage.objects TO anon;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;