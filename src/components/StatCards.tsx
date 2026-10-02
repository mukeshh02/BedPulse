'use client';

import React from 'react';
import { Calendar, BedDouble, Sparkles, Building2 } from 'lucide-react';

interface StatCardsProps {
  occupiedCount: number;
  availableCount: number;
  cleaningCount: number;
  totalWards: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  occupiedCount,
  availableCount,
  cleaningCount,
  totalWards,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Admitted Patients */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-50/80 shadow-[0_10px_30px_rgba(29,119,255,0.04)] flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Admitted Patients</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">{occupiedCount}</h3>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              Active IPD
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>

      {/* 2. Available Beds */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-50/80 shadow-[0_10px_30px_rgba(29,119,255,0.04)] flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Available Beds</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">{availableCount}</h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              🟢 Ready
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
          <BedDouble className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>

      {/* 3. Sanitizing / Cleaning */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-50/80 shadow-[0_10px_30px_rgba(29,119,255,0.04)] flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Under Sanitization</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">{cleaningCount}</h3>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Cleaning
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>

      {/* 4. Active Wards */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-50/80 shadow-[0_10px_30px_rgba(29,119,255,0.04)] flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Configured Wards</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-800">{totalWards}</h3>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Master Units
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
};
