-- ============================================
-- SMARTSERVICES Schools - New Admin Schema & RLS
-- ============================================
-- Migration 006: Admin roles, RLS policies, storage policies
-- ============================================

-- 1. FIX USERS TABLE - Drop old role constraint and add new one that includes 'admin'
-- Note: migration 001 added a role column with CHECK (role IN ('super_admin','sales_manager',...'user'))
-- but NOT 'admin'. We need to fix this.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add the updated constraint that includes 'admin' role
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'sales_manager', 'operations_manager', 'support_agent', 'technician', 'account_manager', 'user', 'admin'));

-- Update any existing users with null role to 'user'
UPDATE public.users SET role = 'user' WHERE role IS NULL;
UPDATE public.users SET account_status = 'active' WHERE account_status IS NULL;
-- Then set the specific admin user to admin role
UPDATE public.users SET role = 'admin' WHERE email = 'admin@smartservices.ma';

-- 2. ENHANCE REQUESTS TABLE - First drop old constraint, update data, add new broader constraint
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_priority_check;

-- Update old status values to new standardized ones while preserving old ones for backward compat
-- We use a broader constraint that accepts both old and new statuses
UPDATE public.requests SET status = 'pending' WHERE status IN ('nouvelle_demande', 'en_attente');
UPDATE public.requests SET status = 'under_review' WHERE status IN ('review', 'devis_envoye');
UPDATE public.requests SET status = 'in_progress' WHERE status IN ('en_preparation', 'prestataire_assigne', 'en_cours');
UPDATE public.requests SET status = 'completed' WHERE status IN ('termine', 'livre', 'devis_accepte');
UPDATE public.requests SET status = 'cancelled' WHERE status IN ('annule', 'devis_refuse');
UPDATE public.requests SET status = 'pending' WHERE status IS NULL OR status = '';

-- Add constraint that accepts both new and legacy statuses for backward compatibility
ALTER TABLE public.requests ADD CONSTRAINT requests_status_check 
  CHECK (status IN ('pending', 'under_review', 'waiting_info', 'approved', 'in_progress', 'completed', 'cancelled',
                    'nouvelle_demande', 'en_attente', 'devis_envoye', 'devis_accepte', 'devis_refuse',
                    'en_preparation', 'prestataire_assigne', 'en_cours', 'livre', 'termine', 'annule'));

ALTER TABLE public.requests ADD CONSTRAINT requests_priority_check 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical'));

ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS quote_amount DECIMAL(10,2);
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES auth.users(id);
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;

-- 3. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  notes TEXT
);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACTIVITY LOGS TABLE (for backward compatibility)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INTERNAL NOTES TABLE
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  note TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  color TEXT DEFAULT '#ff6b00',
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REQUEST ATTACHMENTS TABLE (for backward compatibility)
CREATE TABLE IF NOT EXISTS public.request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
-- NOTE: public.users RLS is disabled in schema.sql to avoid infinite recursion
-- when is_admin() or other policies query the users table.
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; -- Would cause infinite recursion
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- NOTE: No RLS policies on public.users since RLS is disabled on that table.
-- User access control is handled via the is_admin() SECURITY DEFINER function
-- and the policies defined in migration 002.

-- REQUESTS POLICIES
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all requests" ON public.requests;
CREATE POLICY "Admins can view all requests" ON public.requests
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
CREATE POLICY "Users can create requests" ON public.requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pending requests" ON public.requests;
CREATE POLICY "Users can update own pending requests" ON public.requests
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'nouvelle_demande', 'en_attente'));

DROP POLICY IF EXISTS "Admins can update all requests" ON public.requests;
CREATE POLICY "Admins can update all requests" ON public.requests
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete requests" ON public.requests;
CREATE POLICY "Admins can delete requests" ON public.requests
  FOR DELETE USING (public.is_admin());

-- QUOTATIONS POLICIES
DROP POLICY IF EXISTS "Users can view quotations on own requests" ON public.quotations;
CREATE POLICY "Users can view quotations on own requests" ON public.quotations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage quotations" ON public.quotations;
CREATE POLICY "Admins can manage quotations" ON public.quotations
  FOR ALL USING (public.is_admin());

-- AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- ACTIVITY LOGS POLICIES
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin());

-- INTERNAL NOTES POLICIES
DROP POLICY IF EXISTS "Admins can manage internal notes" ON public.internal_notes;
CREATE POLICY "Admins can manage internal notes" ON public.internal_notes
  FOR ALL USING (public.is_admin());

-- CALENDAR EVENTS POLICIES
DROP POLICY IF EXISTS "Admins can manage calendar events" ON public.calendar_events;
CREATE POLICY "Admins can manage calendar events" ON public.calendar_events
  FOR ALL USING (public.is_admin());

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- REQUEST ATTACHMENTS POLICIES
DROP POLICY IF EXISTS "Users can view attachments on own requests" ON public.request_attachments;
CREATE POLICY "Users can view attachments on own requests" ON public.request_attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage attachments" ON public.request_attachments;
CREATE POLICY "Admins can manage attachments" ON public.request_attachments
  FOR ALL USING (public.is_admin());

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Create quotations bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quotations', 'quotations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for quotations bucket
DROP POLICY IF EXISTS "Admins can upload quotations" ON storage.objects;
CREATE POLICY "Admins can upload quotations" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'quotations' AND
    public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone can view quotations" ON storage.objects;
CREATE POLICY "Anyone can view quotations" ON storage.objects
  FOR SELECT USING (bucket_id = 'quotations');

DROP POLICY IF EXISTS "Admins can update quotations" ON storage.objects;
CREATE POLICY "Admins can update quotations" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'quotations' AND
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete quotations" ON storage.objects;
CREATE POLICY "Admins can delete quotations" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'quotations' AND
    public.is_admin()
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quotations_request ON public.quotations(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.quotations TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT ALL ON public.activity_logs TO authenticated;
GRANT ALL ON public.internal_notes TO authenticated;
GRANT ALL ON public.calendar_events TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.request_attachments TO authenticated;