'use client';

import React from 'react';
import { Bed, Ward, Admission } from '@/types';
import { Activity, Wind, Heart, Sparkles, CheckCircle2, BedDouble } from 'lucide-react';

interface MobileLiveBedScrollerProps {
  beds: Bed[];
  wards: Ward[];
  admissions: Admission[];
  onSelectBed: (bed: Bed) => void;
  onViewMatrix: () => void;
}

export const MobileLiveBedScroller: React.FC<MobileLiveBedScrollerProps> = ({
  beds,
  wards,
  admissions,
  onSelectBed,
  onViewMatrix,
}) => {
  return (
    <section className="flex flex-col space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-brand-500" />
          <h3 className="text-xs font-bold text-slate-800">Bedside Telemetry &amp; Live Monitor</h3>
        </div>
        <button
          onClick={onViewMatrix}
          className="text-[11px] font-bold text-brand-600 hover:underline"
        >
          View All ({beds.length})
        </button>
      </div>

      {/* Horizontal Snap Scroll container */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
        {beds.slice(0, 10).map((bed) => {
          const admission = admissions.find((a) => a.bed_id === bed.id && a.status === 'admitted');
          const isOccupied = bed.status === 'occupied';
          const isCleaning = bed.status === 'cleaning';

          return (
            <div
              key={bed.id}
              onClick={() => onSelectBed(bed)}
              className="snap-start shrink-0 w-44 bg-white p-3 rounded-2xl shadow-[0_4px_16px_rgba(29,119,255,0.05)] border border-blue-50/80 flex flex-col justify-between space-y-2 cursor-pointer hover:border-brand-300 transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">
                  {bed.bed_number}
                </span>
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold ${
                    isOccupied
                      ? 'text-rose-600'
                      : isCleaning
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOccupied
                        ? 'bg-rose-500 animate-pulse'
                        : isCleaning
                        ? 'bg-amber-500 animate-bounce'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {isOccupied ? 'Occupied' : isCleaning ? 'Cleaning' : 'Vacant'}
                </span>
              </div>

              {/* Body */}
              <div>
                {isOccupied ? (
                  <>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {admission?.patient?.full_name || 'Inpatient Under Care'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
                        <Wind className="w-3 h-3" /> 98%
                      </span>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-rose-500">
                        <Heart className="w-3 h-3" /> 84 bpm
                      </span>
                    </div>
                  </>
                ) : isCleaning ? (
                  <>
                    <p className="text-xs font-bold text-slate-700 truncate flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Sanitizing
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ETA: ~12 mins</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-700 truncate flex items-center gap-1">
                      <BedDouble className="w-3 h-3 text-emerald-500" /> {bed.room_type}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Ready for Admit
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
