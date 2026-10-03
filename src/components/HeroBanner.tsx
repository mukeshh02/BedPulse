'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRightLeft, LogOut, Stethoscope, HeartPulse, Sliders, BedDouble } from 'lucide-react';
import Image from 'next/image';
import { ActiveStaff } from '@/lib/auth';

interface HeroBannerProps {
  availableBeds: number;
  totalBeds: number;
  activeStaff?: ActiveStaff | null;
  onOpenAdmission: () => void;
  onOpenTransfer: () => void;
  onOpenDischarge: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  availableBeds,
  totalBeds,
  activeStaff,
  onOpenAdmission,
  onOpenTransfer,
  onOpenDischarge,
}) => {
  const staffRole = activeStaff?.role || 'Doctor';
  const staffName = activeStaff?.name || 'Medical Officer';

  return (
    <section className="bg-gradient-to-r from-[#183E33] via-[#285744] to-[#63816C] text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl shadow-brand-500/15">
      {/* Subtle Glow & Background Shapes */}
      <div className="absolute -right-10 -bottom-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute right-72 top-4 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Welcome, {staffName}!
          </h2>
          <span className="text-2xl animate-pulse">👋</span>
        </div>
        <p className="text-brand-100 text-xs sm:text-sm mt-1 font-medium">
          {staffRole === 'Doctor'
            ? 'Have an exceptional clinical rounds & inpatient care shift!'
            : staffRole === 'Nurse'
            ? 'Nursing station live: telemetry monitoring & rapid bed sanitization.'
            : 'Hospital Operations Command: Ward matrix, admissions & system capacity.'}
        </p>
        <p className="text-sm font-medium text-white/95 mt-3 leading-relaxed">
          Hospital Bed &amp; Inpatient Flow is running smoothly today.{' '}
          <span className="underline decoration-brand-300 font-bold">
            {availableBeds} of {totalBeds} beds
          </span>{' '}
          are currently vacant/sanitized and ready for instant admission.
        </p>

        {/* 3 Quick Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAdmission}
            className="px-4 py-2.5 bg-white text-brand-600 rounded-2xl text-xs font-bold shadow-md shadow-black/10 hover:bg-brand-50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
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

          {staffRole !== 'Nurse' ? (
            <button
              onClick={onOpenDischarge}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-semibold backdrop-blur-sm transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Discharge / Refer</span>
            </button>
          ) : (
            <Link
              href="/wards"
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-semibold backdrop-blur-sm transition flex items-center gap-2"
            >
              <BedDouble className="w-4 h-4 text-white" />
              <span>Live Ward Matrix</span>
            </Link>
          )}
        </div>
      </div>

      {/* Role Visual on the Right */}
      <div className="hidden md:block absolute right-4 bottom-0 w-64 lg:w-72 h-[120%] pointer-events-none select-none">
        <div className="relative w-full h-full flex items-end justify-center">
          {activeStaff?.avatar ? (
            <Image
              src={activeStaff.avatar}
              alt={staffName}
              fill
              className="object-contain object-bottom drop-shadow-2xl"
              priority
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white mb-6 shadow-2xl">
              {staffRole === 'Doctor' ? (
                <Stethoscope className="w-20 h-20 text-white/90 stroke-[1.5]" />
              ) : staffRole === 'Nurse' ? (
                <HeartPulse className="w-20 h-20 text-emerald-200 stroke-[1.5]" />
              ) : (
                <Sliders className="w-20 h-20 text-brand-200 stroke-[1.5]" />
              )}
              <span className="text-xs font-extrabold uppercase tracking-wider mt-2 bg-white/20 px-3 py-1 rounded-full">
                {staffRole} Station
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
