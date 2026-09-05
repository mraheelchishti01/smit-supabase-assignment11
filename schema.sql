-- ==========================================================
-- APEX DENTAL CARE & IMPLANT CLINIC - DATABASE SCHEMA
-- PostgreSQL / Supabase Compatible
-- ==========================================================

-- Enable pgcrypto / uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services Table
CREATE TABLE IF NOT EXISTS dental_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT DEFAULT 30,
    price_range VARCHAR(50),
    icon_name VARCHAR(50),
    category VARCHAR(50) DEFAULT 'General',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Doctors / Dentists Table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    qualifications VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 5,
    bio TEXT,
    available_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shift_start TIME DEFAULT '09:00',
    shift_end TIME DEFAULT '18:00',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name VARCHAR(150) NOT NULL,
    patient_email VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(25) NOT NULL,
    service_id UUID REFERENCES dental_services(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR HIGH PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_resolved ON inquiries(is_resolved);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE dental_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public can view active services" ON dental_services;
DROP POLICY IF EXISTS "Public can view active doctors" ON doctors;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Allow select appointments" ON appointments;
DROP POLICY IF EXISTS "Allow update appointments" ON appointments;
DROP POLICY IF EXISTS "Allow delete appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow select inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow update inquiries" ON inquiries;

-- Dental Services: Public can read active services
CREATE POLICY "Public can view active services" 
    ON dental_services FOR SELECT 
    USING (is_active = TRUE);

-- Doctors: Public can view active doctors
CREATE POLICY "Public can view active doctors" 
    ON doctors FOR SELECT 
    USING (is_active = TRUE);

-- Appointments: Public can book and view appointments
CREATE POLICY "Public can create appointments" 
    ON appointments FOR INSERT 
    WITH CHECK (TRUE);

CREATE POLICY "Allow select appointments" 
    ON appointments FOR SELECT 
    USING (TRUE);

CREATE POLICY "Allow update appointments" 
    ON appointments FOR UPDATE 
    USING (TRUE);

CREATE POLICY "Allow delete appointments" 
    ON appointments FOR DELETE 
    USING (TRUE);

-- Inquiries: Public can create and manage inquiries
CREATE POLICY "Public can create inquiries" 
    ON inquiries FOR INSERT 
    WITH CHECK (TRUE);

CREATE POLICY "Allow select inquiries" 
    ON inquiries FOR SELECT 
    USING (TRUE);

CREATE POLICY "Allow update inquiries" 
    ON inquiries FOR UPDATE 
    USING (TRUE);

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Seed Dental Services
INSERT INTO dental_services (id, name, slug, description, duration_minutes, price_range, icon_name, category)
VALUES 
('11111111-1111-1111-1111-111111111101', 'Teeth Whitening', 'teeth-whitening', 'Professional laser teeth whitening brightening your smile up to 8 shades in a single comfortable 45-minute session.', 45, '$150 - $250', 'bi-stars', 'Cosmetic'),
('11111111-1111-1111-1111-111111111102', 'Dental Implants', 'dental-implants', 'Permanent titanium tooth replacements designed to look, feel, and function just like your natural teeth with lifelong durability.', 90, '$800 - $1,500', 'bi-shield-check', 'Restorative'),
('11111111-1111-1111-1111-111111111103', 'Root Canal Therapy', 'root-canal', 'Gentle, pain-free endodontic procedure to eliminate deep infection, alleviate toothache, and preserve your natural tooth.', 60, '$300 - $600', 'bi-heart-pulse', 'Endodontics'),
('11111111-1111-1111-1111-111111111104', 'Orthodontics & Clear Aligners', 'orthodontics', 'Discreet clear aligners and traditional braces to straighten misaligned teeth, fix bite issues, and build an immaculate smile.', 45, '$1,200 - $2,800', 'bi-grid-1x2', 'Orthodontics'),
('11111111-1111-1111-1111-111111111105', 'Deep Scaling & Polishing', 'scaling-polishing', 'Comprehensive ultrasonic plaque and calculus removal followed by fluoride polishing to prevent gum disease and freshen breath.', 30, '$80 - $130', 'bi-gem', 'Preventive'),
('11111111-1111-1111-1111-111111111106', 'Porcelain Veneers', 'porcelain-veneers', 'Ultra-thin, custom-crafted ceramic shells bonded to the front of teeth to correct discoloration, chips, gaps, or asymmetry.', 60, '$450 - $900', 'bi-emoji-smile', 'Cosmetic'),
('11111111-1111-1111-1111-111111111107', 'Pediatric Dentistry', 'pediatric-dentistry', 'Specialized, warm, and gentle dental checkups, sealants, and cavity treatments customized specifically for young children.', 30, '$70 - $120', 'bi-balloon', 'Pediatric'),
('11111111-1111-1111-1111-111111111108', 'Emergency Dental Care', 'emergency-dental', 'Same-day urgent response for severe tooth pain, knocked-out teeth, broken restorations, or oral bleeding.', 45, '$120 - $350', 'bi-hospital', 'Emergency')
ON CONFLICT (slug) DO NOTHING;

-- Seed Doctors
INSERT INTO doctors (id, full_name, specialization, qualifications, experience_years, bio, available_days, shift_start, shift_end, image_url)
VALUES 
('22222222-2222-2222-2222-222222222201', 'Dr. Sarah Jenkins, DDS', 'Implantologist & Chief Surgeon', 'DDS, MS (Harvard School of Dental Medicine)', 14, 'Recognized specialist in guided surgical implant placement and bone grafting with over 4,000 successful smile rehabilitations.', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '09:00', '17:00', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'),
('22222222-2222-2222-2222-222222222202', 'Dr. Marcus Vance, DMD', 'Orthodontist & Aesthetic Specialist', 'DMD, Cert. Ortho (Columbia University)', 11, 'Elite provider of Invisalign clear aligners and modern aesthetic smile makeovers combining function with natural beauty.', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'], '10:00', '18:30', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'),
('22222222-2222-2222-2222-222222222203', 'Dr. Elena Rostova, BDS', 'Endodontist & Root Canal Specialist', 'BDS, MDS (Endodontics, King''s College London)', 9, 'Pioneering micro-endodontic therapy using dental microscopes for virtually pain-free single-visit root canal treatments.', ARRAY['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], '09:30', '17:30', 'https://images.unsplash.com/photo-1594824813515-59b433e5c01b?auto=format&fit=crop&q=80&w=400'),
('22222222-2222-2222-2222-222222222204', 'Dr. Keith Larson, DDS', 'Pediatric & Preventive Dentist', 'DDS, Fellowship in Pediatric Dentistry', 8, 'Dedicated to creating fun, stress-free dental visits for kids while establishing lifelong healthy oral hygiene habits.', ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday'], '09:00', '16:00', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Sample Appointments
INSERT INTO appointments (id, patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time, notes, status)
VALUES 
('33333333-3333-3333-3333-333333333301', 'Emily Watson', 'emily.watson@example.com', '+1 (555) 234-5678', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'First-time laser whitening before upcoming wedding.', 'Pending'),
('33333333-3333-3333-3333-333333333302', 'David Miller', 'david.m@example.com', '+1 (555) 345-6789', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'Consultation for lower molar titanium implant.', 'Confirmed'),
('33333333-3333-3333-3333-333333333303', 'Sophia Rodriguez', 'sophia.r@example.com', '+1 (555) 456-7890', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', CURRENT_DATE - INTERVAL '1 day', '11:30:00', 'Routine 6-month routine scaling and checkup.', 'Completed'),
('33333333-3333-3333-3333-333333333304', 'Alexander Hayes', 'alex.hayes@example.com', '+1 (555) 789-0123', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', CURRENT_DATE + INTERVAL '3 days', '15:30:00', 'Mild discomfort in upper left premolar.', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Inquiries
INSERT INTO inquiries (id, full_name, email, phone, subject, message, is_resolved)
VALUES
('44444444-4444-4444-4444-444444444401', 'Jonathan Reed', 'jreed@example.com', '+1 (555) 123-9999', 'Invisalign Pricing Query', 'Hello, do you offer monthly payment installments for full clear aligner treatments?', FALSE),
('44444444-4444-4444-4444-444444444402', 'Clara Henderson', 'clara.h@example.com', '+1 (555) 888-1122', 'Insurance Coverage Question', 'Hi! Does Apex Dental accept Delta Dental PPO insurance plans for root canals?', TRUE)
ON CONFLICT (id) DO NOTHING;
