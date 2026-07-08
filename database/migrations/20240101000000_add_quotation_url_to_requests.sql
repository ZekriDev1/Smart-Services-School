-- Add quotation_url column to requests table
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS quotation_url TEXT;