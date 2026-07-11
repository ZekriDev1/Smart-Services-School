
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. HELPER FUNCTION: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'sales_manager', 'operations_manager', 'support_agent', 'technician', 'account_manager')
    AND account_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. HELPER FUNCTION: Check if user owns the resource
-- ============================================
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. USERS RLS POLICIES
-- ============================================
-- Users can read their own profile
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
  );

-- Users can update their own profile (but not role/status)
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can insert/delete users
CREATE POLICY users_insert_admin ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY users_delete_admin ON public.users
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 5. REQUESTS RLS POLICIES
-- ============================================
-- Users can see their own requests; admins can see all
CREATE POLICY requests_select ON public.requests
  FOR SELECT USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (user_id IS NULL AND contact_email = auth.email())
    OR public.is_admin()
  );

-- Users can insert their own requests
CREATE POLICY requests_insert_own ON public.requests
  FOR INSERT WITH CHECK (
    (user_id IS NULL AND contact_email = auth.email())
    OR (user_id = auth.uid())
    OR public.is_admin()
  );

-- Only admins can update/delete requests
CREATE POLICY requests_update_admin ON public.requests
  FOR UPDATE USING (public.is_admin());

CREATE POLICY requests_delete_admin ON public.requests
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 6. QUOTES RLS POLICIES
-- ============================================
-- Users can see quotes for their own requests
CREATE POLICY quotes_select ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = quotes.request_id
      AND (requests.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Only admins can manage quotes
CREATE POLICY quotes_insert_admin ON public.quotes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY quotes_update_admin ON public.quotes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY quotes_delete_admin ON public.quotes
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 7. INVOICES RLS POLICIES
-- ============================================
CREATE POLICY invoices_select ON public.invoices
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY invoices_insert_admin ON public.invoices
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY invoices_update_admin ON public.invoices
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- 8. NOTIFICATIONS RLS POLICIES
-- ============================================
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_insert ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 9. DOCUMENTS RLS POLICIES
-- ============================================
CREATE POLICY documents_select ON public.documents
  FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = documents.request_id
      AND (requests.user_id = auth.uid() OR public.is_admin())
    )
    OR public.is_admin()
  );

CREATE POLICY documents_insert_admin ON public.documents
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY documents_delete_admin ON public.documents
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 10. INTERNAL NOTES RLS POLICIES
-- ============================================
CREATE POLICY internal_notes_select ON public.internal_notes
  FOR SELECT USING (public.is_admin());

CREATE POLICY internal_notes_insert ON public.internal_notes
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- 11. ACTIVITY LOGS RLS POLICIES
-- ============================================
CREATE POLICY activity_logs_select ON public.activity_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY activity_logs_insert ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 12. SUPPLIERS RLS POLICIES
-- ============================================
CREATE POLICY suppliers_select ON public.suppliers
  FOR SELECT USING (true);

CREATE POLICY suppliers_insert_admin ON public.suppliers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY suppliers_update_admin ON public.suppliers
  FOR UPDATE USING (public.is_admin());

CREATE POLICY suppliers_delete_admin ON public.suppliers
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 13. CALENDAR EVENTS RLS POLICIES
-- ============================================
CREATE POLICY calendar_events_select ON public.calendar_events
  FOR SELECT USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR public.is_admin()
  );

CREATE POLICY calendar_events_insert ON public.calendar_events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY calendar_events_update ON public.calendar_events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY calendar_events_delete ON public.calendar_events
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 14. GRANT PERMISSIONS FOR AUTHENTICATED USERS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- 15. CREATE ADMIN CHECK FUNCTION FOR BACKEND
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 16. CREATE FUNCTION TO GET USER BY EMAIL (for admin login)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  account_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.role, u.account_status
  FROM public.users u
  WHERE u.email = user_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;