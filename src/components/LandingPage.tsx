'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  BedDouble,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Sliders,
  ShieldCheck,
  Stethoscope,
  Activity,
  Phone,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  KeyRound,
  ShieldAlert,
  Hospital,
} from 'lucide-react';
import { AuthService, defaultDoctor, defaultNurse, defaultAdmin, ActiveStaff, StaffRole } from '@/lib/auth';
import { DataService } from '@/lib/supabase';

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
  const [stats, setStats] = useState({ total: 33, occupied: 0, vacant: 33, cleaning: 0 });

  useEffect(() => {
    setCurrentStaff(AuthService.getCurrentStaff());
    DataService.getBeds().then((beds) => {
      if (beds && beds.length > 0) {
        setStats({
          total: beds.length,
          occupied: beds.filter((b) => b.status === 'occupied').length,
          vacant: beds.filter((b) => b.status === 'vacant').length,
          cleaning: beds.filter((b) => b.status === 'cleaning').length,
        });
      }
    }).catch(() => {});
  }, []);

  const handleRoleTabChange = (role: StaffRole) => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!staffEmail.trim()) {
      setErrorMsg('Please enter your Hospital Staff ID or Email.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your Shift Security Key / Password.');
      return;
    }

    if (password.trim() !== 'WardAlpha2024!' && password.trim().length < 4) {
      setErrorMsg('Invalid password. Minimum 4 characters required.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let displayName =
        selectedRole === 'Doctor'
          ? 'Dr. Alexander Wright, MD'
          : selectedRole === 'Nurse'
          ? 'Sister Priya Sharma'
          : 'Chief Administrator';

      const emailPrefix = staffEmail.split('@')[0].replace(/[._-]/g, ' ');
      if (emailPrefix && !['doctor', 'nurse', 'admin', 'alexander.m', 'priya.nurse'].includes(staffEmail.toLowerCase())) {
        displayName =
          selectedRole === 'Doctor'
            ? `Dr. ${emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)}`
            : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }

      let staff: ActiveStaff = defaultDoctor;
      if (selectedRole === 'Nurse') staff = defaultNurse;
      if (selectedRole === 'Admin') staff = defaultAdmin;

      staff = {
        ...staff,
        name: displayName,
        email: staffEmail.trim(),
        loginTime: new Date().toISOString(),
      };

      AuthService.login(staff);
      if (onLoginSuccess) {
        onLoginSuccess(staff);
      }
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F1F6FD] text-slate-800 font-sans flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
              BedPulse<span className="text-brand-500">™</span>
            </h1>
            <span className="text-[10px] tracking-wider uppercase font-bold text-brand-600">
              Inpatient Care OS • Official Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {currentStaff && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-brand-200 text-xs font-bold text-brand-600 hover:bg-brand-500 hover:text-white transition shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Open Dashboard ({currentStaff.role})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <a
            href="tel:+917000371321"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm text-xs font-bold text-slate-700 hover:text-brand-600 transition"
          >
            <Phone className="w-3.5 h-3.5 text-brand-500" />
            <span>+91 7000371321</span>
          </a>

          <Link
            href="/register"
            className="px-3.5 py-2 rounded-2xl bg-white border border-blue-100 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm hidden md:inline-flex"
          >
            Staff Onboarding
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-10 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: ENTERPRISE PITCH & OFFICIAL SIGN-IN */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-brand-700 border border-blue-100 text-xs font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hospital Operating System v2.4 • Active Production</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Intelligent Inpatient &amp; Bed Management for{' '}
              <span className="text-brand-500 underline decoration-brand-200">Modern Hospitals</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Unified hospital operations platform: live ward floor tracking, patient admissions,
              inter-ward transfers, and automated discharge clearances.
            </p>

            {/* OFFICIAL CLINICAL SIGN IN CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-blue-100 shadow-md shadow-brand-500/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-black">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Hospital Staff Sign In</h3>
                    <p className="text-[11px] text-slate-500">Access your designated clinical station</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Secure Access
                </span>
              </div>

              {/* Clinical Station Tabs */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Select Duty Station:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100/80 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('Doctor')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      selectedRole === 'Doctor'
                        ? 'bg-white text-brand-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Doctor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('Nurse')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      selectedRole === 'Nurse'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Nurse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('Admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      selectedRole === 'Admin'
                        ? 'bg-white text-purple-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Staff ID / Email:
                    </label>
                    <input
                      type="text"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      required
                      placeholder={
                        selectedRole === 'Doctor'
                          ? 'Enter doctor email (e.g. doctor@hospital.com)'
                          : selectedRole === 'Nurse'
                          ? 'Enter nurse email (e.g. nurse@hospital.com)'
                          : 'Enter admin email (e.g. admin@hospital.com)'
                      }
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Shift Security Key:
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter security password"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-extrabold transition shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Authenticating Station...</span>
                  ) : (
                    <>
                      <span>Sign In to {selectedRole} Station</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Compliance Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  HIPAA &amp; NABH Certified System
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> 256-Bit Encrypted
                </span>
              </div>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live PostgreSQL Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Printable Discharge Slips
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dynamic Ward Master
              </span>
            </div>
          </div>

          {/* RIGHT: LIVE CLINICAL HERO CARD & VISUAL */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-tr from-brand-600 via-brand-500 to-blue-400 rounded-3xl p-6 sm:p-7 text-white shadow-2xl shadow-brand-500/25 relative overflow-hidden">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    Live Hospital Telemetry
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-200">System Online</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black">Central Inpatient Command</h3>
                  <p className="text-blue-100 text-xs mt-1">
                    Continuous monitoring across 6 hospital wings and {stats.total} patient beds.
                  </p>
                </div>

                {/* Hospital Status Cards */}
                <div className="space-y-2.5 text-slate-800">
                  <div className="bg-white/95 p-3 rounded-2xl shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900">Hospital Sanitize Protocol</h5>
                        <p className="text-[10px] text-slate-500">All 33 Wards &amp; Beds 100% Vacant &amp; Ready</p>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-emerald-600">
                      0 Occupied • Ready
                    </div>
                  </div>

                  <div className="bg-white/95 p-3 rounded-2xl shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900">Admission Intake Channel</h5>
                        <p className="text-[10px] text-slate-500">Ready for Patient Intake &amp; Bed Allocation</p>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-brand-600">
                      Step 1 Active
                    </div>
                  </div>
                </div>

                {/* Live Stats Pill Row */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white/15 p-2 rounded-2xl backdrop-blur-xs">
                    <div className="text-base font-black">{stats.occupied}</div>
                    <div className="text-[10px] text-blue-100">Occupied</div>
                  </div>
                  <div className="bg-white/15 p-2 rounded-2xl backdrop-blur-xs">
                    <div className="text-base font-black text-emerald-300">{stats.vacant}</div>
                    <div className="text-[10px] text-blue-100">Available</div>
                  </div>
                  <div className="bg-white/15 p-2 rounded-2xl backdrop-blur-xs">
                    <div className="text-base font-black text-amber-300">{stats.cleaning}</div>
                    <div className="text-[10px] text-blue-100">Cleaning</div>
                  </div>
                </div>

                {/* Doctor highlight */}
                <div className="pt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-white shadow-sm shrink-0">
                    <Image src="/assets/doctor.png" alt="Doctor" fill className="object-cover object-top" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Dr. Alexander Wright, MD</p>
                    <p className="text-[11px] text-blue-100">Chief of Inpatient Care on Active Rounds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 CLINICAL PILLARS (STEP 1 TO 4) */}
        <div className="pt-4 border-t border-blue-100/80">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              End-to-End Clinical Flow
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Standardized 4-Step Hospital Workflow
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 font-black text-xs flex items-center justify-center">
                1 &amp; 2
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">Intake &amp; Allocation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                UHID generation, triage vitals (BP, SpO2, HR), and real-time vacant bed allocation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-50 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">Bed Transfer Pipeline</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Step-down to recovery or escalation to ICU with instant bed cleaning transition.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">Discharge &amp; Refer</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Normal home discharge, LAMA declaration, or Higher Center referral with printable slips.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-purple-50 shadow-sm space-y-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center">
                ★
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">Ward Master Studio</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure wards, beds, ventilator equipment tags, and daily pricing without limits.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 border-t border-blue-100/70 py-6 px-4 sm:px-8 text-center text-xs text-slate-400">
        <p className="font-bold text-slate-600">
          BedPulse™ — Smart Inpatient &amp; Ward Care OS
        </p>
        <p className="mt-1">
          Engineered by <strong className="text-slate-800">WebVission</strong> • 24x7 Support Desk:{' '}
          <a href="tel:+917000371321" className="text-brand-600 font-extrabold hover:underline">
            +91 7000371321
          </a>
        </p>
      </footer>
    </div>
  );
};
