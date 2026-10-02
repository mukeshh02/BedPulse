import { createClient } from '@supabase/supabase-js';
import { initialWards, initialBeds, initialPatients, initialAdmissions } from './mockData';
import { Ward, Bed, Patient, Admission, BedTransfer, DischargeRecord } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

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
  WARDS: 'bedpulse_wards_v1',
  BEDS: 'bedpulse_beds_v1',
  PATIENTS: 'bedpulse_patients_v1',
  ADMISSIONS: 'bedpulse_admissions_v1',
  TRANSFERS: 'bedpulse_transfers_v1',
  DISCHARGES: 'bedpulse_discharges_v1',
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
      if (!error && data && data.length > 0) return data;
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
    const newPatient: Patient = {
      ...data.patient,
      id: 'p-' + Date.now(),
      uhid: 'UHID-' + Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
    };

    const newAdmission: Admission = {
      id: 'adm-' + Date.now(),
      admission_number: 'IPD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      patient_id: newPatient.id,
      patient: newPatient,
      bed_id: data.bedId,
      ward_id: data.wardId,
      admitting_doctor: data.admittingDoctor,
      provisional_diagnosis: data.provisionalDiagnosis,
      admission_date: new Date().toISOString(),
      status: 'admitted',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data: pData } = await supabase.from('patients').insert([newPatient]).select().single();
      if (pData) {
        newAdmission.patient_id = pData.id;
        await supabase.from('admissions').insert([newAdmission]);
        await supabase.from('beds').update({ status: 'occupied' }).eq('id', data.bedId);
      }
    }

    // Update local caches
    const patients = await this.getPatients();
    setLocal(STORAGE_KEYS.PATIENTS, [newPatient, ...patients]);

    const admissions = await this.getAdmissions();
    setLocal(STORAGE_KEYS.ADMISSIONS, [newAdmission, ...admissions]);

    await this.updateBedStatus(data.bedId, 'occupied');

    return { patient: newPatient, admission: newAdmission };
  },

  // --- STEP 3: SHIFT BED ---
  async shiftBed(data: {
    admissionId: string;
    fromBedId: string;
    toBedId: string;
    reason: string;
    transferredBy: string;
  }): Promise<BedTransfer> {
    const transferRecord: BedTransfer = {
      id: 'trf-' + Date.now(),
      admission_id: data.admissionId,
      from_bed_id: data.fromBedId,
      to_bed_id: data.toBedId,
      reason: data.reason,
      transferred_by: data.transferredBy || 'Duty Staff',
      transfer_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('bed_transfers').insert([transferRecord]);
      await supabase.from('admissions').update({ bed_id: data.toBedId }).eq('id', data.admissionId);
      await supabase.from('beds').update({ status: 'cleaning' }).eq('id', data.fromBedId);
      await supabase.from('beds').update({ status: 'occupied' }).eq('id', data.toBedId);
    }

    // Update local cache
    const admissions = await this.getAdmissions();
    const updatedAdmissions = admissions.map((adm) =>
      adm.id === data.admissionId ? { ...adm, bed_id: data.toBedId } : adm
    );
    setLocal(STORAGE_KEYS.ADMISSIONS, updatedAdmissions);

    const transfers = getLocal<BedTransfer[]>(STORAGE_KEYS.TRANSFERS, []);
    setLocal(STORAGE_KEYS.TRANSFERS, [transferRecord, ...transfers]);

    // Old bed goes to cleaning / vacant, new bed occupied
    await this.updateBedStatus(data.fromBedId, 'cleaning');
    await this.updateBedStatus(data.toBedId, 'occupied');

    return transferRecord;
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
    const dischargeRecord: DischargeRecord = {
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

    const newStatus = data.dischargeType === 'referred' ? 'referred' : data.dischargeType === 'lama' ? 'lama' : 'discharged';

    if (isSupabaseConfigured && supabase) {
      await supabase.from('discharges').insert([dischargeRecord]);
      await supabase.from('admissions').update({ status: newStatus }).eq('id', data.admissionId);
      await supabase.from('beds').update({ status: 'cleaning' }).eq('id', data.bedId);
    }

    const admissions = await this.getAdmissions();
    const updatedAdmissions = admissions.map((adm) =>
      adm.id === data.admissionId ? { ...adm, status: newStatus as any } : adm
    );
    setLocal(STORAGE_KEYS.ADMISSIONS, updatedAdmissions);

    const discharges = getLocal<DischargeRecord[]>(STORAGE_KEYS.DISCHARGES, []);
    setLocal(STORAGE_KEYS.DISCHARGES, [dischargeRecord, ...discharges]);

    // Bed freed -> auto cleaning
    await this.updateBedStatus(data.bedId, 'cleaning');

    return dischargeRecord;
  },

  async getAdmissions(): Promise<Admission[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('admissions')
        .select('*, patient:patients(*), bed:beds(*), ward:wards(*)')
        .order('admission_date', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return getLocal<Admission[]>(STORAGE_KEYS.ADMISSIONS, initialAdmissions);
  },

  // Reset demo data helper
  resetToDemo() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.WARDS);
    localStorage.removeItem(STORAGE_KEYS.BEDS);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.ADMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
    localStorage.removeItem(STORAGE_KEYS.DISCHARGES);
    window.location.reload();
  },
};
