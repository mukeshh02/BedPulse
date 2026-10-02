'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import {
  User,
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
  Phone,
  Settings,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export default function ProfilePage() {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [shiftType, setShiftType] = useState('Day Shift (08:00 AM - 08:00 PM)');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [totalOccupied, setTotalOccupied] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);

  useEffect(() => {
    DataService.getBeds().then((beds) => {
      setTotalBeds(beds.length);
      setTotalOccupied(beds.filter((b) => b.status === 'occupied').length);
    });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* TOP BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_20px_rgba(29,119,255,0.04)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                  Doctor &amp; Clinical Staff Profile
                </h1>
                <span className="bg-brand-50 text-brand-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-brand-200">
                  Attending Consultant
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff credentials, duty round status, and personal shift telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Onboard Staff
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Switch Account
            </Link>
          </div>
        </div>

        {/* HERO DOCTOR BENTO */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar & Duty Indicator */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-blue-50 border-2 border-brand-200 p-1 shadow-md flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/assets/doctor.png"
                    alt="Dr. Alexander Wright"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div
                className={`absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-md border-2 border-white flex items-center gap-1 ${
                  isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {isOnDuty ? 'On Duty' : 'Off Duty'}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl font-black text-slate-900">Dr. Alexander Wright, MD</h2>
                    <ShieldCheck className="w-5 h-5 text-brand-500" />
                  </div>
                  <p className="text-xs font-bold text-brand-600">
                    Chief of Inpatient Care &amp; Intensive Care Unit
                  </p>
                </div>

                {/* Duty Toggle Button */}
                <button
                  onClick={() => setIsOnDuty(!isOnDuty)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                    isOnDuty
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>{isOnDuty ? 'Active Floor Rounds (Click to Pause)' : 'Paused (Click to Resume)'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2.5 py-1 rounded-xl font-mono font-semibold">
                  MCI: 2018-847291
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-xl font-semibold">
                  Dept: Critical Care &amp; Cardiology
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-xl font-semibold">
                  Sector: Wing Alpha &amp; Central ICU
                </span>
              </div>

              <p className="text-xs text-slate-600 pt-2 leading-relaxed">
                Supervising active floor admissions, bedside telemetry monitoring, inter-ward bed relocations, and hospital discharge clearances.
              </p>
            </div>
          </div>
        </div>

        {/* SHIFT TELEMETRY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Active Inpatients</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalOccupied}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {totalBeds} Total Beds</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Rounds Done</span>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">18/22</h4>
            <p className="text-[11px] text-emerald-700/80 mt-0.5 font-medium">81% Completed</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Bed Transfers</span>
            <h4 className="text-2xl font-black text-amber-600 mt-1">4</h4>
            <p className="text-[11px] text-amber-700/80 mt-0.5 font-medium">Audited &amp; Shifted</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Discharge Cleared</span>
            <h4 className="text-2xl font-black text-purple-600 mt-1">6</h4>
            <p className="text-[11px] text-purple-700/80 mt-0.5 font-medium">Beds Set to Cleaning</p>
          </div>
        </div>

        {/* PREFERENCES & ROSTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shift Details */}
          <div className="bg-white p-6 rounded-3xl border border-blue-50/80 shadow-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              Duty Schedule &amp; Shift Telemetry
            </h3>

            <div className="space-y-3 text-slate-600">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">Assigned Shift</span>
                <span className="font-semibold text-brand-600">Day Shift (08:00 - 20:00)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">Duty Nurse In-Charge</span>
                <span className="font-semibold text-slate-800">Sister Priya Sharma</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">Emergency Cardiac Pager</span>
                <span className="font-mono font-bold text-rose-600">CODE BLUE • EXT 401</span>
              </div>
            </div>
          </div>

          {/* Quick Support & WebVission Contact */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">WebVission Care OS</h3>
                <p className="text-[10px] text-slate-500">Hospital Tech Support &amp; Hotline</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              BedPulse™ provides intelligent ward telemetry, zero-friction bed turnover, and complete paperless admissions.
            </p>

            <div className="p-3 bg-white rounded-2xl border border-blue-100/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">SUPPORT HELPLINE:</span>
              <a
                href="tel:+917000371321"
                className="text-sm font-extrabold text-brand-600 flex items-center gap-1.5 hover:underline"
              >
                <Phone className="w-4 h-4" /> +91 7000371321
              </a>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/ward-master"
                className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition text-center shadow-md shadow-brand-500/25"
              >
                Ward Master Studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
