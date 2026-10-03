'use client';

import React from 'react';
import { Ward, Bed } from '@/types';
import { PieChart } from 'lucide-react';

interface WardDonutChartProps {
  wards: Ward[];
  beds: Bed[];
}

export const WardDonutChart: React.FC<WardDonutChartProps> = ({ wards, beds }) => {
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const vacantBeds = beds.filter((b) => b.status === 'vacant').length;
  const cleaningBeds = beds.filter((b) => b.status === 'cleaning').length;

  const occupiedPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const vacantPercent = totalBeds > 0 ? Math.round((vacantBeds / totalBeds) * 100) : 0;
  const cleaningPercent = totalBeds > 0 ? 100 - occupiedPercent - vacantPercent : 0;

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (occupiedPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-5 border border-brand-50/80 shadow-[0_10px_35px_rgba(24,62,51,0.04)] flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-brand-500" />
          <span>Bed Occupancy Ratio</span>
        </h4>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          Live Census
        </span>
      </div>

      {/* Donut Chart & Center Metric */}
      <div className="flex items-center justify-center my-4 relative">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-slate-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Occupied Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-rose-500 transition-all duration-700 ease-out"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-semibold text-slate-900">{occupiedPercent}%</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Occupied
          </span>
        </div>
      </div>

      {/* Legend Pills */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
        <div className="bg-rose-50/70 p-1.5 rounded-xl border border-rose-100">
          <p className="text-[10px] font-bold text-rose-600">🔴 {occupiedBeds}</p>
          <p className="text-[9px] text-slate-500">In Use</p>
        </div>
        <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600">🟢 {vacantBeds}</p>
          <p className="text-[9px] text-slate-500">Vacant</p>
        </div>
        <div className="bg-amber-50/70 p-1.5 rounded-xl border border-amber-100">
          <p className="text-[10px] font-bold text-amber-600">🟡 {cleaningBeds}</p>
          <p className="text-[9px] text-slate-500">Clean</p>
        </div>
      </div>
    </div>
  );
};
