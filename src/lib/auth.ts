'use client';

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
  name: 'Dr. Alexander Wright, MD',
  title: 'Chief of Inpatient Care & Intensive Care Unit',
  role: 'Doctor',
  sector: 'ICU / Critical Care Wing',
  email: 'alexander.m@bedpulse.health',
  avatar: '/assets/doctor.png',
  loginTime: new Date().toISOString(),
};

export const defaultNurse: ActiveStaff = {
  name: 'Sister Priya Sharma',
  title: 'Head Staff Nurse & Nursing Lead',
  role: 'Nurse',
  sector: 'General Medical Ward',
  email: 'priya.nurse@bedpulse.health',
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
  getCurrentStaff(): ActiveStaff | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('bedpulse_active_staff');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return null;
  },

  login(staff: ActiveStaff) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bedpulse_active_staff', JSON.stringify(staff));
    window.dispatchEvent(new Event('auth_change'));
  },

  switchRole(role: StaffRole): ActiveStaff {
    let staff = defaultDoctor;
    if (role === 'Nurse') staff = defaultNurse;
    if (role === 'Admin') staff = defaultAdmin;
    this.login(staff);
    return staff;
  },

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('bedpulse_active_staff');
    window.dispatchEvent(new Event('auth_change'));
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
          themeColor: '#1D77FF',
          badgeBg: 'bg-blue-50',
          badgeText: 'text-brand-600',
          badgeBorder: 'border-blue-200',
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
          themeColor: '#8B5CF6',
          badgeBg: 'bg-purple-50',
          badgeText: 'text-purple-600',
          badgeBorder: 'border-purple-200',
          focusDesc: 'Ward Master Studio (Add Wards/Beds, Tariffs), hospital occupancy telemetry, and system admin.',
        };
    }
  },
};
