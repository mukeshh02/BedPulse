'use client';
import { createClient } from '@/utils/supabase/client';
import { HospitalService } from './hospital';
let verifiedStaff: ActiveStaff | null = null;

export type StaffRole = 'Doctor' | 'Nurse' | 'Admin';

export interface ActiveStaff {
  name: string;
  title: string;
  role: StaffRole;
  sector: string;
  email: string;
  avatar?: string;
  loginTime: string;
}

export const defaultDoctor: ActiveStaff = {
  name: 'Duty Doctor, MD',
  title: 'Attending Physician & Inpatient Care',
  role: 'Doctor',
  sector: 'ICU / General Ward Wing',
  email: 'doctor@bedpulse.health',
  avatar: '/assets/doctor.png',
  loginTime: new Date().toISOString(),
};

export const defaultNurse: ActiveStaff = {
  name: 'Sister Priya Sharma',
  title: 'Head Staff Nurse & Nursing Lead',
  role: 'Nurse',
  sector: 'General Medical Ward',
  email: 'nurse@bedpulse.health',
  avatar: '',
  loginTime: new Date().toISOString(),
};

export const defaultAdmin: ActiveStaff = {
  name: 'Chief Administrator',
  title: 'Hospital Operations & Ward Director',
  role: 'Admin',
  sector: 'Central Operations Floor',
  email: 'admin@bedpulse.health',
  avatar: '',
  loginTime: new Date().toISOString(),
};

export const AuthService = {
  getCurrentStaff(): ActiveStaff | null { return verifiedStaff; },
  async refresh(): Promise<ActiveStaff | null> {
    const {data:{user},error} = await createClient().auth.getUser();
    if(error || !user) { verifiedStaff = null; return null; }
    const m = await HospitalService.resolve();
    if(!m || !m.hospital.setup_completed) { verifiedStaff = null; return null; }
    verifiedStaff = {name:user.user_metadata.full_name || user.email || 'Staff', email:user.email || '', role:m.role, sector:m.hospital.name, title:m.role, loginTime:new Date().toISOString()};
    return verifiedStaff;
  },
  login(_staff: ActiveStaff) { throw new Error('Sign in with your hospital account.'); },
  switchRole(_role: StaffRole): ActiveStaff { if(!verifiedStaff) throw new Error('Sign in first.'); return verifiedStaff; },
  async logout() { await createClient().auth.signOut(); verifiedStaff=null; HospitalService.clear(); localStorage.removeItem('bedpulse_active_staff'); document.cookie='bedpulse_auth=; path=/; max-age=0'; window.dispatchEvent(new Event('auth_change')); },
  isAuthenticated(): boolean {
    return this.getCurrentStaff() !== null;
  },

  hasPermission(role: StaffRole, action: 'admit' | 'shift' | 'discharge' | 'ward_master' | 'clean_beds'): boolean {
    switch (role) {
      case 'Doctor':
        return ['admit', 'shift', 'discharge'].includes(action);
      case 'Nurse':
        return ['shift', 'clean_beds', 'admit'].includes(action);
      case 'Admin':
        return true; // Admin has full access
      default:
        return false;
    }
  },

  getRoleMeta(role: StaffRole) {
    switch (role) {
      case 'Doctor':
        return {
          title: 'Attending Physician',
          label: 'Doctor',
          themeColor: '#183E33',
          badgeBg: 'bg-brand-50',
          badgeText: 'text-brand-600',
          badgeBorder: 'border-brand-200',
          focusDesc: 'Clinical rounds, vitals telemetry, patient admissions, and discharge clearances.',
        };
      case 'Nurse':
        return {
          title: 'Head Staff Nurse',
          label: 'Nurse',
          themeColor: '#10B981',
          badgeBg: 'bg-emerald-50',
          badgeText: 'text-emerald-600',
          badgeBorder: 'border-emerald-200',
          focusDesc: 'Live floor bed status, bedside vitals triage, patient transfers, and bed sanitization.',
        };
      case 'Admin':
        return {
          title: 'Hospital Operations Director',
          label: 'Admin',
          themeColor: '#63816C',
          badgeBg: 'bg-brand-50',
          badgeText: 'text-brand-600',
          badgeBorder: 'border-brand-200',
          focusDesc: 'Hospital Settings Hub (Add Wards/Beds, Doctors Roster, Staff Onboarding), hospital occupancy telemetry, and system admin.',
        };
    }
  },
};
