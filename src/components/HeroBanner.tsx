'use client';

import React from 'react';
import { UserPlus, ArrowRightLeft, LogOut } from 'lucide-react';
import Image from 'next/image';

interface HeroBannerProps {
  availableBeds: number;
  totalBeds: number;
  onOpenAdmission: () => void;
  onOpenTransfer: () => void;
  onOpenDischarge: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  availableBeds,
  totalBeds,
  onOpenAdmission,
  onOpenTransfer,
  onOpenDischarge,
}) => {
  return (
    <section className="bg-gradient-to-r from-[#1871E8] via-[#247BFA] to-[#3B8EFE] text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl shadow-blue-500/15">
      {/* Subtle Glow & Background Shapes */}
      <div className="absolute -right-10 -bottom-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute right-72 top-4 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome Dr. Alexander!</h2>
          <span className="text-2xl animate-pulse">👋</span>
        </div>
        <p className="text-blue-100 text-xs sm:text-sm mt-1 font-medium">
          Have an exceptional clinical rounds day!
        </p>
        <p className="text-sm font-medium text-white/95 mt-3 leading-relaxed">
          Hospital Bed & Inpatient Flow is running smoothly today.{' '}
          <span className="underline decoration-blue-300 font-bold">
            {availableBeds} of {totalBeds} beds
          </span>{' '}
          are currently vacant/sanitized and ready for instant admission.
        </p>

        {/* 3 Quick Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAdmission}
            className="px-4 py-2.5 bg-white text-brand-600 rounded-2xl text-xs font-bold shadow-md shadow-black/10 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-brand-500" />
            <span>Admit Patient</span>
          </button>

          <button
            onClick={onOpenTransfer}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-semibold backdrop-blur-sm transition flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4 text-white" />
            <span>Shift Bed</span>
          </button>

          <button
            onClick={onOpenDischarge}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-semibold backdrop-blur-sm transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>Discharge / Refer</span>
          </button>
        </div>
      </div>

      {/* Doctor Cutout Image on the Right */}
      <div className="hidden md:block absolute right-4 bottom-0 w-64 lg:w-72 h-[120%] pointer-events-none select-none">
        <div className="relative w-full h-full">
          <Image
            src="/assets/doctor.png"
            alt="Doctor"
            fill
            className="object-contain object-bottom drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
};
