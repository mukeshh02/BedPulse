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
  Sparkles,
  Lock,
  ChevronRight,
  Clock,
  Building2,
  Users,
} from 'lucide-react';
import { AuthService, defaultDoctor, defaultNurse, defaultAdmin, ActiveStaff, StaffRole } from '@/lib/auth';
import { DataService } from '@/lib/supabase';

interface LandingPageProps {
  onLoginSuccess?: (staff: ActiveStaff) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<StaffRole>('Doctor');
  const [pin, setPin] = useState('WardAlpha2024!');
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

  const handleRoleQuickLaunch = (role: StaffRole) => {
    let staff: ActiveStaff = defaultDoctor;
    if (role === 'Nurse') staff = defaultNurse;
    if (role === 'Admin') staff = defaultAdmin;

    AuthService.login(staff);
    if (onLoginSuccess) {
      onLoginSuccess(staff);
    }
    router.push('/dashboard');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleRoleQuickLaunch(selectedRole);
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
              Inpatient Care OS
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
              <span>Go to Active Dashboard ({currentStaff.role})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <a
            href="tel:+917000371321"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm text-xs font-bold text-slate-700 hover:text-brand-600 transition"
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

          <Link
            href="/login"
            className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/25"
          >
            <span>Staff Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-10 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: PITCH & INSTANT ROLE ACCESS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-brand-700 border border-blue-100 text-xs font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hospital Operating System v2.4 • Supabase Connected</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Intelligent Inpatient &amp; Bed Management for{' '}
              <span className="text-brand-500 underline decoration-brand-200">Modern Hospitals</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Eliminate bed turnaround delays. Manage live ward floors, patient admissions,
              inter-ward shifts, and paperless discharge clearances with zero friction.
            </p>

            {/* 3 QUICK-LAUNCH ROLE TILES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Select Your Clinical Station to Enter:
                </span>
                <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  1-Click Instant Login
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Doctor */}
                <button
                  type="button"
                  onClick={() => handleRoleQuickLaunch('Doctor')}
                  className="p-4 rounded-3xl bg-white border border-blue-100 hover:border-brand-500 hover:shadow-lg transition text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Attending Doctor</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Dr. Alexander Wright, MD</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-brand-600 bg-blue-50/70 px-2 py-0.5 rounded-md">
                      ICU &amp; Clinical Rounds
                    </span>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                    <span>Launch Doctor OS</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Nurse */}
                <button
                  type="button"
                  onClick={() => handleRoleQuickLaunch('Nurse')}
                  className="p-4 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-500 hover:shadow-lg transition text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Head Nurse</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Sister Priya Sharma</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50/70 px-2 py-0.5 rounded-md">
                      Ward Floor &amp; Sanitization
                    </span>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Launch Nurse OS</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleQuickLaunch('Admin')}
                  className="p-4 rounded-3xl bg-white border border-purple-100 hover:border-purple-500 hover:shadow-lg transition text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Hospital Admin</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Chief Administrator</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-purple-600 bg-purple-50/70 px-2 py-0.5 rounded-md">
                      Ward Master &amp; Tariffs
                    </span>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>Launch Admin OS</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* QUICK SHIFT PIN LOGIN BOX */}
            <form onSubmit={handleCustomLogin} className="bg-white p-4 rounded-3xl border border-blue-100/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-500" /> Or Authenticate with Shift Passcode:
                </span>
                <span className="text-[10px] text-slate-400">Hospital Clinical Passcode</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0 text-xs font-bold">
                  {(['Doctor', 'Nurse', 'Admin'] as StaffRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        selectedRole === r ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter Shift Passcode"
                    className="w-full bg-slate-50 px-3.5 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Enter as {selectedRole}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live Supabase PostgreSQL
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

                {/* Telemetry preview cards */}
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

                {/* Doctor cutout highlight */}
                <div className="pt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-white shadow-sm shrink-0">
                    <Image src="/assets/doctor.png" alt="Doctor" fill className="object-cover object-top" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Dr. Alexander Wright, MD</p>
                    <p className="text-[11px] text-blue-100">Intensive Care Director on Active Rounds</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLaunch('Doctor')}
                  className="w-full py-3 bg-white hover:bg-blue-50 text-brand-600 rounded-2xl text-xs font-extrabold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Launch Inpatient OS as Doctor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
