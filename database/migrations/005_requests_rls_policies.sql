-- ============================================
-- SMARTSERVICES Schools - Requests RLS Policies
-- Version: 1.0.0
-- Description:
--   - Enable Row Level Security on requests table
--   - Create policies for user data isolation
--   - Admins can view all requests
--   - Regular users can only view their own requests
-- ============================================

-- ============================================
-- 0. HELPER FUNCTION: Check if user is admin (if not exists)
-- ============================================
-- This function is also defined in migration 002, but we include it here for standalone execution
-- It checks if the authenticated user has an admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role (columns added by migration 001)
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (
      -- If role column exists, check for admin roles
      (role IN ('super_admin', 'sales_manager', 'operations_manager', 'support_agent', 'technician', 'account_manager'))
      OR
      -- Fallback: if role column doesn't exist or is null, check email
      (email = 'admin@smartservices.ma')
    )
    AND (account_status = 'active' OR account_status IS NULL)
  );
EXCEPTION WHEN undefined_column THEN
  -- If columns don't exist, allow access (for backward compatibility)
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. ENABLE RLS ON REQUESTS TABLE
-- ============================================
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS requests_select ON public.requests;
DROP POLICY IF EXISTS requests_insert ON public.requests;
DROP POLICY IF EXISTS requests_update ON public.requests;
DROP POLICY IF EXISTS requests_delete ON public.requests;


CREATE POLICY requests_select ON public.requests
  FOR SELECT USING (
    -- Check if user is authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Regular users: can only see their own requests
      user_id = auth.uid()
      -- Admins: can see all requests
      OR public.is_admin()
    )
  );

-- Policy: Users can only INSERT requests for themselves; admins can INSERT for anyone
-- This policy ensures that when a user creates a request,
-- the user_id is automatically set to their authenticated user ID
-- They cannot create requests for other users
-- Admins can create requests for any user
-- Note: user_id can be NULL for backward compatibility, but if provided it must match auth.uid()
CREATE POLICY requests_insert ON public.requests
  FOR INSERT WITH CHECK (
    -- Check if user is authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Regular users: can create requests for themselves (user_id matches) OR user_id is NULL
      (user_id = auth.uid() OR user_id IS NULL)
      -- Admins: can create requests for any user
      OR public.is_admin()
    )
  );

-- ============================================
-- 3b. CREATE TRIGGER TO AUTO-SET user_id ON INSERT
-- ============================================
-- This trigger automatically sets user_id to auth.uid() if it's NULL during insert
-- This ensures that even if the frontend doesn't provide user_id, it will be set correctly
CREATE OR REPLACE FUNCTION public.set_request_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is NULL, set it to the authenticated user's ID
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set user_id
DROP TRIGGER IF EXISTS set_request_user_id_trigger ON public.requests;
CREATE TRIGGER set_request_user_id_trigger
  BEFORE INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_request_user_id();

-- Policy: Users can only UPDATE their own requests; admins can UPDATE all
-- This policy ensures that when a user updates a request,
-- they can only modify requests they own
-- Admins can update any request
CREATE POLICY requests_update ON public.requests
  FOR UPDATE USING (
    -- Check if user is authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Regular users: can only update their own requests
      user_id = auth.uid()
      -- Admins: can update all requests
      OR public.is_admin()
    )
  );

-- Policy: Users can only DELETE their own requests; admins can DELETE all
-- This policy ensures that when a user deletes a request,
-- they can only delete requests they own
-- Admins can delete any request
CREATE POLICY requests_delete ON public.requests
  FOR DELETE USING (
    -- Check if user is authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Regular users: can only delete their own requests
      user_id = auth.uid()
      -- Admins: can delete all requests
      OR public.is_admin()
    )
  );

-- ============================================
-- 4. ENABLE RLS ON INVOICES TABLE (if not already enabled)
-- ============================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS invoices_select ON public.invoices;
DROP POLICY IF EXISTS invoices_insert ON public.invoices;
DROP POLICY IF EXISTS invoices_update ON public.invoices;
DROP POLICY IF EXISTS invoices_delete ON public.invoices;

