'use client';
import React, { useState } from 'react';
import { Ward, Bed, Admission } from '@/types';
import {
  Search,
  Sliders,
  BedDouble,
  Stethoscope,
  Wind,
  Heart,
  Thermometer,
  ArrowRightLeft,
  LogOut,
  User,
  X,
  Activity,
} from 'lucide-react';

interface InpatientsDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  wards: Ward[];
  beds: Bed[];
  admissions: Admission[];
  onShiftBed: (admission: Admission) => void;
  onDischargeBed: (admission: Admission) => void;
}

export const InpatientsDirectory: React.FC<InpatientsDirectoryProps> = ({
  isOpen,
  onClose,
  wards,
  beds,
  admissions,
  onShiftBed,
  onDischargeBed,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'discharge' | 'shifts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ward' | 'name' | 'date'>('ward');

  if (!isOpen) return null;

  const activeAdmissions = admissions.filter((a) => a.status === 'admitted');

  // Filter admissions
  const filtered = activeAdmissions.filter((adm) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = adm.patient?.full_name.toLowerCase().includes(q) || false;
    const uhidMatch = adm.patient?.uhid.toLowerCase().includes(q) || false;
    const diagMatch = adm.provisional_diagnosis.toLowerCase().includes(q) || false;
    const bed = beds.find((b) => b.id === adm.bed_id);
    const bedMatch = bed?.bed_number.toLowerCase().includes(q) || false;

    if (searchQuery && !(nameMatch || uhidMatch || diagMatch || bedMatch)) {
      return false;
    }

    if (filterTab === 'critical') {
      const ward = wards.find((w) => w.id === bed?.ward_id);
      return ward?.code === 'ICU';
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#F8FAF9] rounded-3xl w-full max-w-4xl border border-brand-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Admitted Inpatients Directory
                </h2>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                  {activeAdmissions.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Census Sync • {'BedPulse Hospital'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, UHID #IPD, diagnosis, or bed..."
              className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                filterTab === 'all'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({activeAdmissions.length})
            </button>
            <button
              onClick={() => setFilterTab('critical')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                filterTab === 'critical'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Critical / ICU
            </button>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching admitted patients found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((adm) => {
                const bed = beds.find((b) => b.id === adm.bed_id);
                const ward = wards.find((w) => w.id === bed?.ward_id);

                return (
                  <div
                    key={adm.id}
                    className="bg-white rounded-2xl p-4 border border-brand-50/80 shadow-[0_8px_25px_rgba(24,62,51,0.04)] space-y-3 flex flex-col justify-between"
                  >
                    {/* Patient Card Top */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100 shrink-0">
                          {adm.patient?.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                              {adm.patient?.full_name}
                            </h3>
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                              {adm.patient?.uhid}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {adm.patient?.gender === 'male' ? 'Male' : 'Female'}, {adm.patient?.age}y • Contact: {adm.patient?.mobile}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        🟢 Admitted
                      </span>
                    </div>

                    {/* Bed & Doctor assignment strip */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-brand-600">
                        <BedDouble className="w-4 h-4 text-brand-500" />
                        <span>
                          {bed?.bed_number} ({ward?.code})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[140px]">{adm.admitting_doctor}</span>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Diagnosis
                      </p>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {adm.provisional_diagnosis}
                      </p>
                    </div>

                    {/* Live Vitals Pill Row (Exact Stitch design) */}
                    <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-50 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400">SpO2</span>
                        <div className="flex items-center gap-1 font-bold text-emerald-600">
                          <Wind className="w-3 h-3" />
                          <span>98%</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400">Pulse</span>
                        <div className="flex items-center gap-1 font-bold text-rose-600">
                          <Heart className="w-3 h-3" />
                          <span>82 bpm</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400">Temp</span>
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Thermometer className="w-3 h-3" />
                          <span>98.4°F</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onShiftBed(adm);
                        }}
                        className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Transfer Bed</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onDischargeBed(adm);
                        }}
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Discharge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
