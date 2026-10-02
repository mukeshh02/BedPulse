'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import { HeroBanner } from '@/components/HeroBanner';
import { StatCards } from '@/components/StatCards';
import { WardBedMatrix } from '@/components/WardBedMatrix';
import { WardDonutChart } from '@/components/WardDonutChart';
import { PatientActivityList } from '@/components/PatientActivityList';
import { MobileLiveBedScroller } from '@/components/MobileLiveBedScroller';
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
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Data State
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadData();
  }, []);

  // KPI counts
  const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
  const availableCount = beds.filter((b) => b.status === 'vacant').length;
  const cleaningCount = beds.filter((b) => b.status === 'cleaning').length;

  const handleMarkClean = async (bedId: string) => {
    await DataService.markBedClean(bedId);
    await loadData();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* HERO BANNER */}
        <HeroBanner
          availableBeds={availableCount}
          totalBeds={beds.length}
          onOpenAdmission={() => router.push('/admit')}
          onOpenTransfer={() => router.push('/transfers')}
          onOpenDischarge={() => router.push('/discharge')}
        />

        {/* QUICK NAVIGATION ACTION CARDS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

          <Link
            href="/patients"
            className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rounds</span>
              <h4 className="text-xs font-black text-slate-800">Inpatients ({occupiedCount})</h4>
            </div>
          </Link>

          <Link
            href="/ward-master"
            className="bg-white p-3.5 rounded-2xl border border-blue-50/80 shadow-sm hover:shadow-md hover:border-purple-300 transition group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Settings</span>
              <h4 className="text-xs font-black text-slate-800">Ward Master</h4>
            </div>
          </Link>
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
