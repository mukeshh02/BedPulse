'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import { LandingPage } from '@/components/LandingPage';
import { HeroBanner } from '@/components/HeroBanner';
import { StatCards } from '@/components/StatCards';
import { WardBedMatrix } from '@/components/WardBedMatrix';
import { WardDonutChart } from '@/components/WardDonutChart';
import { PatientActivityList } from '@/components/PatientActivityList';
import { MobileLiveBedScroller } from '@/components/MobileLiveBedScroller';
import { AuthService, ActiveStaff, StaffRole } from '@/lib/auth';
import {
  UserPlus,
  BedDouble,
  ArrowRightLeft,
  LogOut,
  Users,
  Sliders,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Authentication State
  const [activeStaff, setActiveStaff] = useState<ActiveStaff | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Data State
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  // Check Auth on Mount & Listen for changes
  useEffect(() => {
    const current = AuthService.getCurrentStaff();
    setActiveStaff(current);
    setAuthChecked(true);

    const handleAuthChange = () => {
      setActiveStaff(AuthService.getCurrentStaff());
    };

    window.addEventListener('auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Load / Refresh Data
  const loadData = async () => {
    try {
      const [w, b, a] = await Promise.all([
        DataService.getWards(),
        DataService.getBeds(),
        DataService.getAdmissions(),
      ]);
      setWards(w);
      setBeds(b);
      setAdmissions(a);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeStaff) {
      loadData();
    }
  }, [activeStaff]);

  // If auth has not been determined yet, show seamless Medi Plus loader
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F1F6FD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-brand-600">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 animate-bounce">
            <HeartPulse className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
            Loading BedPulse™ OS...
          </span>
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show the Landing Page with 1-Click Role Login!
  if (!activeStaff) {
    return <LandingPage onLoginSuccess={(staff) => setActiveStaff(staff)} />;
  }

  // KPI counts
  const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
  const availableCount = beds.filter((b) => b.status === 'vacant').length;
  const cleaningCount = beds.filter((b) => b.status === 'cleaning').length;

  const handleMarkClean = async (bedId: string) => {
    await DataService.markBedClean(bedId);
    await loadData();
  };

  const handleCleanAllBeds = async () => {
    const dirtyBeds = beds.filter((b) => b.status === 'cleaning');
    for (const b of dirtyBeds) {
      await DataService.markBedClean(b.id);
    }
    await loadData();
  };

  const switchRole = (role: StaffRole) => {
    const updated = AuthService.switchRole(role);
    setActiveStaff(updated);
  };

  const role = activeStaff.role;

  return (
    <AppShell activeStaff={activeStaff}>
      <div className="space-y-6">
        {/* ROLE CONTEXT NOTIFICATION BAR */}
        <section
          className={`p-4 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            role === 'Doctor'
              ? 'bg-gradient-to-r from-blue-500/10 via-indigo-50/50 to-white border-blue-200/90'
              : role === 'Nurse'
              ? 'bg-gradient-to-r from-emerald-500/10 via-teal-50/50 to-white border-emerald-200/90'
              : 'bg-gradient-to-r from-purple-500/10 via-indigo-50/50 to-white border-purple-200/90'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center font-black shadow-md ${
                role === 'Doctor'
                  ? 'bg-brand-500 shadow-brand-500/30'
                  : role === 'Nurse'
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : 'bg-purple-600 shadow-purple-600/30'
              }`}
            >
              {role === 'Doctor' ? (
                <Stethoscope className="w-6 h-6" />
              ) : role === 'Nurse' ? (
                <HeartPulse className="w-6 h-6" />
              ) : (
                <Sliders className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-900">
                  {role === 'Doctor'
                    ? `Clinical Station • ${activeStaff.name}`
                    : role === 'Nurse'
                    ? `Nursing Floor Station • ${activeStaff.name}`
                    : `Hospital Operations Command • ${activeStaff.name}`}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    role === 'Doctor'
                      ? 'bg-blue-50 text-brand-700 border-blue-200'
                      : role === 'Nurse'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {role} Access Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {role === 'Doctor'
                  ? 'Active Physician Focus: Inpatient rounds, ICU vital telemetry, admission triage, and paperless discharge approvals.'
                  : role === 'Nurse'
                  ? 'Active Nursing Focus: Live ward bed matrix, rapid terminal sanitization, bedside vitals, and shift transfers.'
                  : 'Active Operations Focus: Ward Master Studio (+ Add Wards, + Add Beds, Tariffs), hospital capacity, and system oversight.'}
              </p>
            </div>
          </div>

          {/* Quick Persona Switcher Bar */}
          <div className="flex items-center gap-1.5 shrink-0 bg-white/90 backdrop-blur-xs p-1 rounded-2xl border border-slate-200/80 shadow-2xs text-xs self-start md:self-auto">
            <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">
              Shift Persona:
            </span>
            <button
              onClick={() => switchRole('Doctor')}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                role === 'Doctor' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => switchRole('Nurse')}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                role === 'Nurse' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Nurse
            </button>
            <button
              onClick={() => switchRole('Admin')}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                role === 'Admin' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Admin
            </button>
          </div>
        </section>

        {/* ROLE SPECIFIC PRIORITY ACTIONS / ALERTS */}
        {role === 'Nurse' && cleaningCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-300/80 p-3.5 rounded-3xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-900">
                  {cleaningCount} Bed{cleaningCount > 1 ? 's' : ''} Require Terminal Sanitization
                </h4>
                <p className="text-[11px] text-amber-700">
                  Bed turnaround is pending. Sanitize to release these beds for new patient admissions.
                </p>
              </div>
            </div>
            <button
              onClick={handleCleanAllBeds}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Clean</span>
            </button>
          </div>
        )}

        {role === 'Admin' && (
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-3xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-purple-900">
                  Ward Master Studio Active (No Limits)
                </h4>
                <p className="text-[11px] text-purple-700">
                  {wards.length} Wards and {beds.length} Total Beds online. You can add new wings, beds, ventilator tags, and daily tariffs.
                </p>
              </div>
            </div>
            <Link
              href="/ward-master"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Open Ward Master Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* HERO BANNER */}
        <HeroBanner
          availableBeds={availableCount}
          totalBeds={beds.length}
          onOpenAdmission={() => router.push('/admit')}
          onOpenTransfer={() => router.push('/transfers')}
          onOpenDischarge={() => router.push('/discharge')}
        />

        {/* ROLE-TAILORED QUICK NAVIGATION ACTION CARDS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1 */}
          {role === 'Nurse' ? (
            <Link
              href="/wards"
              className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-400 transition group flex flex-col justify-between ring-1 ring-emerald-500/20"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Floor Priority</span>
                <h4 className="text-xs font-black text-slate-800">Live Ward Matrix</h4>
              </div>
            </Link>
          ) : role === 'Admin' ? (
            <Link
              href="/ward-master"
              className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-400 transition group flex flex-col justify-between ring-1 ring-purple-500/20"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Admin Studio</span>
                <h4 className="text-xs font-black text-slate-800">Ward Master</h4>
              </div>
            </Link>
          ) : (
            <Link
              href="/admit"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between ring-1 ring-brand-500/20"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Step 1 &amp; 2</span>
                <h4 className="text-xs font-black text-slate-800">Admit Patient</h4>
              </div>
            </Link>
          )}

          {/* Card 2 */}
          {role === 'Nurse' ? (
            <button
              onClick={handleCleanAllBeds}
              className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Turnaround</span>
                <h4 className="text-xs font-black text-slate-800">Clean All ({cleaningCount})</h4>
              </div>
            </button>
          ) : (
            <Link
              href="/transfers"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Step 3</span>
                <h4 className="text-xs font-black text-slate-800">Shift Bed</h4>
              </div>
            </Link>
          )}

          {/* Card 3 */}
          {role === 'Nurse' ? (
            <Link
              href="/transfers"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Step 3</span>
                <h4 className="text-xs font-black text-slate-800">Bed Transfers</h4>
              </div>
            </Link>
          ) : (
            <Link
              href="/discharge"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Step 4</span>
                <h4 className="text-xs font-black text-slate-800">Discharge / Refer</h4>
              </div>
            </Link>
          )}

          {/* Card 4 */}
          {role === 'Nurse' ? (
            <Link
              href="/admit"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Step 1 &amp; 2</span>
                <h4 className="text-xs font-black text-slate-800">Admit Patient</h4>
              </div>
            </Link>
          ) : (
            <Link
              href="/wards"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Floor View</span>
                <h4 className="text-xs font-black text-slate-800">Live Ward Matrix</h4>
              </div>
            </Link>
          )}

          {/* Card 5 */}
          <Link
            href="/patients"
            className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                {role === 'Doctor' ? 'Clinical Rounds' : 'Inpatients'}
              </span>
              <h4 className="text-xs font-black text-slate-800">Directory ({occupiedCount})</h4>
            </div>
          </Link>

          {/* Card 6 */}
          {role === 'Admin' ? (
            <Link
              href="/register"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-purple-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Staff</span>
                <h4 className="text-xs font-black text-slate-800">Onboarding</h4>
              </div>
            </Link>
          ) : (
            <Link
              href="/profile"
              className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-brand-300 transition group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift</span>
                <h4 className="text-xs font-black text-slate-800">{activeStaff.name.split(' ')[0]} Profile</h4>
              </div>
            </Link>
          )}
        </section>

        {/* STAT CARDS */}
        <StatCards
          occupiedCount={occupiedCount}
          availableCount={availableCount}
          cleaningCount={cleaningCount}
          totalWards={wards.length}
        />

        {/* MOBILE LIVE BED TELEMETRY SCROLLER */}
        <div className="lg:hidden">
          <MobileLiveBedScroller
            beds={beds}
            wards={wards}
            admissions={admissions}
            onViewMatrix={() => router.push('/wards')}
            onSelectBed={(bed) => {
              if (bed.status === 'vacant') {
                router.push(`/admit?bedId=${bed.id}`);
              } else if (bed.status === 'occupied') {
                const adm = admissions.find((a) => a.bed_id === bed.id && a.status === 'admitted');
                if (adm) router.push(`/transfers?admissionId=${adm.id}`);
              }
            }}
          />
        </div>

        {/* MAIN SPLIT: FLOOR MATRIX & SIDEBAR BENTO */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: LIVE BED MATRIX */}
          <div className="xl:col-span-2 space-y-6">
            <WardBedMatrix
              wards={wards}
              beds={beds}
              admissions={admissions}
              onAdmitToBed={(bed) => router.push(`/admit?bedId=${bed.id}`)}
              onShiftBed={(adm) => router.push(`/transfers?admissionId=${adm.id}`)}
              onDischargeBed={(adm) => router.push(`/discharge?admissionId=${adm.id}`)}
              onMarkBedClean={handleMarkClean}
            />
          </div>

          {/* RIGHT COL: DONUT CHART + ACTIVITY ROSTER */}
          <div className="space-y-6">
            <WardDonutChart
              wards={wards}
              beds={beds}
            />

            <PatientActivityList
              admissions={admissions}
              beds={beds}
              onShiftBed={(adm) => router.push(`/transfers?admissionId=${adm.id}`)}
              onDischargeBed={(adm) => router.push(`/discharge?admissionId=${adm.id}`)}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
