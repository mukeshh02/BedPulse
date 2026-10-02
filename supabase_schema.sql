-- ==============================================================================
-- BedPulse™ Hospital Inpatient & Ward Care OS — Database Schema
-- Developed by WebVission | Support: +91 7000371321
-- Target Database: Supabase (PostgreSQL 15+)
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

-- Allow public read/write for intranet demo & reception desk (adjustable in prod)
CREATE POLICY "Allow public all access on wards" ON public.wards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on beds" ON public.beds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on admissions" ON public.admissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on bed_transfers" ON public.bed_transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on discharges" ON public.discharges FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publication for BedPulse live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admissions;

-- ==============================================================================
-- INITIAL SEED DATA (Your exact 6 Wards & 33 Beds)
-- ==============================================================================

DO $$
DECLARE
    icu_id UUID;
    fgw_id UUID;
    mgw_id UUID;
    pvt_id UUID;
    dlx_id UUID;
    pre_id UUID;
    p1_id UUID;
    p2_id UUID;
    p3_id UUID;
    b_icu1 UUID;
    b_fgw2 UUID;
    b_mgw1 UUID;
BEGIN
    -- Insert 6 Wards
    INSERT INTO public.wards (name, code, description, floor, color_accent)
    VALUES ('Intensive Care Unit', 'ICU', 'Critical care with ventilator support', 'Ground Floor', '#F43F5E')
    RETURNING id INTO icu_id;

    INSERT INTO public.wards (name, code, description, floor, color_accent)
    VALUES ('Female General Ward', 'FGW', 'Inpatient care for female patients', '1st Floor', '#EC4899')
    RETURNING id INTO fgw_id;

    INSERT INTO public.wards (name, code, description, floor, color_accent)
    VALUES ('Male General Ward', 'MGW', 'Inpatient care for male patients', '1st Floor', '#3B82F6')
    RETURNING id INTO mgw_id;

    INSERT INTO public.wards (name, code, description, floor, color_accent)
    VALUES ('Private Rooms', 'PVT', 'Single-occupancy private recovery suites', '2nd Floor', '#8B5CF6')
    RETURNING id INTO pvt_id;

    INSERT INTO public.wards (name, code, description, floor, color_accent)
    VALUES ('Deluxe Rooms', 'DLX', 'Luxury inpatient suites with attendant lounge', '2nd Floor', '#F59E0B')
    RETURNING id INTO dlx_id;

    INSERT INTO public.wards (name, code, description, floor, color_accent)
    VALUES ('Pre-Operative Care', 'PRE', 'Pre-surgical preparation and observation', 'Ground Floor OT Wing', '#06B6D4')
    RETURNING id INTO pre_id;

    -- Insert ICU (5 Beds)
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('ICU-01', icu_id, 'ICU Ventilator', 4500.00, 'occupied') RETURNING id INTO b_icu1;
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('ICU-02', icu_id, 'ICU Ventilator', 4500.00, 'vacant'),
    ('ICU-03', icu_id, 'ICU Monitor', 4000.00, 'occupied'),
    ('ICU-04', icu_id, 'ICU Monitor', 4000.00, 'vacant'),
    ('ICU-05', icu_id, 'ICU Stepdown', 3500.00, 'cleaning');

    -- Insert FGW (13 Beds)
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('FGW-01', fgw_id, 'General Bed', 1200.00, 'occupied'),
    ('FGW-02', fgw_id, 'General Bed', 1200.00, 'occupied') RETURNING id INTO b_fgw2;
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('FGW-03', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-04', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-05', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-06', fgw_id, 'General Bed', 1200.00, 'occupied'),
    ('FGW-07', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-08', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-09', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-10', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-11', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-12', fgw_id, 'General Bed', 1200.00, 'vacant'),
    ('FGW-13', fgw_id, 'General Bed', 1200.00, 'vacant');

    -- Insert MGW (6 Beds)
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('MGW-01', mgw_id, 'General Bed', 1200.00, 'occupied') RETURNING id INTO b_mgw1;
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('MGW-02', mgw_id, 'General Bed', 1200.00, 'vacant'),
    ('MGW-03', mgw_id, 'General Bed', 1200.00, 'vacant'),
    ('MGW-04', mgw_id, 'General Bed', 1200.00, 'occupied'),
    ('MGW-05', mgw_id, 'General Bed', 1200.00, 'vacant'),
    ('MGW-06', mgw_id, 'General Bed', 1200.00, 'cleaning');

    -- Insert Private (3 Rooms)
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('PVT-01', pvt_id, 'Private Single Room', 2800.00, 'vacant'),
    ('PVT-02', pvt_id, 'Private Single Room', 2800.00, 'occupied'),
    ('PVT-03', pvt_id, 'Private Single Room', 2800.00, 'vacant');

    -- Insert Deluxe (4 Rooms)
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('DLX-01', dlx_id, 'Deluxe Suite', 4500.00, 'occupied'),
    ('DLX-02', dlx_id, 'Deluxe Suite', 4500.00, 'vacant'),
    ('DLX-03', dlx_id, 'Deluxe Suite', 4500.00, 'vacant'),
    ('DLX-04', dlx_id, 'Deluxe Suite', 4500.00, 'vacant');

    -- Insert Pre-Op (2 Beds)
    INSERT INTO public.beds (bed_number, ward_id, room_type, daily_rate, status) VALUES
    ('PRE-01', pre_id, 'Pre-Op Holding Bed', 1500.00, 'vacant'),
    ('PRE-02', pre_id, 'Pre-Op Holding Bed', 1500.00, 'vacant');

    -- Insert Demo Patients
    INSERT INTO public.patients (uhid, full_name, age, gender, mobile, guardian_name, guardian_mobile)
    VALUES ('UHID-8921', 'Rameshwar Sharma', 58, 'male', '9827011223', 'Sunil Sharma', '9827099887')
    RETURNING id INTO p1_id;

    INSERT INTO public.patients (uhid, full_name, age, gender, mobile, guardian_name, guardian_mobile)
    VALUES ('UHID-8922', 'Sunita Devi Patel', 44, 'female', '9425033445', 'Rajesh Patel', '9425011223')
    RETURNING id INTO p2_id;

    INSERT INTO public.patients (uhid, full_name, age, gender, mobile, guardian_name, guardian_mobile)
    VALUES ('UHID-8923', 'Amitabh Sengupta', 62, 'male', '9893044556', 'Priya Sengupta', '9893011223')
    RETURNING id INTO p3_id;

    -- Insert Demo Admissions
    INSERT INTO public.admissions (admission_number, patient_id, bed_id, ward_id, admitting_doctor, provisional_diagnosis, status)
    VALUES ('IPD-2025-0101', p1_id, b_icu1, icu_id, 'Dr. Sharma (Cardio)', 'Acute Coronary Syndrome / Chest Pain', 'admitted');

    INSERT INTO public.admissions (admission_number, patient_id, bed_id, ward_id, admitting_doctor, provisional_diagnosis, status)
    VALUES ('IPD-2025-0102', p2_id, b_fgw2, fgw_id, 'Dr. Verma (Medicine)', 'Severe Dehydration & Viral Pyrexia', 'admitted');

    INSERT INTO public.admissions (admission_number, patient_id, bed_id, ward_id, admitting_doctor, provisional_diagnosis, status)
    VALUES ('IPD-2025-0103', p3_id, b_mgw1, mgw_id, 'Dr. Gupta (Surgery)', 'Post-op Hernia Repair Care', 'admitted');
END $$;
