'use client';
import {usePullRefresh} from '@/components/PullToRefresh';
import { DataSkeleton } from '@/components/LoadingFeedback';

import { ButtonSpinner, startNavigation } from '@/components/LoadingFeedback';


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { StatCards } from '@/components/StatCards';
import { WardBedMatrix } from '@/components/WardBedMatrix';
import { WardDonutChart } from '@/components/WardDonutChart';
import { PatientActivityList } from '@/components/PatientActivityList';
import { MobileLiveBedScroller } from '@/components/MobileLiveBedScroller';
import { AuthService, ActiveStaff } from '@/lib/auth';
import {
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Sliders,
  ArrowRight,
  RefreshCw,
  HeartPulse,
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
  const [refreshing, setRefreshing] = useState(false);

  // Check Auth on Mount & Listen for changes
 usePullRefresh(() => loadData());
  useEffect(() => {
    void AuthService.refresh().then(current => {
    if (!current) {
      // If unauthenticated, redirect to Landing Page / Role Login
      (startNavigation(), router.replace)('/setup');
      return;
    }
    setActiveStaff(current);
    setAuthChecked(true);
    }).catch(() => (startNavigation(), router.replace)('/setup'));

    const handleAuthChange = () => {
      const updated = AuthService.getCurrentStaff();
      if (!updated) {
        (startNavigation(), router.replace)('/');
      } else {
        setActiveStaff(updated);
      }
    };

    window.addEventListener('auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [router]);

  // Load / Refresh Data
  const loadData = async () => {
    setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeStaff) {
      loadData();

      const handleDataChange = () => {
        loadData();
      };

      window.addEventListener('bedpulse_data_change', handleDataChange);
      window.addEventListener('storage', handleDataChange);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          loadData();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Periodic 15-second background sync
      const timer = setInterval(() => {
        loadData();
      }, 15000);

      return () => {
        window.removeEventListener('bedpulse_data_change', handleDataChange);
        window.removeEventListener('storage', handleDataChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(timer);
      };
    }
  }, [activeStaff]);

  if (!authChecked || !activeStaff) return <DataSkeleton />;

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

  const role = activeStaff.role;

  return (
    <>
      <div className="space-y-6 dashboard-content">
      {loading ? <DataSkeleton /> : <>
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-3"><div><p className="text-xs text-[#7C8F80] mb-2">{activeStaff.name} / {role}</p><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#183E33]">Your hospital, at a glance.</h1></div><button onClick={loadData} disabled={refreshing} aria-label="Refresh dashboard" className="self-start flex items-center gap-2 border border-[#DBE5DB] bg-white px-4 py-2.5 rounded-xl text-xs font-semibold text-[#627B69]">{refreshing ? <ButtonSpinner /> : <RefreshCw size={14} />}Refresh</button></section>
        <section aria-label="Patient actions" className="flex flex-wrap items-center gap-3"><Link href="/admit" className="flex items-center gap-2 rounded-xl bg-[#183E33] hover:bg-[#285744] px-5 py-3 text-sm font-semibold text-white"><UserPlus size={17} />Admit patient</Link><Link href="/transfers" className="flex items-center gap-2 rounded-xl border border-[#DCE5DA] bg-white px-5 py-3 text-sm font-semibold text-[#42634C]"><ArrowRightLeft size={17} />Transfer</Link>{role !== 'Nurse' && <Link href="/discharge" className="flex items-center gap-2 rounded-xl border border-[#DCE5DA] bg-white px-5 py-3 text-sm font-semibold text-[#42634C]"><LogOut size={17} />Discharge</Link>}{role === 'Admin' && <Link href="/ward-master" className="flex items-center gap-2 px-3 py-3 text-sm font-semibold text-[#6B8473]"><Sliders size={17} />Manage wards<ArrowRight size={14} /></Link>}</section>
        {role === 'Nurse' && cleaningCount > 0 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"><span className="text-sm text-amber-800">{cleaningCount} beds need cleaning</span><button onClick={handleCleanAllBeds} className="text-xs font-semibold text-amber-900 underline underline-offset-4">Mark all clean</button></div>}
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
            onViewMatrix={() => (startNavigation(), router.push)('/wards')}
            onSelectBed={(bed) => {
              if (bed.status === 'vacant') {
                (startNavigation(), router.push)(`/admit?bedId=${bed.id}`);
              } else if (bed.status === 'occupied') {
                const adm = admissions.find((a) => a.bed_id === bed.id && a.status === 'admitted');
                if (adm) (startNavigation(), router.push)(`/transfers?admissionId=${adm.id}`);
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
              onAdmitToBed={(bed) => (startNavigation(), router.push)(`/admit?bedId=${bed.id}`)}
              onShiftBed={(adm) => (startNavigation(), router.push)(`/transfers?admissionId=${adm.id}`)}
              onDischargeBed={(adm) => (startNavigation(), router.push)(`/discharge?admissionId=${adm.id}`)}
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
              onShiftBed={(adm) => (startNavigation(), router.push)(`/transfers?admissionId=${adm.id}`)}
              onDischargeBed={(adm) => (startNavigation(), router.push)(`/discharge?admissionId=${adm.id}`)}
            />
          </div>
        </div>
      </>}
      </div>
    </>
  );
}
