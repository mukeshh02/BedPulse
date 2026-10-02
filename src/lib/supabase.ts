import { createClient } from '@supabase/supabase-js';
import { initialWards, initialBeds, initialPatients, initialAdmissions } from './mockData';
import { Ward, Bed, Patient, Admission, BedTransfer, DischargeRecord } from '@/types';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://xbojviesfepycpomnncj.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_22DU98_EynLFveOUW8B50g_c_2b-LIB';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ============================================================================
// BedPulse Hybrid Data Repository (Supabase + Smart LocalStorage Fallback)
// ============================================================================

const STORAGE_KEYS = {
  WARDS: 'bedpulse_wards_fresh_v2',
  BEDS: 'bedpulse_beds_fresh_v2',
  PATIENTS: 'bedpulse_patients_fresh_v2',
  ADMISSIONS: 'bedpulse_admissions_fresh_v2',
  TRANSFERS: 'bedpulse_transfers_fresh_v2',
  DISCHARGES: 'bedpulse_discharges_fresh_v2',
};

// Helper for localStorage
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error('LocalStorage read error:', err);
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

export const DataService = {
  // --- WARDS ---
  async getWards(): Promise<Ward[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('wards').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal<Ward[]>(STORAGE_KEYS.WARDS, initialWards);
  },

  async addWard(ward: Omit<Ward, 'id'>): Promise<Ward> {
    const newWard: Ward = {
      ...ward,
      id: 'w-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('wards').insert([ward]).select().single();
      if (!error && data) return data;
    }
    const wards = await this.getWards();
    const updated = [...wards, newWard];
    setLocal(STORAGE_KEYS.WARDS, updated);
    return newWard;
  },

  // --- BEDS ---
  async getBeds(): Promise<Bed[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('beds').select('*, ward:wards(*)').order('bed_number');
      if (!error && data && data.length > 0) return data;
    }
    return getLocal<Bed[]>(STORAGE_KEYS.BEDS, initialBeds);
  },

  async addBed(bed: Omit<Bed, 'id'>): Promise<Bed> {
    const newBed: Bed = {
      ...bed,
      id: 'b-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('beds').insert([bed]).select().single();
      if (!error && data) return data;
    }
    const beds = await this.getBeds();
    const updated = [...beds, newBed];
    setLocal(STORAGE_KEYS.BEDS, updated);
    return newBed;
  },

  async updateBedStatus(bedId: string, status: Bed['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('beds').update({ status, updated_at: new Date().toISOString() }).eq('id', bedId);
    }
    const beds = await this.getBeds();
    const updated = beds.map((b) => (b.id === bedId ? { ...b, status } : b));
    setLocal(STORAGE_KEYS.BEDS, updated);
  },

  async markBedClean(bedId: string): Promise<void> {
    await this.updateBedStatus(bedId, 'vacant');
  },

  // --- PATIENTS ---
  async getPatients(): Promise<Patient[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<Patient[]>(STORAGE_KEYS.PATIENTS, initialPatients);
  },

  // --- STEP 1 & 2: ADMISSION ---
  async admitPatient(data: {
    patient: Omit<Patient, 'id' | 'uhid'>;
    bedId: string;
    wardId: string;
    admittingDoctor: string;
    provisionalDiagnosis: string;
    notes?: string;
  }): Promise<{ patient: Patient; admission: Admission }> {
    const generatedUhid = 'UHID-' + Math.floor(1000 + Math.random() * 9000);
    const generatedAdmNo = 'IPD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    let savedPatient: Patient;
    let savedAdmission: Admission;

    if (isSupabaseConfigured && supabase) {
      // 1. Insert patient into Supabase (let Postgres generate UUID)
      const patientPayload = {
        uhid: generatedUhid,
        full_name: data.patient.full_name,
        age: data.patient.age,
        gender: data.patient.gender,
        mobile: data.patient.mobile,
        guardian_name: data.patient.guardian_name || null,
        guardian_mobile: data.patient.guardian_mobile || null,
        address: data.patient.address || null,
      };

      const { data: pData, error: pError } = await supabase
        .from('patients')
        .insert([patientPayload])
        .select()
        .single();

      if (pError || !pData) {
        console.error('Supabase patient insert error:', pError);
        throw new Error(pError?.message || 'Failed to save patient to database.');
      }

      savedPatient = pData as Patient;

      // 2. Insert admission into Supabase
      const admissionPayload = {
        admission_number: generatedAdmNo,
        patient_id: savedPatient.id,
        bed_id: data.bedId,
        ward_id: data.wardId,
        admitting_doctor: data.admittingDoctor,
        provisional_diagnosis: data.provisionalDiagnosis,
        admission_date: new Date().toISOString(),
        status: 'admitted',
        notes: data.notes || '',
      };

      const { data: aData, error: aError } = await supabase
        .from('admissions')
        .insert([admissionPayload])
        .select('*, patient:patients(*), bed:beds(*), ward:wards(*)')
        .single();

      if (aError || !aData) {
        console.error('Supabase admission insert error:', aError);
        throw new Error(aError?.message || 'Failed to save admission to database.');
      }

      savedAdmission = aData as Admission;

      // 3. Mark bed as occupied in Supabase
      await supabase
        .from('beds')
        .update({ status: 'occupied', updated_at: new Date().toISOString() })
        .eq('id', data.bedId);
    } else {
      // LocalStorage fallback
      savedPatient = {
        ...data.patient,
        id: 'p-' + Date.now(),
        uhid: generatedUhid,
        created_at: new Date().toISOString(),
      };
      savedAdmission = {
        id: 'adm-' + Date.now(),
        admission_number: generatedAdmNo,
        patient_id: savedPatient.id,
        patient: savedPatient,
        bed_id: data.bedId,
        ward_id: data.wardId,
        admitting_doctor: data.admittingDoctor,
        provisional_diagnosis: data.provisionalDiagnosis,
        admission_date: new Date().toISOString(),
        status: 'admitted',
        notes: data.notes,
        created_at: new Date().toISOString(),
      };
    }

    // Update local caches
    const patients = getLocal<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    setLocal(STORAGE_KEYS.PATIENTS, [savedPatient, ...patients.filter((p) => p.id !== savedPatient.id)]);

    const admissions = getLocal<Admission[]>(STORAGE_KEYS.ADMISSIONS, []);
    setLocal(STORAGE_KEYS.ADMISSIONS, [savedAdmission, ...admissions.filter((a) => a.id !== savedAdmission.id)]);

    const beds = await this.getBeds();
    const updatedBeds = beds.map((b) => (b.id === data.bedId ? { ...b, status: 'occupied' as const } : b));
    setLocal(STORAGE_KEYS.BEDS, updatedBeds);

    return { patient: savedPatient, admission: savedAdmission };
  },

  // --- STEP 3: SHIFT BED ---
  async shiftBed(data: {
    admissionId: string;
    fromBedId: string;
    toBedId: string;
    reason: string;
    transferredBy: string;
  }): Promise<BedTransfer> {
    let savedTransfer: BedTransfer;

    if (isSupabaseConfigured && supabase) {
      const transferPayload = {
        admission_id: data.admissionId,
        from_bed_id: data.fromBedId,
        to_bed_id: data.toBedId,
        reason: data.reason,
        transferred_by: data.transferredBy || 'Duty Staff',
        transfer_date: new Date().toISOString(),
      };

      const { data: tData, error: tErr } = await supabase
        .from('bed_transfers')
        .insert([transferPayload])
        .select()
        .single();

      if (tErr || !tData) {
        console.error('Supabase bed transfer error:', tErr);
        throw new Error(tErr?.message || 'Failed to record bed transfer.');
      }

      savedTransfer = tData as BedTransfer;

      // Update admission with new bed
      await supabase
        .from('admissions')
        .update({ bed_id: data.toBedId, updated_at: new Date().toISOString() })
        .eq('id', data.admissionId);

      // Old bed -> cleaning, new bed -> occupied
      await supabase
        .from('beds')
        .update({ status: 'cleaning', updated_at: new Date().toISOString() })
        .eq('id', data.fromBedId);
      await supabase
        .from('beds')
        .update({ status: 'occupied', updated_at: new Date().toISOString() })
        .eq('id', data.toBedId);
    } else {
      savedTransfer = {
        id: 'trf-' + Date.now(),
        admission_id: data.admissionId,
        from_bed_id: data.fromBedId,
        to_bed_id: data.toBedId,
        reason: data.reason,
        transferred_by: data.transferredBy || 'Duty Staff',
        transfer_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }

    // Update local cache
    const admissions = await this.getAdmissions();
    const updatedAdmissions = admissions.map((adm) =>
      adm.id === data.admissionId ? { ...adm, bed_id: data.toBedId } : adm
    );
    setLocal(STORAGE_KEYS.ADMISSIONS, updatedAdmissions);

    const transfers = getLocal<BedTransfer[]>(STORAGE_KEYS.TRANSFERS, []);
    setLocal(STORAGE_KEYS.TRANSFERS, [savedTransfer, ...transfers]);

    const beds = await this.getBeds();
    const updatedBeds = beds.map((b) => {
      if (b.id === data.fromBedId) return { ...b, status: 'cleaning' as const };
      if (b.id === data.toBedId) return { ...b, status: 'occupied' as const };
      return b;
    });
    setLocal(STORAGE_KEYS.BEDS, updatedBeds);

    return savedTransfer;
  },

  // --- STEP 4: DISCHARGE & REFERRAL ---
  async dischargePatient(data: {
    admissionId: string;
    bedId: string;
    dischargeType: 'normal' | 'referred' | 'lama';
    destinationHospital?: string;
    dischargeSummary: string;
    doctorAdvice?: string;
    followUpDate?: string;
  }): Promise<DischargeRecord> {
    const newStatus =
      data.dischargeType === 'referred' ? 'referred' : data.dischargeType === 'lama' ? 'lama' : 'discharged';
    let savedDischarge: DischargeRecord;

    if (isSupabaseConfigured && supabase) {
      const dischargePayload = {
        admission_id: data.admissionId,
        discharge_type: data.dischargeType,
        destination_hospital: data.destinationHospital || null,
        discharge_summary: data.dischargeSummary,
        doctor_advice: data.doctorAdvice || null,
        follow_up_date: data.followUpDate || null,
        discharged_at: new Date().toISOString(),
      };

      const { data: dData, error: dErr } = await supabase
        .from('discharges')
        .insert([dischargePayload])
        .select()
        .single();

      if (dErr || !dData) {
        console.error('Supabase discharge error:', dErr);
        throw new Error(dErr?.message || 'Failed to record discharge.');
      }

      savedDischarge = dData as DischargeRecord;

      await supabase
        .from('admissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', data.admissionId);

      await supabase
        .from('beds')
        .update({ status: 'cleaning', updated_at: new Date().toISOString() })
        .eq('id', data.bedId);
    } else {
      savedDischarge = {
        id: 'dis-' + Date.now(),
        admission_id: data.admissionId,
        discharge_type: data.dischargeType,
        destination_hospital: data.destinationHospital,
        discharge_summary: data.dischargeSummary,
        doctor_advice: data.doctorAdvice,
        follow_up_date: data.followUpDate,
        discharged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }

    const admissions = await this.getAdmissions();
    const updatedAdmissions = admissions.map((adm) =>
      adm.id === data.admissionId ? { ...adm, status: newStatus as any } : adm
    );
    setLocal(STORAGE_KEYS.ADMISSIONS, updatedAdmissions);

    const discharges = getLocal<DischargeRecord[]>(STORAGE_KEYS.DISCHARGES, []);
    setLocal(STORAGE_KEYS.DISCHARGES, [savedDischarge, ...discharges]);

    const beds = await this.getBeds();
    const updatedBeds = beds.map((b) => (b.id === data.bedId ? { ...b, status: 'cleaning' as const } : b));
    setLocal(STORAGE_KEYS.BEDS, updatedBeds);

    return savedDischarge;
  },

  async getAdmissions(): Promise<Admission[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('admissions')
        .select('*, patient:patients(*), bed:beds(*), ward:wards(*)')
        .order('admission_date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<Admission[]>(STORAGE_KEYS.ADMISSIONS, initialAdmissions);
  },

  // Clear data helper
  clearHospitalData() {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  },
};