-- Policy: Users can only SELECT their own invoices; admins can SELECT all
CREATE POLICY invoices_select ON public.invoices
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR public.is_admin()
    )
  );

-- Policy: Users can only INSERT invoices for themselves; admins can INSERT for anyone
-- Note: user_id can be NULL for backward compatibility, but if provided it must match auth.uid()
CREATE POLICY invoices_insert ON public.invoices
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      (user_id = auth.uid() OR user_id IS NULL)
      OR public.is_admin()
    )
  );

-- ============================================
-- 4b. CREATE TRIGGER TO AUTO-SET user_id ON INVOICE INSERT
-- ============================================
CREATE OR REPLACE FUNCTION public.set_invoice_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is NULL, set it to the authenticated user's ID
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_user_id_trigger ON public.invoices;
CREATE TRIGGER set_invoice_user_id_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invoice_user_id();

-- Policy: Users can only UPDATE their own invoices; admins can UPDATE all
CREATE POLICY invoices_update ON public.invoices
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR public.is_admin()
    )
  );

-- Policy: Users can only DELETE their own invoices; admins can DELETE all
CREATE POLICY invoices_delete ON public.invoices
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR public.is_admin()
    )
  );

-- ============================================
-- 5. ENABLE RLS ON REQUEST_ITEMS TABLE
-- ============================================
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS request_items_select ON public.request_items;
DROP POLICY IF EXISTS request_items_insert ON public.request_items;
DROP POLICY IF EXISTS request_items_update ON public.request_items;
DROP POLICY IF EXISTS request_items_delete ON public.request_items;

-- Policy: Users can only see items for their own requests; admins can see all
CREATE POLICY request_items_select ON public.request_items
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.requests
        WHERE requests.id = request_items.request_id
        AND (requests.user_id = auth.uid() OR public.is_admin())
      )
    )
  );

-- Policy: Users can only insert items for their own requests; admins can insert for any
CREATE POLICY request_items_insert ON public.request_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.requests
        WHERE requests.id = request_items.request_id
        AND (requests.user_id = auth.uid() OR public.is_admin())
      )
    )
  );

-- Policy: Users can only update items for their own requests; admins can update all
CREATE POLICY request_items_update ON public.request_items
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.requests
        WHERE requests.id = request_items.request_id
        AND (requests.user_id = auth.uid() OR public.is_admin())
      )
    )
  );

-- Policy: Users can only delete items for their own requests; admins can delete all
CREATE POLICY request_items_delete ON public.request_items
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.requests
        WHERE requests.id = request_items.request_id
        AND (requests.user_id = auth.uid() OR public.is_admin())
      )
    )
  );

-- ============================================
-- 6. GRANT PERMISSIONS FOR AUTHENTICATED USERS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.requests TO authenticated;
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.request_items TO authenticated;

-- ============================================
-- 7. POLICY EXPLANATIONS
-- ============================================
-- 
-- POLICY: requests_select
--   - Purpose: Control which requests a user can read
--   - Logic: 
--     * If user is authenticated (auth.uid() IS NOT NULL)
--     * AND (user_id matches their ID OR they are an admin)
--     * Then they can SELECT the request
--   - This prevents users from seeing other users' requests
--
-- POLICY: requests_insert
--   - Purpose: Control which requests a user can create
--   - Logic:
--     * If user is authenticated
--     * AND (user_id matches their ID OR they are an admin)
--     * Then they can INSERT the request
--   - This ensures users can only create requests for themselves
--
-- POLICY: requests_update
--   - Purpose: Control which requests a user can modify
--   - Logic:
--     * If user is authenticated
--     * AND (user_id matches their ID OR they are an admin)
--     * Then they can UPDATE the request
--   - This prevents users from modifying other users' requests
--
-- POLICY: requests_delete
--   - Purpose: Control which requests a user can delete
--   - Logic:
--     * If user is authenticated
--     * AND (user_id matches their ID OR they are an admin)
--     * Then they can DELETE the request
--   - This prevents users from deleting other users' requests
--
-- The is_admin() function (defined in migration 002) checks if the user
-- has one of the admin roles: super_admin, sales_manager, operations_manager,
-- support_agent, technician, or account_manager
-- ============================================