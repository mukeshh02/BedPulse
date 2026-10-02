'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import {
  BedDouble,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  Search,
  Filter,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function WardsPage() {
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardId, setSelectedWardId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'occupied' | 'cleaning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      console.error('Error loading ward matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkClean = async (bedId: string) => {
    await DataService.markBedClean(bedId);
    await loadData();
  };

  // Helper to find active admission for a bed
  const getActiveAdmission = (bedId: string) => {
    return admissions.find((a) => a.bed_id === bedId && a.status === 'admitted');
  };

  // Metrics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const vacantBeds = beds.filter((b) => b.status === 'vacant').length;
  const cleaningBeds = beds.filter((b) => b.status === 'cleaning').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Filtered wards
  const displayWards =
    selectedWardId === 'all'
      ? wards
      : wards.filter((w) => w.id === selectedWardId);

  // Filtered beds inside a ward
  const filterBeds = (wardBeds: Bed[]) => {
    return wardBeds.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const bedMatch = b.bed_number.toLowerCase().includes(q);
        const adm = getActiveAdmission(b.id);
        const patientMatch =
          adm?.patient?.full_name.toLowerCase().includes(q) ||
          adm?.patient?.uhid.toLowerCase().includes(q);
        return bedMatch || patientMatch;
      }
      return true;
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_20px_rgba(29,119,255,0.04)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100/80 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
              <BedDouble className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                  Live Ward &amp; Bed Floor View
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Live Floor Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time bed availability matrix across all wings, intensive care units, and wards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
              title="Refresh Floor Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              href="/ward-master"
              className="px-4 py-2 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              Ward Master Studio
            </Link>
            <Link
              href="/admit"
              className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/25"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Admit Patient
            </Link>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bed Capacity</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalBeds}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{wards.length} Active Wards</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Vacant / Ready</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{vacantBeds}</h3>
              <p className="text-[11px] text-emerald-700/80 mt-0.5 font-medium">Ready for intake</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Occupied</p>
              <h3 className="text-2xl font-black text-brand-600 mt-1">{occupiedBeds}</h3>
              <p className="text-[11px] text-brand-700/80 mt-0.5 font-medium">{occupancyRate}% Floor Load</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Sanitizing / Cleaning</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{cleaningBeds}</h3>
              <p className="text-[11px] text-amber-700/80 mt-0.5 font-medium">Discharged / Turnaround</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* CONTROLS: WARD TABS + STATUS FILTER + SEARCH */}
        <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Ward Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedWardId('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                  selectedWardId === 'all'
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Wards ({totalBeds})
              </button>
              {wards.map((ward) => {
                const wardBeds = beds.filter((b) => b.ward_id === ward.id);
                const occ = wardBeds.filter((b) => b.status === 'occupied').length;
                return (
                  <button
                    key={ward.id}
                    onClick={() => setSelectedWardId(ward.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                      selectedWardId === ward.id
                        ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{ward.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedWardId === ward.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      {occ}/{wardBeds.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('vacant')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'vacant' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Vacant ({vacantBeds})
              </button>
              <button
                onClick={() => setStatusFilter('occupied')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'occupied' ? 'bg-brand-600 text-white' : 'bg-blue-50 text-brand-700 hover:bg-blue-100'
                }`}
              >
                Occupied ({occupiedBeds})
              </button>
              <button
                onClick={() => setStatusFilter('cleaning')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'cleaning' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Cleaning ({cleaningBeds})
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by bed number (e.g. ICU-02), patient name, or UHID..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-blue-50 shadow-sm">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Connecting to Supabase Hospital Data...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving live floor state and active admissions</p>
          </div>
        )}

        {/* WARDS SECTION LOOP */}
        {!loading && displayWards.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-blue-50 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Wards Configured</h3>
            <p className="text-xs text-slate-500 mt-1">Configure your hospital wards in Ward Master Studio.</p>
            <Link
              href="/ward-master"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/25"
            >
              <Sliders className="w-4 h-4" /> Open Ward Master Studio
            </Link>
          </div>
        )}

        {!loading &&
          displayWards.map((ward) => {
            const wardBeds = filterBeds(beds.filter((b) => b.ward_id === ward.id));
            const totalInWard = beds.filter((b) => b.ward_id === ward.id).length;
            const occupiedInWard = beds.filter((b) => b.ward_id === ward.id && b.status === 'occupied').length;
            const wardOccPct = totalInWard > 0 ? Math.round((occupiedInWard / totalInWard) * 100) : 0;

            return (
              <div
                key={ward.id}
                className="bg-white rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] overflow-hidden"
              >
                {/* Ward Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/60 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center text-brand-600 font-black text-sm shrink-0">
                      {ward.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-800">{ward.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {ward.floor_number}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-brand-600 border border-blue-100">
                          ₹{ward.base_price_per_day}/day
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ward.department} • Capacity: {totalInWard} Beds
                      </p>
                    </div>
                  </div>

                  {/* Ward Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          wardOccPct > 85
                            ? 'bg-rose-500'
                            : wardOccPct > 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${wardOccPct}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 min-w-[70px]">
                      {occupiedInWard}/{totalInWard} ({wardOccPct}%)
                    </span>
                  </div>
                </div>

                {/* Bed Grid */}
                <div className="p-4 sm:p-5">
                  {wardBeds.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No beds match the current filter or search criteria in this ward.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {wardBeds.map((bed) => {
                        const admission = getActiveAdmission(bed.id);

                        return (
                          <div
                            key={bed.id}
                            className={`rounded-2xl p-4 border transition-all duration-200 relative group flex flex-col justify-between ${
                              bed.status === 'vacant'
                                ? 'bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10'
                                : bed.status === 'occupied'
                                ? 'bg-gradient-to-br from-white to-blue-50/40 border-blue-200 hover:border-brand-400 hover:shadow-md hover:shadow-brand-500/10'
                                : 'bg-gradient-to-br from-white to-amber-50/40 border-amber-200 hover:border-amber-400'
                            }`}
                          >
                            {/* Card Header */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                  <BedDouble className="w-4 h-4 text-brand-500" />
                                  {bed.bed_number}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    bed.status === 'vacant'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : bed.status === 'occupied'
                                      ? 'bg-brand-100 text-brand-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {bed.status}
                                </span>
                              </div>

                              {/* Features Chips */}
                              <div className="flex items-center gap-1 mb-3 flex-wrap">
                                {bed.has_oxygen && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                    O₂
                                  </span>
                                )}
                                {bed.has_ventilator && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                    VENT
                                  </span>
                                )}
                                {bed.has_cardiac_monitor && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                                    MONITOR
                                  </span>
                                )}
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  ₹{bed.price_per_day || ward.base_price_per_day}/d
                                </span>
                              </div>

                              {/* Patient Info or Vacant Prompt */}
                              {bed.status === 'occupied' && admission?.patient ? (
                                <div className="space-y-1.5 bg-white/90 p-2.5 rounded-xl border border-blue-100/70 mb-3 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-extrabold text-xs text-slate-800 truncate">
                                      {admission.patient.full_name}
                                    </h5>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {admission.patient.age}y / {admission.patient.gender[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-mono">
                                    UHID: {admission.patient.uhid}
                                  </p>
                                  <p className="text-[11px] text-slate-600 font-medium truncate flex items-center gap-1">
                                    <Stethoscope className="w-3 h-3 text-brand-500 shrink-0" />
                                    {admission.provisional_diagnosis}
                                  </p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    Adm: {new Date(admission.admission_date).toLocaleDateString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              ) : bed.status === 'cleaning' ? (
                                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 mb-3 text-center">
                                  <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1 animate-pulse" />
                                  <p className="text-xs font-bold text-amber-800">Under Sanitization</p>
                                  <p className="text-[10px] text-amber-600">
                                    Bed vacated. Sanitization protocol in progress.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 mb-3 text-center">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                  <p className="text-xs font-bold text-emerald-800">Vacant &amp; Cleaned</p>
                                  <p className="text-[10px] text-emerald-600">Available for instant intake</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                              {bed.status === 'vacant' && (
                                <Link
                                  href={`/admit?bedId=${bed.id}`}
                                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  Admit Patient
                                </Link>
                              )}

                              {bed.status === 'occupied' && (
                                <>
                                  <Link
                                    href={admission ? `/transfers?admissionId=${admission.id}` : `/transfers?bedId=${bed.id}`}
                                    className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
                                    title="Shift / Transfer Bed"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                    Shift
                                  </Link>
                                  <Link
                                    href={admission ? `/discharge?admissionId=${admission.id}` : `/discharge?bedId=${bed.id}`}
                                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
                                    title="Discharge or Refer"
                                  >
                                    <LogOut className="w-3 h-3" />
                                    Discharge
                                  </Link>
                                </>
                              )}

                              {bed.status === 'cleaning' && (
                                <button
                                  onClick={() => handleMarkClean(bed.id)}
                                  className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition flex items-center justify-center gap-1"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Mark as Ready / Vacant
                                </button>
                              )}

                              {bed.status === 'maintenance' && (
                                <button
                                  onClick={() => handleMarkClean(bed.id)}
                                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Restore to Vacant
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </AppShell>
  );
}
