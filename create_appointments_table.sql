-- ==========================================================
-- APEX DENTAL CARE - APPOINTMENTS TABLE & RLS POLICIES
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqooiiqmdmnmqrsmtgaf/sql
-- ==========================================================

-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name VARCHAR(150) NOT NULL,
    patient_email VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    service_id TEXT,
    service_name VARCHAR(150),
    doctor_id TEXT,
    doctor_name VARCHAR(150),
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies to avoid duplicates
DROP POLICY IF EXISTS "Allow anonymous appointment insert" ON public.appointments;
DROP POLICY IF EXISTS "Allow public appointment select" ON public.appointments;
DROP POLICY IF EXISTS "Allow public appointment update" ON public.appointments;
DROP POLICY IF EXISTS "Allow public appointment delete" ON public.appointments;

-- 4. INSERT Policy: Allow anyone (anon public or authenticated) to insert appointments
CREATE POLICY "Allow anonymous appointment insert"
    ON public.appointments
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

-- 5. SELECT Policy: Allow reading appointments
CREATE POLICY "Allow public appointment select"
    ON public.appointments
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

-- 6. UPDATE Policy: Allow updating appointment status
CREATE POLICY "Allow public appointment update"
    ON public.appointments
    FOR UPDATE
    TO anon, authenticated, service_role
    USING (true);

-- 7. DELETE Policy: Allow deleting appointments
CREATE POLICY "Allow public appointment delete"
    ON public.appointments
    FOR DELETE
    TO anon, authenticated, service_role
    USING (true);

-- 8. Performance index on date & status
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
