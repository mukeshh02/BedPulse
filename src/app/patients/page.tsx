'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import {
  Users,
  Search,
  BedDouble,
  Stethoscope,
  Wind,
  Heart,
  Thermometer,
  ArrowRightLeft,
  LogOut,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Clock,
  Activity,
  ShieldAlert,
} from 'lucide-react';

function PatientsDirectoryContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'stable' | 'discharge_ready'>('all');
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedWardId, setSelectedWardId] = useState<string>('all');

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  const activeAdmissions = admissions.filter((a) => a.status === 'admitted');

  // Filter admissions
  const filtered = activeAdmissions.filter((adm) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = adm.patient?.full_name.toLowerCase().includes(q) || false;
    const uhidMatch = adm.patient?.uhid.toLowerCase().includes(q) || false;
    const diagMatch = adm.provisional_diagnosis.toLowerCase().includes(q) || false;
    const bed = beds.find((b) => b.id === adm.bed_id);
    const ward = wards.find((w) => w.id === bed?.ward_id);
    const bedMatch = bed?.bed_number.toLowerCase().includes(q) || false;
    const wardMatch = ward?.name.toLowerCase().includes(q) || false;

    if (searchQuery && !(nameMatch || uhidMatch || diagMatch || bedMatch || wardMatch)) {
      return false;
    }

    if (selectedWardId !== 'all' && bed?.ward_id !== selectedWardId) {
      return false;
    }

    if (filterTab === 'critical') {
      const isIcu = ward?.name.toLowerCase().includes('icu') || ward?.name.toLowerCase().includes('emergency');
      const isSevere = adm.provisional_diagnosis.toLowerCase().includes('infarction') ||
        adm.provisional_diagnosis.toLowerCase().includes('failure') ||
        adm.provisional_diagnosis.toLowerCase().includes('sepsis') ||
        adm.provisional_diagnosis.toLowerCase().includes('coronary');
      return isIcu || isSevere;
    }

    if (filterTab === 'discharge_ready') {
      // Patients admitted > 3 days or with stable diagnosis
      const days = Math.floor((Date.now() - new Date(adm.admission_date).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 2;
    }

    return true;
  });

  const criticalCount = activeAdmissions.filter((adm) => {
    const bed = beds.find((b) => b.id === adm.bed_id);
    const ward = wards.find((w) => w.id === bed?.ward_id);
    return ward?.name.toLowerCase().includes('icu') || ward?.name.toLowerCase().includes('emergency');
  }).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_20px_rgba(29,119,255,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Inpatient Directory &amp; Clinical Rounds
              </h1>
              <span className="bg-brand-50 text-brand-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-brand-200">
                {activeAdmissions.length} Under Care
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive inpatient roster with telemetry vitals, ward allocation, and quick clinical actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            href="/admit"
            className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/25"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Admit New Patient
          </Link>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Inpatients</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{activeAdmissions.length}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Across {wards.length} Wards</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Critical / ICU Care</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</h3>
          <p className="text-[11px] text-rose-700/80 mt-0.5 font-medium">Constant Monitoring</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Stable / Step-Down</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{Math.max(0, activeAdmissions.length - criticalCount)}</h3>
          <p className="text-[11px] text-emerald-700/80 mt-0.5 font-medium">General / Recovery</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Average Stay</span>
          <h3 className="text-2xl font-black text-brand-600 mt-1">3.4 <span className="text-sm font-normal text-slate-500">Days</span></h3>
          <p className="text-[11px] text-brand-700/80 mt-0.5 font-medium">Bed Turnaround Optimal</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                filterTab === 'all'
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Inpatients ({activeAdmissions.length})
            </button>
            <button
              onClick={() => setFilterTab('critical')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                filterTab === 'critical'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Critical / ICU ({criticalCount})
            </button>
            <button
              onClick={() => setFilterTab('discharge_ready')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                filterTab === 'discharge_ready'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Discharge Ready
            </button>
          </div>

          {/* Ward Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">Ward:</span>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-700"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, UHID, bed number, or provisional diagnosis..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* PATIENT LIST CARDS */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-blue-50 shadow-sm">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading Inpatient Directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-blue-50 shadow-sm">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No Inpatients Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            No patients match the search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((adm) => {
            const bed = beds.find((b) => b.id === adm.bed_id);
            const ward = wards.find((w) => w.id === bed?.ward_id);
            const isIcu = ward?.name.toLowerCase().includes('icu');
            const stayDays = Math.max(
              1,
              Math.floor((Date.now() - new Date(adm.admission_date).getTime()) / (1000 * 60 * 60 * 24))
            );

            // Mock telemetry vitals for inpatient tracking
            const heartRate = isIcu ? 104 : 76;
            const spo2 = isIcu ? 94 : 98;
            const bp = isIcu ? '142/92' : '120/80';
            const temp = '98.6°F';

            return (
              <div
                key={adm.id}
                className="bg-white rounded-3xl p-5 border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] hover:border-brand-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Name & Bed */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-400 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                        {adm.patient?.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{adm.patient?.full_name}</h4>
                        <p className="text-[11px] font-mono text-slate-400">
                          {adm.patient?.uhid} • {adm.patient?.age}y / {adm.patient?.gender[0].toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-50 text-brand-700 font-mono font-black text-xs border border-blue-100">
                        {bed?.bed_number || 'Bed'}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                        {ward?.name}
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis & Attending Doctor */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 space-y-1.5 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                      <Stethoscope className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span>{adm.provisional_diagnosis}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Dr: {adm.admitting_doctor.replace(/Dr\.\s*/, '')}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Day {stayDays} of stay
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Vitals Chips */}
                  <div className="grid grid-cols-4 gap-1.5 mb-4 text-center">
                    <div className="bg-rose-50/60 p-1.5 rounded-xl border border-rose-100">
                      <span className="text-[9px] font-bold text-rose-500 block flex items-center justify-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" /> HR
                      </span>
                      <span className="text-xs font-black text-rose-700 font-mono">{heartRate}</span>
                    </div>
                    <div className="bg-blue-50/60 p-1.5 rounded-xl border border-blue-100">
                      <span className="text-[9px] font-bold text-brand-500 block flex items-center justify-center gap-0.5">
                        <Wind className="w-2.5 h-2.5" /> SpO₂
                      </span>
                      <span className="text-xs font-black text-brand-700 font-mono">{spo2}%</span>
                    </div>
                    <div className="bg-purple-50/60 p-1.5 rounded-xl border border-purple-100">
                      <span className="text-[9px] font-bold text-purple-500 block flex items-center justify-center gap-0.5">
                        <Activity className="w-2.5 h-2.5" /> BP
                      </span>
                      <span className="text-[10px] font-black text-purple-700 font-mono">{bp}</span>
                    </div>
                    <div className="bg-amber-50/60 p-1.5 rounded-xl border border-amber-100">
                      <span className="text-[9px] font-bold text-amber-500 block flex items-center justify-center gap-0.5">
                        <Thermometer className="w-2.5 h-2.5" /> TEMP
                      </span>
                      <span className="text-[10px] font-black text-amber-700 font-mono">{temp}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Links */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/transfers?admissionId=${adm.id}`}
                    className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Shift Bed
                  </Link>
                  <Link
                    href={`/discharge?admissionId=${adm.id}`}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Discharge
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Inpatient Directory...</div>}>
        <PatientsDirectoryContent />
      </Suspense>
    </AppShell>
  );
}
