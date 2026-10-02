'use client';

import React, { useState } from 'react';
import { Ward, Bed, Admission } from '@/types';
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
} from 'lucide-react';

interface WardBedMatrixProps {
  wards: Ward[];
  beds: Bed[];
  admissions: Admission[];
  onAdmitToBed: (bed: Bed) => void;
  onShiftBed: (admission: Admission) => void;
  onDischargeBed: (admission: Admission) => void;
  onMarkBedClean: (bedId: string) => void;
}

export const WardBedMatrix: React.FC<WardBedMatrixProps> = ({
  wards,
  beds,
  admissions,
  onAdmitToBed,
  onShiftBed,
  onDischargeBed,
  onMarkBedClean,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>('all');

  // Filtered wards
  const displayWards =
    selectedWardId === 'all'
      ? wards
      : wards.filter((w) => w.id === selectedWardId);

  // Helper to find active admission for a bed
  const getActiveAdmission = (bedId: string) => {
    return admissions.find((a) => a.bed_id === bedId && a.status === 'admitted');
  };

  return (
    <section id="ward-grid-section" className="space-y-5">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-blue-50 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-brand-500" />
            <span>Live Ward & Bed Floor Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any vacant bed to admit, or click an occupied bed to shift or discharge.
          </p>
        </div>

        {/* Ward Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedWardId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
              selectedWardId === 'all'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Wards ({beds.length})
          </button>
          {wards.map((ward) => {
            const wardBeds = beds.filter((b) => b.ward_id === ward.id);
            const occupied = wardBeds.filter((b) => b.status === 'occupied').length;
            return (
              <button
                key={ward.id}
                onClick={() => setSelectedWardId(ward.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  selectedWardId === ward.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{ward.code}</span>
                <span className="text-[10px] opacity-80">
                  ({occupied}/{wardBeds.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ward Sections */}
      <div className="space-y-6">
        {displayWards.map((ward) => {
          const wardBeds = beds.filter((b) => b.ward_id === ward.id);
          const occupiedCount = wardBeds.filter((b) => b.status === 'occupied').length;
          const occupancyRate =
            wardBeds.length > 0 ? Math.round((occupiedCount / wardBeds.length) * 100) : 0;

          return (
            <div
              key={ward.id}
              className="bg-white rounded-3xl p-5 border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.03)] space-y-4"
            >
              {/* Ward Title & Capacity Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: ward.color_accent || '#1D77FF' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{ward.name}</h4>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {ward.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {ward.floor || 'Main Wing'} • {ward.description || 'Inpatient recovery'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700">
                      {occupiedCount} / {wardBeds.length} Occupied
                    </span>
                    <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${occupancyRate}%`,
                          backgroundColor:
                            occupancyRate > 80
                              ? '#F43F5E'
                              : occupancyRate > 50
                              ? '#F59E0B'
                              : '#10B981',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Beds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {wardBeds.map((bed) => {
                  const admission = getActiveAdmission(bed.id);

                  // 1. OCCUPIED BED
                  if (bed.status === 'occupied' && admission) {
                    const patient = admission.patient;
                    return (
                      <div
                        key={bed.id}
                        className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-3.5 flex flex-col justify-between transition hover:shadow-md relative group"
                      >
                        <div className="space-y-2">
                          {/* Bed & Status Pills */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-rose-200 shadow-xs">
                              {bed.bed_number}
                            </span>
                            <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              Occupied
                            </span>
                          </div>

                          {/* Patient Info */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {patient?.full_name || 'Patient'}
                              </p>
                              {patient?.gender && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                  {patient.gender === 'male' ? '♂' : '♀'} {patient.age}y
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {admission.admission_number}
                            </p>
                          </div>

                          {/* Diagnosis & Doctor */}
                          <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl space-y-1">
                            <p className="line-clamp-1 font-medium text-slate-800" title={admission.provisional_diagnosis}>
                              🩺 {admission.provisional_diagnosis}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-slate-400" />
                              {admission.admitting_doctor}
                            </p>
                          </div>
                        </div>

                        {/* Action Footer (Step 3: Shift, Step 4: Discharge) */}
                        <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center gap-1.5">
                          <button
                            onClick={() => onShiftBed(admission)}
                            className="flex-1 py-1.5 bg-white hover:bg-amber-50 text-amber-700 rounded-xl text-[11px] font-bold border border-amber-200 shadow-xs transition flex items-center justify-center gap-1"
                            title="Shift to another bed in this or another ward"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                            <span>Shift</span>
                          </button>

                          <button
                            onClick={() => onDischargeBed(admission)}
                            className="flex-1 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-bold border border-emerald-200 shadow-xs transition flex items-center justify-center gap-1"
                            title="Discharge or refer patient"
                          >
                            <LogOut className="w-3 h-3 text-emerald-500" />
                            <span>Discharge</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 2. CLEANING / SANITIZING BED
                  if (bed.status === 'cleaning') {
                    return (
                      <div
                        key={bed.id}
                        className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3.5 flex flex-col justify-between transition hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                              {bed.bed_number}
                            </span>
                            <span className="text-[10px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              Cleaning
                            </span>
                          </div>

                          <div className="py-2 text-center">
                            <Sparkles className="w-6 h-6 text-amber-400 mx-auto animate-pulse" />
                            <p className="text-xs font-bold text-slate-800 mt-1">Disinfection In Progress</p>
                            <p className="text-[10px] text-slate-400">{bed.room_type || 'Standard Bed'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => onMarkBedClean(bed.id)}
                          className="mt-3 w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Sanitized (Ready)</span>
                        </button>
                      </div>
                    );
                  }

                  // 3. VACANT / AVAILABLE BED (Step 1 & 2 trigger)
                  return (
                    <div
                      key={bed.id}
                      className="bg-emerald-50/30 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col justify-between transition hover:shadow-md group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                            {bed.bed_number}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Vacant
                          </span>
                        </div>

                        <div className="py-2 text-center">
                          <BedDouble className="w-6 h-6 text-emerald-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-700 mt-1">{bed.room_type || 'General Bed'}</p>
                          <p className="text-[10px] text-slate-400">₹{bed.daily_rate}/day</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onAdmitToBed(bed)}
                        className="mt-3 w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 group-hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Admit Patient Here</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
