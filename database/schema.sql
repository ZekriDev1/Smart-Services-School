-- ============================================
-- SMARTSERVICES Schools - Complete Database Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


DROP VIEW IF EXISTS public.invoice_details;
DROP VIEW IF EXISTS public.request_details;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.barcode_history CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_items CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.request_items CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.service_categories CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- 1. AUTHENTICATION & RBAC TABLES
-- ============================================

-- Roles Table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions Table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permissions Mapping
CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Public Users Profiles Table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Roles Mapping (For multi-role capabilities if needed)
CREATE TABLE public.user_roles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Function to resolve user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for Users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access on profiles" ON public.users FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

-- RBAC Tables policies
CREATE POLICY "Allow select roles for authenticated" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin control roles" ON public.roles FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Allow select permissions for authenticated" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin control permissions" ON public.permissions FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

-- ============================================
-- 2. INVENTORY & PRODUCT TABLES
-- ============================================

-- Product Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  unit TEXT DEFAULT 'pcs',
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sell_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Levels Table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 100,
  bin_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users view active categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Authenticated users view active products" ON public.products FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Authenticated users view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage inventory" ON public.inventory FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Admins manage suppliers" ON public.suppliers FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

-- ============================================
-- 3. TRANSACTION & SALES/PURCHASES TABLES
-- ============================================

-- Sales Order Header
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id), -- staff who made sale
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque')),
  notes TEXT,
  quotation_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Order Items
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders Header (Suppliers restocking)
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id), -- staff who purchase
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'received', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial / Inventory Transactions Logging
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'adjustment', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  reference_id UUID, -- points to sale_id or purchase_id
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barcode History Scan Log
CREATE TABLE public.barcode_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  action_type TEXT NOT NULL CHECK (action_type IN ('lookup', 'register', 'sale', 'purchase', 'adjustment')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcode_history ENABLE ROW LEVEL SECURITY;

-- Policies (Full control to Admins)
CREATE POLICY "Admins manage sales" ON public.sales FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage sale items" ON public.sale_items FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage purchases" ON public.purchases FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage purchase items" ON public.purchase_items FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage barcode history" ON public.barcode_history FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

-- ============================================
-- 4. SERVICE REQUESTS & INVOICES (SUPPORT OLD FRONTEND)
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'approved', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Request Detail Items
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

-- Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'admin')),
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table (App configuration)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json')),
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies for Requests & Invoices
CREATE POLICY "Anyone view active service categories" ON public.service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins control service categories" ON public.service_categories FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Users view own requests" ON public.requests FOR SELECT USING (auth.uid() = user_id OR public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Users insert requests" ON public.requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own requests" ON public.requests FOR UPDATE USING (auth.uid() = user_id OR public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage requests" ON public.requests FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Users view own request items" ON public.request_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.requests WHERE requests.id = request_items.request_id AND requests.user_id = auth.uid()) 
  OR public.get_user_role() IN ('admin', 'superadmin')
);
CREATE POLICY "Users insert request items" ON public.request_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.requests WHERE requests.id = request_items.request_id AND requests.user_id = auth.uid())
);

CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id OR public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id OR public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Users insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone view public settings" ON public.settings FOR SELECT USING (is_public = true OR public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL USING (public.get_user_role() IN ('admin', 'superadmin'));

-- ============================================
-- 5. AUDITING AND LOGGING TABLES
-- ============================================

-- DB-Level Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity Logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  activity TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins view activity logs" ON public.activity_logs FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));

-- ============================================
-- 6. TRIGGERS, INDEXES, AND PROCEDURES
-- ============================================

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

-- Function: handle_new_user (auth.users -> public.users profile sync)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert metadata or default values
  INSERT INTO public.users (id, email, full_name, school_name, phone, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'school_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'user',
    NOW()
  );
  
  -- Assign default user role in user_roles mapping table if role exists
  INSERT INTO public.user_roles(user_id, role_id)
  SELECT NEW.id, id FROM public.roles WHERE name = 'user'
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON public.purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_barcode_history_barcode ON public.barcode_history(barcode);

-- ============================================
-- 7. VIEWS FOR REPORTING
-- ============================================

-- Request Details View
CREATE OR REPLACE VIEW public.request_details AS
SELECT 
  r.*,
  u.email as user_email,
  u.full_name as user_name,
  u.school_name as user_school,
  u.phone as user_phone
FROM public.requests r
JOIN public.users u ON r.user_id = u.id;

-- Invoice Details View
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
-- 8. DEFAULT SEED DATA
-- ============================================

-- Insert default service categories
INSERT INTO public.service_categories (key, name_fr, name_ar, icon, sort_order) VALUES
  ('supplies', 'Fournitures de bureau', 'لوازم مكتبية', 'fa-boxes', 1),
  ('printing', 'Services d impression', 'خدمات الطباعة', 'fa-print', 2),
  ('events', 'Organisation d événements', 'تنظيم الفعاليات', 'fa-calendar-alt', 3),
  ('gifts', 'Cadeaux & Récompenses scolaires', 'الهدايا والجوائز المدرسية', 'fa-gift', 4),
  ('giveaways', 'Goodies scolaires', 'الهدايا التذكارية المدرسية', 'fa-tags', 5),
  ('repair', 'Réparation informatique & CCTV', 'إصلاح الكمبيوتر والكاميرات', 'fa-laptop', 6),
  ('wifi', 'Réparation réseau Wi-Fi', 'إصلاح شبكة Wi-Fi', 'fa-wifi', 7),
  ('photo', 'Photographie & Documentation', 'التصوير والتوثيق', 'fa-camera', 8),
  ('printer', 'Maintenance d imprimantes', 'صيانة الطابعات', 'fa-tools', 9),
  ('consulting', 'Consulting', 'استشارات', 'fa-chart-line', 10),
  ('custom', 'Service personnalisé', 'خدمة مخصصة', 'fa-plus-circle', 11)
ON CONFLICT (key) DO NOTHING;

-- Insert roles
INSERT INTO public.roles (name, description) VALUES
  ('user', 'Regular school manager user'),
  ('admin', 'Administrator access'),
  ('superadmin', 'Superadmin control')
ON CONFLICT (name) DO NOTHING;

-- Insert settings
INSERT INTO public.settings (key, value, type, category, is_public) VALUES
  ('site_name', 'SMARTSERVICES Schools', 'text', 'general', true),
  ('site_email', 'contact@smartservices.ma', 'text', 'general', true),
  ('site_phone', '+212 5XX XX XX XX', 'text', 'general', true),
  ('site_address', 'Tanger, Maroc', 'text', 'general', true),
  ('currency', 'MAD', 'text', 'billing', true),
  ('tax_rate', '20', 'number', 'billing', true),
  ('email_confirm_required', 'false', 'boolean', 'auth', false)
ON CONFLICT (key) DO NOTHING;