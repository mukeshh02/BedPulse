'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  BadgeAlert,
  Clock,
  Sun,
  BedDouble,
  Sliders,
  LogOut,
  Bell,
  CheckCircle2,
  Activity,
  HeartPulse,
} from 'lucide-react';
import Image from 'next/image';

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWardMaster: () => void;
  onLogout?: () => void;
  totalOccupied: number;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenWardMaster,
  totalOccupied,
}) => {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [shiftType, setShiftType] = useState('Day Shift (08:00 AM - 08:00 PM)');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#F9F9FF] rounded-3xl w-full max-w-lg border border-blue-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">BedPulse™ Staff Profile</h3>
              <p className="text-[10px] text-slate-400">Clinical Identity & Shift Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Scrollable Profile Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Profile Hero Card with Atmospheric Backdrop */}
          <div className="relative w-full rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(29,119,255,0.06)] flex flex-col items-center text-center overflow-hidden border border-blue-50">
            {/* Glow Orbs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-100/60 blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-emerald-100/50 blur-xl pointer-events-none"></div>

            {/* Avatar & Status Pulse */}
            <div className="relative mt-1 mb-2.5">
              <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-brand-200 p-0.5 shadow-sm flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/assets/doctor.png"
                    alt="Dr. Alexander Wright"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div
                className={`absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white ${
                  isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              </div>
            </div>

            {/* Doctor Identity */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-slate-900">Dr. Alexander Wright, MD</h2>
                <ShieldCheck className="w-4 h-4 text-brand-500" />
              </div>
              <p className="text-xs font-bold text-brand-600 mt-0.5">
                Chief of Inpatient Care & Critical Unit
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Department of Internal Medicine & ICU
              </p>
            </div>

            {/* Hospital Meta Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] flex items-center gap-1">
                <BadgeAlert className="w-3 h-3 text-slate-400" /> #BP-DOC-8021
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" /> Central Medical Center
              </span>
            </div>

            {/* On-Duty Rounds Toggle Pill */}
            <div className="mt-4 w-full flex items-center justify-between bg-blue-50/70 px-4 py-2.5 rounded-full border border-blue-100/80">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                ></span>
                <span className="font-bold text-slate-800 text-xs">
                  {isOnDuty ? 'Active On-Duty Rounds' : 'Off-Duty / Standby'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOnDuty(!isOnDuty)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  isOnDuty ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    isOnDuty ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Today's Shift & Patient Load Bento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" />
                Today&apos;s Shift &amp; Patient Load
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {isOnDuty ? 'In Progress' : 'Paused'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Shift Timing */}
              <div className="col-span-2 rounded-2xl bg-white p-3.5 shadow-sm border border-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Active Rotational Shift</p>
                    <p className="text-xs font-black text-slate-800">{shiftType}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full border border-blue-100">
                  Day Shift
                </span>
              </div>

              {/* Assigned Beds */}
              <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-blue-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Active Inpatients</span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                    <BedDouble className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{totalOccupied}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Patients</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              {/* Supervised Wards */}
              <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-blue-50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Supervised Units</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-bold text-slate-900 leading-tight">ICU &amp; General</span>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">High Acuity Priority</p>
                </div>
                <div className="flex items-center gap-1 mt-2.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Telemetry online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick System Preferences */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 px-1">Quick Preferences</span>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenWardMaster();
                }}
                className="w-full text-left rounded-2xl bg-white p-3 shadow-sm border border-blue-50 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dynamic Ward &amp; Bed Studio</p>
                    <p className="text-[10px] text-slate-400">Configure bed rates, ward wings &amp; capacity</p>
                  </div>
                </div>
                <span className="text-slate-400 text-xs">➔</span>
              </button>

              <div className="rounded-2xl bg-white p-3 shadow-sm border border-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Bedside Alert Notifications</p>
                    <p className="text-[10px] text-slate-400">Audio chime on critical O2/bed status change</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    notificationsEnabled ? 'bg-brand-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out / Switch Staff */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold transition flex items-center justify-center gap-2 border border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Duty Staff / Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
