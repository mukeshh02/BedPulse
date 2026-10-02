-- ==============================================================================
-- BedPulse™ Hospital Inpatient & Ward Care OS — Database Schema
-- Developed by WebVission | Support: +91 7000371321
-- Target Database: Supabase (PostgreSQL 15+)
-- 100% Safe & Idempotent (Can be run multiple times without errors)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WARDS TABLE
CREATE TABLE IF NOT EXISTS public.wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    floor VARCHAR(50),
    color_accent VARCHAR(20) DEFAULT '#1D77FF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BEDS TABLE
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_number VARCHAR(50) NOT NULL,
    ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
    room_type VARCHAR(50) DEFAULT 'Standard',
    daily_rate NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'cleaning', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_bed_per_ward UNIQUE (ward_id, bed_number)
);

-- 3. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uhid VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    mobile VARCHAR(20) NOT NULL,
    guardian_name VARCHAR(150),
    guardian_mobile VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADMISSIONS TABLE (Step 1 & Step 2)
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES public.beds(id),
    ward_id UUID NOT NULL REFERENCES public.wards(id),
    admitting_doctor VARCHAR(150) NOT NULL,
    provisional_diagnosis TEXT NOT NULL,
    admission_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'admitted' CHECK (status IN ('admitted', 'shifted', 'discharged', 'referred', 'lama')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BED TRANSFERS TABLE (Step 3: Bed Shift in Ward)
CREATE TABLE IF NOT EXISTS public.bed_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    from_bed_id UUID NOT NULL REFERENCES public.beds(id),
    to_bed_id UUID NOT NULL REFERENCES public.beds(id),
    reason TEXT NOT NULL,
    transferred_by VARCHAR(150) DEFAULT 'Duty Staff',
    transfer_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DISCHARGES & REFERRALS TABLE (Step 4)
CREATE TABLE IF NOT EXISTS public.discharges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    discharge_type VARCHAR(30) NOT NULL CHECK (discharge_type IN ('normal', 'referred', 'lama')),
    destination_hospital VARCHAR(200),
    discharge_summary TEXT NOT NULL,
    doctor_advice TEXT,
    follow_up_date DATE,
    discharged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to prevent "policy already exists" error
DROP POLICY IF EXISTS "Allow public all access on wards" ON public.wards;
DROP POLICY IF EXISTS "Allow public all access on beds" ON public.beds;
DROP POLICY IF EXISTS "Allow public all access on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public all access on admissions" ON public.admissions;
DROP POLICY IF EXISTS "Allow public all access on bed_transfers" ON public.bed_transfers;
DROP POLICY IF EXISTS "Allow public all access on discharges" ON public.discharges;

-- Create fresh open policies
CREATE POLICY "Allow public all access on wards" ON public.wards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on beds" ON public.beds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on admissions" ON public.admissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on bed_transfers" ON public.bed_transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on discharges" ON public.discharges FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publication safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'beds'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admissions;
    END IF;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA (Your exact 6 Wards & 33 Beds)
-- Safe INSERT with ON CONFLICT DO NOTHING
-- ==============================================================================

-- 1. SEED 6 WARDS
INSERT INTO public.wards (name, code, description, floor, color_accent) VALUES
('Intensive Care Unit', 'ICU', 'Critical care with ventilator support', 'Ground Floor', '#F43F5E'),
('Female General Ward', 'FGW', 'Inpatient care for female patients', '1st Floor', '#EC4899'),
('Male General Ward', 'MGW', 'Inpatient care for male patients', '1st Floor', '#3B82F6'),
('Private Rooms', 'PVT', 'Single-occupancy private recovery suites', '2nd Floor', '#8B5CF6'),
('Deluxe Rooms', 'DLX', 'Luxury inpatient suites with attendant lounge', '2nd Floor', '#F59E0B'),
('Pre-Operative Care', 'PRE', 'Pre-surgical preparation and observation', 'Ground Floor OT Wing', '#06B6D4')
ON CONFLICT (code) DO NOTHING;

-- 2. SEED ICU (5 BEDS)
INSERT INTO public.beds (ward_id, bed_number, room_type, daily_rate, status)
SELECT id, bed_num, r_type, rate, stat FROM public.wards,
(VALUES
  ('ICU-01', 'ICU Ventilator', 4500.00, 'occupied'),
  ('ICU-02', 'ICU Ventilator', 4500.00, 'vacant'),
  ('ICU-03', 'ICU Monitor', 4000.00, 'occupied'),
  ('ICU-04', 'ICU Monitor', 4000.00, 'vacant'),
  ('ICU-05', 'ICU Stepdown', 3500.00, 'cleaning')
) AS b(bed_num, r_type, rate, stat)
WHERE code = 'ICU'
ON CONFLICT (ward_id, bed_number) DO NOTHING;

-- 3. SEED FGW (13 BEDS)
INSERT INTO public.beds (ward_id, bed_number, room_type, daily_rate, status)
SELECT id, bed_num, 'General Bed', 1200.00, stat FROM public.wards,
(VALUES
  ('FGW-01', 'occupied'),
  ('FGW-02', 'occupied'),
  ('FGW-03', 'vacant'),
  ('FGW-04', 'vacant'),
  ('FGW-05', 'vacant'),
  ('FGW-06', 'occupied'),
  ('FGW-07', 'vacant'),
  ('FGW-08', 'vacant'),
  ('FGW-09', 'vacant'),
  ('FGW-10', 'vacant'),
  ('FGW-11', 'vacant'),
  ('FGW-12', 'vacant'),
  ('FGW-13', 'vacant')
) AS b(bed_num, stat)
WHERE code = 'FGW'
ON CONFLICT (ward_id, bed_number) DO NOTHING;

-- 4. SEED MGW (6 BEDS)
INSERT INTO public.beds (ward_id, bed_number, room_type, daily_rate, status)
SELECT id, bed_num, 'General Bed', 1200.00, stat FROM public.wards,
(VALUES
  ('MGW-01', 'occupied'),
  ('MGW-02', 'vacant'),
  ('MGW-03', 'vacant'),
  ('MGW-04', 'occupied'),
  ('MGW-05', 'vacant'),
  ('MGW-06', 'cleaning')
) AS b(bed_num, stat)
WHERE code = 'MGW'
ON CONFLICT (ward_id, bed_number) DO NOTHING;

-- 5. SEED PRIVATE (3 ROOMS)
INSERT INTO public.beds (ward_id, bed_number, room_type, daily_rate, status)
SELECT id, bed_num, 'Private Single Room', 2800.00, stat FROM public.wards,
(VALUES
  ('PVT-01', 'vacant'),
  ('PVT-02', 'occupied'),
  ('PVT-03', 'vacant')
) AS b(bed_num, stat)
WHERE code = 'PVT'
ON CONFLICT (ward_id, bed_number) DO NOTHING;

-- 6. SEED DELUXE (4 ROOMS)
INSERT INTO public.beds (ward_id, bed_number, room_type, daily_rate, status)
SELECT id, bed_num, 'Deluxe Suite', 4500.00, stat FROM public.wards,
(VALUES
  ('DLX-01', 'occupied'),
  ('DLX-02', 'vacant'),
  ('DLX-03', 'vacant'),
  ('DLX-04', 'vacant')
) AS b(bed_num, stat)
WHERE code = 'DLX'
ON CONFLICT (ward_id, bed_number) DO NOTHING;

-- 7. SEED PRE-OP (2 BEDS)
INSERT INTO public.beds (ward_id, bed_number, room_type, daily_rate, status)
SELECT id, bed_num, 'Pre-Op Holding Bed', 1500.00, stat FROM public.wards,
(VALUES
  ('PRE-01', 'vacant'),
  ('PRE-02', 'vacant')
) AS b(bed_num, stat)
WHERE code = 'PRE'
ON CONFLICT (ward_id, bed_number) DO NOTHING;

-- 8. SEED DEMO PATIENTS
INSERT INTO public.patients (uhid, full_name, age, gender, mobile, guardian_name, guardian_mobile, address) VALUES
('UHID-8921', 'Rameshwar Sharma', 58, 'male', '9827011223', 'Sunil Sharma (Son)', '9827099887', 'Sector 4, Main Road, City'),
('UHID-8922', 'Sunita Devi Patel', 44, 'female', '9425033445', 'Rajesh Patel (Husband)', '9425011223', 'Near Old Bus Stand'),
('UHID-8923', 'Amitabh Sengupta', 62, 'male', '9893044556', 'Priya Sengupta (Wife)', '9893011223', 'Green Park Colony')
ON CONFLICT (uhid) DO NOTHING;

-- 9. SEED DEMO ADMISSIONS
INSERT INTO public.admissions (admission_number, patient_id, bed_id, ward_id, admitting_doctor, provisional_diagnosis, status, notes)
SELECT
    'IPD-2025-0101',
    p.id,
    b.id,
    w.id,
    'Dr. Sharma (Cardio)',
    'Acute Coronary Syndrome / Observation',
    'admitted',
    'Continuous cardiac monitor & O2 support.'
FROM public.patients p, public.beds b, public.wards w
WHERE p.uhid = 'UHID-8921' AND b.bed_number = 'ICU-01' AND w.code = 'ICU'
ON CONFLICT (admission_number) DO NOTHING;

INSERT INTO public.admissions (admission_number, patient_id, bed_id, ward_id, admitting_doctor, provisional_diagnosis, status, notes)
SELECT
    'IPD-2025-0102',
    p.id,
    b.id,
    w.id,
    'Dr. Verma (Medicine)',
    'Severe Dehydration & Viral Pyrexia',
    'admitted',
    'IV fluids 100ml/hr. Daily CBC monitoring.'
FROM public.patients p, public.beds b, public.wards w
WHERE p.uhid = 'UHID-8922' AND b.bed_number = 'FGW-02' AND w.code = 'FGW'
ON CONFLICT (admission_number) DO NOTHING;

INSERT INTO public.admissions (admission_number, patient_id, bed_id, ward_id, admitting_doctor, provisional_diagnosis, status, notes)
SELECT
    'IPD-2025-0103',
    p.id,
    b.id,
    w.id,
    'Dr. Gupta (Surgery)',
    'Post-op Inguinal Hernia Repair Care',
    'admitted',
    'Dressing dry and intact.'
FROM public.patients p, public.beds b, public.wards w
WHERE p.uhid = 'UHID-8923' AND b.bed_number = 'MGW-01' AND w.code = 'MGW'
ON CONFLICT (admission_number) DO NOTHING;
