export type BedStatus = 'vacant' | 'occupied' | 'cleaning' | 'maintenance';
export type AdmissionStatus = 'admitted' | 'shifted' | 'discharged' | 'referred' | 'lama';
export type DischargeType = 'normal' | 'referred' | 'lama';

export interface Ward {
  id: string;
  name: string;
  code: string;
  description?: string;
  floor?: string;
  color_accent: string;
  created_at?: string;
}

export interface Bed {
  id: string;
  bed_number: string;
  ward_id: string;
  ward?: Ward;
  room_type: string;
  daily_rate: number;
  status: BedStatus;
  current_admission?: Admission;
  created_at?: string;
}

export interface Patient {
  id: string;
  uhid: string;
  full_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
  guardian_name?: string;
  guardian_mobile?: string;
  address?: string;
  created_at?: string;
}

export interface Admission {
  id: string;
  admission_number: string;
  patient_id: string;
  patient?: Patient;
  bed_id: string;
  bed?: Bed;
  ward_id?: string;
  ward?: Ward;
  admitting_doctor: string;
  provisional_diagnosis: string;
  admission_date: string;
  status: AdmissionStatus;
  notes?: string;
  created_at?: string;
}

export interface BedTransfer {
  id: string;
  admission_id: string;
  admission?: Admission;
  from_bed_id: string;
  from_bed?: Bed;
  to_bed_id: string;
  to_bed?: Bed;
  reason: string;
  transferred_by: string;
  transfer_date: string;
  created_at?: string;
}

export interface DischargeRecord {
  id: string;
  admission_id: string;
  admission?: Admission;
  discharge_type: DischargeType;
  destination_hospital?: string;
  discharge_summary: string;
  doctor_advice?: string;
  follow_up_date?: string;
  discharged_at: string;
  created_at?: string;
}
