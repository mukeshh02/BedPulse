import { createClient } from '@/utils/supabase/client';
import type { StaffRole } from './auth';
export interface HospitalMembership {
  hospital_id: string; user_id: string; role: StaffRole; is_owner: boolean;
  hospital: { id: string; name: string; setup_completed: boolean };
}
let active: HospitalMembership | null = null;
export const HospitalService = {
  current: () => active,
  clear() { active = null; },
  async resolve(): Promise<HospitalMembership | null> {
    active = null;
    const client = createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return null;
    const { data, error } = await client.from('hospital_memberships').select('hospital_id,user_id,role,is_owner,hospital:hospitals(id,name,setup_completed)').eq('user_id', user.id).eq('is_active', true).order('hospital_id').limit(1).maybeSingle();
    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        throw new Error('Hospital setup is not available yet. The administrator must apply the hospital database migration. Your account is signed in.');
      }
      throw new Error(error.message || 'Unable to load your hospital membership.');
    }
    if (!data) return null;
    const hospital = Array.isArray(data.hospital) ? data.hospital[0] : data.hospital;
    if (!hospital || !['Admin','Doctor','Nurse'].includes(data.role)) return null;
    active = { ...data, role: data.role as StaffRole, hospital };
    return active;
  },
  async require() {
    const membership = active || await this.resolve();
    if (!membership?.hospital.setup_completed) throw new Error('Complete hospital setup before managing patients.');
    return membership;
  },
};
