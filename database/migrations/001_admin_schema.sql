-- ============================================
-- SMARTSERVICES Schools - Admin Schema Migration
-- Version: 1.0.0
-- Description: Extends the existing schema with 
-- admin panel features, user roles, quotes, 
-- notifications, activity logs, and more.
-- ============================================

-- ============================================
-- 1. EXTEND USERS TABLE
-- ============================================
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
    CHECK (role IN ('super_admin', 'sales_manager', 'operations_manager', 'support_agent', 'technician', 'account_manager', 'user')),
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' 
    CHECK (account_status IN ('active', 'suspended', 'pending_verification', 'archived')),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spending DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_manager UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS school_logo TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS secondary_phone TEXT;

-- ============================================
-- 2. CREATE ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default roles
INSERT INTO public.roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access', '{"all": true}'),
  ('sales_manager', 'Manage sales and quotes', '{"quotes": "all", "requests": "read", "users": "read", "analytics": "read"}'),
  ('operations_manager', 'Manage operations and suppliers', '{"requests": "all", "suppliers": "all", "users": "read"}'),
  ('support_agent', 'Handle support tickets', '{"requests": "read", "requests_update": "write", "users": "read"}'),
  ('technician', 'Field operations', '{"requests": "read", "requests_update": "write"}'),
  ('account_manager', 'Manage client accounts', '{"users": "all", "requests": "read", "quotes": "create"}'  )
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. EXTEND REQUESTS TABLE
-- ============================================
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
  ADD COLUMN IF NOT EXISTS assigned_employee UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS estimated_completion_date DATE,
  ADD COLUMN IF NOT EXISTS quote_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS supplier_id UUID,
  ADD COLUMN IF NOT EXISTS supplier_name TEXT,
  ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ;

-- Update the check constraint for status to include new lifecycle
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE public.requests ADD CONSTRAINT requests_status_check 
  CHECK (status IN (
    'pending', 'review', 'approved', 'in_progress', 'completed', 'cancelled',
    'nouvelle_demande', 'en_attente', 'devis_envoye', 'devis_accepte', 'devis_refuse',
    'en_preparation', 'prestataire_assigne', 'en_cours', 'livre', 'termine', 'annule'
  ));

-- ============================================
-- 4. QUOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  delivery_fee DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'MAD',
  valid_until DATE,
  payment_terms TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'new_user', 'new_request', 'quote_accepted', 'quote_rejected', 
    'payment_received', 'request_updated', 'quote_available', 
    'request_completed', 'admin_message', 'status_change'
  )),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'status_change', 'user_modification', 'quote_creation', 'quote_update',
    'file_upload', 'login_attempt', 'permission_change', 'request_create',
    'request_delete', 'user_suspend', 'user_activate', 'payment_update'
  )),
  entity_type TEXT,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  service_categories TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. DOCUMENTS TABLE (for file management)
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'invoices', 'quotes', 'contracts', 'purchase_orders', 'images', 'certificates'
  )),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN (
    'delivery', 'event', 'installation', 'maintenance', 'deadline', 'meeting'
  )),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#ff6b00',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. INTERNAL NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'request', 'quote', 'supplier')),
  entity_id UUID NOT NULL,
  note TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON public.quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_documents_request ON public.documents(request_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_assigned ON public.calendar_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_internal_notes_entity ON public.internal_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(account_status);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_assigned ON public.requests(assigned_employee);
CREATE INDEX IF NOT EXISTS idx_requests_city ON public.requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_service ON public.requests(service_key);
CREATE INDEX IF NOT EXISTS idx_requests_created ON public.requests(created_at);
CREATE INDEX IF NOT EXISTS idx_suppliers_categories ON public.suppliers USING GIN(service_categories);

-- ============================================
-- 12. TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Auto-update updated_at for new tables
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate quote numbers
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number := 'DEV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_quote_created BEFORE INSERT ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.generate_quote_number();

-- Auto-update total_requests and total_spending on users table when a request changes
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user_id from the request (or use contact_email for anonymous requests)
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS NOT NULL THEN
      UPDATE public.users 
      SET total_requests = (SELECT COUNT(*) FROM public.requests WHERE user_id = NEW.user_id)
      WHERE id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.user_id IS NOT NULL THEN
      UPDATE public.users 
      SET total_requests = (SELECT COUNT(*) FROM public.requests WHERE user_id = OLD.user_id)
      WHERE id = OLD.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_request_stats_update AFTER INSERT OR DELETE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- ============================================
-- 13. GRANT PERMISSIONS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;