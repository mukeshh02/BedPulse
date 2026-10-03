'use client';
import { startNavigation, ButtonSpinner } from '@/components/LoadingFeedback';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { HospitalService } from '@/lib/hospital';
import { HeartPulse, BedDouble, UserPlus, ArrowRightLeft, ArrowRight, Users, KeyRound } from 'lucide-react';
import { AuthService, ActiveStaff, StaffRole } from '@/lib/auth';

interface LandingPageProps {
  onLoginSuccess?: (staff: ActiveStaff) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<StaffRole>('Doctor');
  const [staffEmail, setStaffEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<ActiveStaff | null>(null);
  useEffect(() => { localStorage.removeItem('bedpulse_active_staff'); AuthService.refresh().then(setCurrentStaff).catch(() => setCurrentStaff(null)); }, []);

  const handleRoleTabChange = (role: StaffRole) => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setIsSubmitting(true);
    try {
      const {error} = await createClient().auth.signInWithPassword({email:staffEmail.trim(),password});
      if(error) throw error;
      const {data:platformAdmin} = await createClient().rpc('is_platform_admin');
      if(platformAdmin === true) { (startNavigation(), router.push)('/super-admin'); router.refresh(); return; }
      let staff: ActiveStaff | null = null;
      try {
        staff = await AuthService.refresh();
      } catch {
        // Authentication succeeded. Resolve setup problems on the setup page.
        HospitalService.clear();
      }
      if(staff && onLoginSuccess) onLoginSuccess(staff);
      (startNavigation(), router.push)(HospitalService.current()?.hospital.setup_completed ? '/dashboard' : '/setup');
      router.refresh();
    } catch(error) {
      setErrorMsg(error && typeof error === 'object' && 'message' in error
        ? String(error.message) : 'Unable to sign in. Please try again.');
    }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#18362E] flex flex-col">
      <header className="mx-auto max-w-7xl w-full px-6 sm:px-10 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-xl font-extrabold tracking-tight"><span className="w-10 h-10 rounded-xl bg-[#183E33] text-white flex items-center justify-center"><HeartPulse size={23} /></span>BedPulse</Link>
        <Link href={currentStaff ? '/dashboard' : '/register'} className="text-sm font-semibold flex items-center gap-2 hover:text-[#749780]">{currentStaff ? 'Open dashboard' : 'Create account'}<ArrowRight size={16} /></Link>
      </header>
      <main className="mx-auto max-w-7xl w-full px-6 sm:px-10 flex-1">
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center py-10 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788E80] mb-6">Hospital operations, simplified</p>
            <h1 className="text-[44px] sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.055em] leading-[1.12]">Every bed.<br />Every patient.<br /><span className="text-[#789986]">One clear view.</span></h1>
            <p className="text-[#6F8075] text-base leading-7 max-w-sm mt-6">Manage beds, admissions and patient movement. Keep your team focused on care.</p>
            <div className="flex flex-wrap gap-4 mt-8 text-xs text-[#637B6B]"><span className="flex items-center gap-2"><BedDouble size={16} />Beds</span><span className="flex items-center gap-2"><Users size={16} />Patients</span><span className="flex items-center gap-2"><ArrowRightLeft size={16} />Transfers</span></div>
          </div>
          <div className="rounded-[28px] bg-[#EDF2EC] border border-[#E0E8E1] p-4 sm:p-7">
            <div className="bg-white rounded-2xl border border-[#DFE6DF] p-6 sm:p-8 shadow-[0_20px_60px_-25px_rgba(24,62,51,0.18)]">
              <span className="w-11 h-11 rounded-xl bg-[#EDF3ED] flex items-center justify-center text-[#668571] mb-5"><KeyRound size={21} /></span>
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back.</h2>
              <p className="text-sm text-[#7C8A80] mt-2 mb-6">Sign in to your workspace.</p>

              {errorMsg && <p role="alert" className="rounded-xl bg-rose-50 text-rose-700 text-xs p-3 mb-4">{errorMsg}</p>}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div><label htmlFor="landing-email" className="block text-xs font-semibold mb-2">Email</label><input id="landing-email" autoComplete="username" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} required placeholder="Enter your email" className="w-full rounded-xl bg-[#FAFBF9] border border-[#DEE5DC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#789986]" /></div>
                <div><label htmlFor="landing-password" className="block text-xs font-semibold mb-2">Password</label><input id="landing-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" className="w-full rounded-xl bg-[#FAFBF9] border border-[#DEE5DC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#789986]" /></div>
                <button disabled={isSubmitting} className="w-full rounded-xl bg-[#183E33] hover:bg-[#285744] text-white py-3.5 text-sm font-semibold flex items-center justify-center gap-3 transition disabled:opacity-60">{isSubmitting && <ButtonSpinner />}{isSubmitting ? 'Signing in…' : 'Open workspace'}<ArrowRight size={17} /></button>
              </form>
              <p className="mt-5 text-center text-xs text-[#839086]">New to BedPulse? <Link href="/register" className="text-[#355C45] font-semibold underline underline-offset-4">Create account</Link></p>
            </div>
            <p className="text-center text-[11px] text-[#839086] mt-4">For doctors, nurses and hospital teams.</p>
          </div>
        </section>
        <section aria-label="Core workflows" className="border-t border-[#DFE7DE] grid sm:grid-cols-3 gap-6 py-8">
          {[{icon: UserPlus, title: 'Simple admissions', text: 'Register patients. Allocate beds.'}, {icon: BedDouble, title: 'Clear ward visibility', text: 'Keep beds and patient records in view.'}, {icon: ArrowRightLeft, title: 'Smoother transitions', text: 'Handle transfers and discharge.'}].map(({icon: Icon, title, text}) => <div key={title} className="flex gap-3"><span className="w-10 h-10 shrink-0 border border-[#DFE7DE] bg-white rounded-xl flex items-center justify-center text-[#789986]"><Icon size={19} strokeWidth={1.6} /></span><div><h2 className="text-sm font-semibold">{title}</h2><p className="text-xs leading-5 text-[#839086] mt-1">{text}</p></div></div>)}
        </section>
      </main>
      <footer className="mx-auto max-w-7xl w-full px-6 sm:px-10 py-6 flex flex-wrap gap-3 justify-between text-[11px] text-[#8B988F]"><span>BedPulse · Built for better care.</span><a href="tel:+917000371321" className="hover:text-[#183E33]">Contact support ↗</a></footer>
    </div>
  );
};
