-- ============================================
-- SMARTSERVICES Schools - Admin Anon Access
-- Version: 2.0.0
-- Description:
--   Allow anon (non-authenticated) users to perform
--   all operations needed by the admin panel.
--   Required when opening admin/index.html directly
--   (file://) without a backend server.
-- ============================================

-- ============================================
-- 1. REQUESTS: anon can SELECT, INSERT, UPDATE, DELETE
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_requests" ON public.requests;
CREATE POLICY "anon_can_select_requests" ON public.requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_can_insert_requests" ON public.requests;
CREATE POLICY "anon_can_insert_requests" ON public.requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anon_can_update_requests" ON public.requests;
CREATE POLICY "anon_can_update_requests" ON public.requests
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "anon_can_delete_requests" ON public.requests;
CREATE POLICY "anon_can_delete_requests" ON public.requests
  FOR DELETE USING (true);

-- ============================================
-- 2. INVOICES: anon can SELECT
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_invoices" ON public.invoices;
CREATE POLICY "anon_can_select_invoices" ON public.invoices
  FOR SELECT USING (true);

-- ============================================
-- 3. QUOTES: anon can SELECT
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_quotes" ON public.quotes;
CREATE POLICY "anon_can_select_quotes" ON public.quotes
  FOR SELECT USING (true);

-- ============================================
-- 4. DOCUMENTS: anon can SELECT, INSERT, DELETE
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_documents" ON public.documents;
CREATE POLICY "anon_can_select_documents" ON public.documents
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_can_insert_documents" ON public.documents;
CREATE POLICY "anon_can_insert_documents" ON public.documents
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anon_can_delete_documents" ON public.documents;
CREATE POLICY "anon_can_delete_documents" ON public.documents
  FOR DELETE USING (true);

-- ============================================
-- 5. USERS: anon can SELECT, INSERT, UPDATE
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_users" ON public.users;
CREATE POLICY "anon_can_select_users" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_can_update_users" ON public.users;
CREATE POLICY "anon_can_update_users" ON public.users
  FOR UPDATE USING (true);

-- ============================================
-- 6. NOTIFICATIONS: anon can SELECT, INSERT
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_notifications" ON public.notifications;
CREATE POLICY "anon_can_select_notifications" ON public.notifications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_can_insert_notifications" ON public.notifications;
CREATE POLICY "anon_can_insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. ACTIVITY LOGS: anon can SELECT, INSERT
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_activity_logs" ON public.activity_logs;
CREATE POLICY "anon_can_select_activity_logs" ON public.activity_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_can_insert_activity_logs" ON public.activity_logs;
CREATE POLICY "anon_can_insert_activity_logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. SERVICE CATEGORIES: anon can SELECT
-- ============================================
DROP POLICY IF EXISTS "anon_can_select_service_categories" ON public.service_categories;
CREATE POLICY "anon_can_select_service_categories" ON public.service_categories
  FOR SELECT USING (true);

-- ============================================
-- 9. STORAGE: anon can upload to quotations bucket
-- ============================================
DROP POLICY IF EXISTS "anon_can_upload_quotations" ON storage.objects;
CREATE POLICY "anon_can_upload_quotations" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'quotations');

DROP POLICY IF EXISTS "anon_can_select_quotations" ON storage.objects;
CREATE POLICY "anon_can_select_quotations" ON storage.objects
  FOR SELECT USING (bucket_id = 'quotations');
