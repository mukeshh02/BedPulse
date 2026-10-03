import { createClient } from '@/utils/supabase/client';
import { HospitalService } from './hospital';
import { Ward, Bed, Patient, Admission, BedTransfer, DischargeRecord } from '@/types';
export const isSupabaseConfigured = true;
export const supabase = createClient();
export interface DoctorProfile { id: string; name: string; specialty: string; department: string; is_active: boolean }
function changed() { if (typeof window !== 'undefined') window.dispatchEvent(new Event('bedpulse_data_change')); }
async function read<T>(table: string, select = '*', order = 'created_at'): Promise<T[]> {
 const m = await HospitalService.require();
 const { data, error } = await supabase.from(table).select(select).eq('hospital_id', m.hospital_id).order(order);
 if (error) throw error; return (data || []) as T[];
}
async function insert<T>(table: string, payload: object): Promise<T> {
 const m = await HospitalService.require();
 const { data, error } = await supabase.from(table).insert({ ...payload, hospital_id: m.hospital_id }).select().single();
 if (error) throw error; changed(); return data as T;
}
async function clinical<T>(action: string, payload: object): Promise<T> {
 const m = await HospitalService.require();
 const { data, error } = await supabase.rpc('hospital_clinical_action', { hospital: m.hospital_id, action, payload });
 if (error) throw error; changed(); return data as T;
}
export interface HospitalStaff {user_id:string;full_name:string;role:string}
export interface PatientActivity {id:string;action:string;performed_by:string;recorded_by:string;performed_name:string;recorded_name:string;details:Record<string,unknown>;created_at:string}
export const DataService = {
 async getHospitalStaff():Promise<HospitalStaff[]> {const m=await HospitalService.require();const {data,error}=await supabase.rpc('hospital_active_staff',{hospital:m.hospital_id});if(error)throw error;return data||[];},
 async getPatientActivity(patientId:string):Promise<PatientActivity[]> {const m=await HospitalService.require();const {data,error}=await supabase.from('patient_activity').select('*').eq('hospital_id',m.hospital_id).eq('patient_id',patientId).order('created_at',{ascending:false});if(error)throw error;return data||[];},
 async editPatient(admissionId:string,changes:object,reason:string){const m=await HospitalService.require();const {error}=await supabase.rpc('edit_patient_record',{hospital:m.hospital_id,admission:admissionId,changes,reason});if(error)throw error;changed();},
 async correctActivity(eventId:string,performer:string,reason:string){const m=await HospitalService.require();const {error}=await supabase.rpc('correct_patient_activity',{hospital:m.hospital_id,event:eventId,performer,reason});if(error)throw error;changed();},
 getDoctors: () => read<DoctorProfile>('doctors', '*', 'name'),
 addDoctor: (doc: { name: string; specialty: string; department?: string }) => insert<DoctorProfile>('doctors', { ...doc, department: doc.department || '', is_active: true }),
 getWards: () => read<Ward>('wards', '*', 'name'),
 addWard: (w: Omit<Ward, 'id'>) => insert<Ward>('wards', { name: w.name, code: w.code, description: w.description || w.department || '', floor: w.floor || w.floor_number || '', color_accent: w.color_accent || '#183E33' }),
 getBeds: () => read<Bed>('beds', '*, ward:wards!beds_ward_id_fkey(*)', 'bed_number'),
 addBed: (b: Omit<Bed, 'id'>) => insert<Bed>('beds', { ward_id: b.ward_id, bed_number: b.bed_number, room_type: b.room_type || b.bed_type || 'Standard', daily_rate: Number(b.daily_rate || b.price_per_day || 0), status: 'vacant' }),
 getPatients: () => read<Patient>('patients'),
 getAdmissions: () => read<Admission>('admissions', '*, patient:patients!admissions_patient_id_fkey(*), bed:beds!admissions_bed_id_fkey(*), ward:wards!admissions_ward_id_fkey(*)', 'admission_date'),
 admitPatient: (data: { patient: Omit<Patient, 'id' | 'uhid'>; bedId: string; wardId: string; admittingDoctor: string; provisionalDiagnosis: string; notes?: string }) => clinical<{ patient: Patient; admission: Admission }>('admit', data),
 shiftBed: (data: { admissionId: string; fromBedId: string; toBedId: string; reason: string; transferredBy: string; performedBy?: string }) => clinical<BedTransfer>('shift', data),
 dischargePatient: (data: { admissionId: string; bedId: string; dischargeType: 'normal' | 'referred' | 'lama'; destinationHospital?: string; dischargeSummary: string; doctorAdvice?: string; followUpDate?: string }) => clinical<DischargeRecord>('discharge', data),
 async updateBedStatus(bedId: string, status: Bed['status']) { if (status !== 'vacant') throw new Error('Use the clinical workflow to change bed status.'); await clinical('clean', { bedId }); },
 async markBedClean(bedId: string) { await clinical('clean', { bedId }); },
 async deleteBed(id: string) { const m = await HospitalService.require(); const {error} = await supabase.from('beds').delete().eq('hospital_id',m.hospital_id).eq('id',id); if(error) throw error; changed(); },
 async deleteDoctor(id: string) { const m = await HospitalService.require(); const {error} = await supabase.from('doctors').delete().eq('hospital_id',m.hospital_id).eq('id',id); if(error) throw error; changed(); },
 clearHospitalData() { throw new Error('Hospital data cannot be reset from this screen.'); },
};
