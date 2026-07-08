-- ============================================
-- SMARTSERVICES Schools - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLEANUP EXISTING OBJECTS
-- ============================================

DROP VIEW IF EXISTS public.invoice_details;
DROP VIEW IF EXISTS public.request_details;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================

-- Public Users Profiles Table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for admin panel access via anonymous queries
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. SERVICE REQUESTS & INVOICES
-- ============================================

-- Service Request Categories
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  description_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Requests Table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_key TEXT NOT NULL REFERENCES public.service_categories(key),
  service_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  description TEXT,
  requested_date DATE,
  budget DECIMAL(10,2),
  quantity INTEGER,
  quotation_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'approved', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Request Items
CREATE TABLE public.request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  item_type TEXT,
  item_name TEXT,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  specifications TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for admin panel access via anonymous queries
ALTER TABLE public.service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. TRIGGERS AND PROCEDURES
-- ============================================

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: generate_request_number
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'SS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_request_created BEFORE INSERT ON public.requests FOR EACH ROW EXECUTE FUNCTION public.generate_request_number();

-- Function: generate_invoice_number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'FAC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invoice_created BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, school_name, phone, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'school_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_requests_user ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);

-- ============================================
-- 5. VIEWS FOR ADMIN AND REPORTING
-- ============================================

-- View for admin to see all requests with user details
CREATE OR REPLACE VIEW public.request_details AS
SELECT 
  r.*,
  u.email as user_email,
  u.full_name as user_name,
  u.school_name as user_school,
  u.phone as user_phone
FROM public.requests r
JOIN public.users u ON r.user_id = u.id;

-- View for admin to see all invoices with details
CREATE OR REPLACE VIEW public.invoice_details AS
SELECT 
  i.*,
  r.request_number,
  r.service_name as request_service_name,
  u.email as user_email,
  u.full_name as user_name,
  u.school_name as user_school
FROM public.invoices i
LEFT JOIN public.requests r ON i.request_id = r.id
LEFT JOIN public.users u ON i.user_id = u.id;

-- ============================================
-- 6. GRANT PERMISSIONS FOR ANON/PUBLIC
-- ============================================

-- Grant schema usage to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant SELECT on tables to anon (for admin panel access)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.service_categories TO anon;
GRANT SELECT ON public.requests TO anon;
GRANT SELECT ON public.request_items TO anon;
GRANT SELECT ON public.invoices TO anon;

-- Grant SELECT on views to anon
GRANT SELECT ON public.request_details TO anon;
GRANT SELECT ON public.invoice_details TO anon;

-- ============================================
-- 7. DEFAULT SEED DATA
-- ============================================

INSERT INTO public.service_categories (key, name_fr, name_ar, icon, sort_order) VALUES
  ('supplies', 'Fournitures de bureau', 'لوازم مكتبية', 'fa-boxes', 1),
  ('printing', 'Services d impression', 'خدمات الطباعة', 'fa-print', 2),
  ('events', 'Organisation d evenements', 'تنظيم الفعاليات', 'fa-calendar-alt', 3),
  ('gifts', 'Cadeaux & Recompenses scolaires', 'الهدايا والجوائز المدرسية', 'fa-gift', 4),
  ('giveaways', 'Goodies sccolaires', 'الهدايا التذكارية المدرسية', 'fa-tags', 5),
  ('repair', 'Reparation informatique & CCTV', 'إصلاح الكمبيوتر والكاميرات', 'fa-laptop', 6),
  ('wifi', 'Reparation reseau Wi-Fi', 'إصلاح شبكة Wi-Fi', 'fa-wifi', 7),
  ('photo', 'Photographie & Documentation', 'التصوير والتوثيق', 'fa-camera', 8),
  ('printer', 'Maintenance d imprimantes', 'صيانة الطابعات', 'fa-tools', 9),
  ('consulting', 'Consulting', 'استشارات', 'fa-chart-line', 10),
  ('custom', 'Service personnalise', 'خدمة مخصصة', 'fa-plus-circle', 11)
ON CONFLICT (key) DO NOTHING;