'use client';

import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  BedDouble,
  Sliders,
  Phone,
  RefreshCw,
  HeartPulse,
  Users,
  User,
} from 'lucide-react';
import { DataService } from '@/lib/supabase';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAdmission: () => void;
  onOpenTransfer: () => void;
  onOpenDischarge: () => void;
  onOpenWardMaster: () => void;
  onOpenDirectory: () => void;
  onOpenProfile: () => void;
  totalOccupied: number;
  totalBeds: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAdmission,
  onOpenTransfer,
  onOpenDischarge,
  onOpenWardMaster,
  onOpenDirectory,
  onOpenProfile,
  totalOccupied,
  totalBeds,
}) => {
  return (
    <aside className="w-72 bg-white rounded-3xl p-5 flex flex-col justify-between border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.06)] shrink-0 select-none hidden lg:flex">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                BedPulse<span className="text-brand-500">™</span>
              </h1>
            </div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100/80">
              Inpatient Care OS
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav aria-label="Main Navigation" className="flex flex-col gap-1.5">
          {/* Overview */}
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full font-semibold px-4 py-3 rounded-2xl flex items-center justify-between transition-all group ${
              currentTab === 'overview'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </div>
            {currentTab === 'overview' && <span className="w-2 h-2 rounded-full bg-white"></span>}
          </button>

          {/* Step 1 & 2: Admission */}
          <button
            onClick={onOpenAdmission}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              <span>Patient Admission</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-brand-600 px-2 py-0.5 rounded-full border border-blue-100">
              Step 1 & 2
            </span>
          </button>

          {/* Step 3: Bed Transfers */}
          <button
            onClick={onOpenTransfer}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span>Bed Transfers</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
              Step 3
            </span>
          </button>

          {/* Step 4: Discharge & Refer */}
          <button
            onClick={onOpenDischarge}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <span>Discharge & Refer</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
              Step 4
            </span>
          </button>

          {/* Inpatients Directory */}
          <button
            onClick={onOpenDirectory}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              <span>Inpatient Directory</span>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {totalOccupied}
            </span>
          </button>

          {/* Live Ward View */}
          <button
            onClick={() => {
              setCurrentTab('overview');
              const el = document.getElementById('ward-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <BedDouble className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              <span>Live Ward View</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {totalOccupied}/{totalBeds}
            </span>
          </button>

          {/* Dynamic Ward & Bed Master (Settings) */}
          <button
            onClick={onOpenWardMaster}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              <span>Ward Master Studio</span>
            </div>
            <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
              Dynamic
            </span>
          </button>

          {/* Doctor Profile & Settings */}
          <button
            onClick={onOpenProfile}
            className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 py-3 rounded-2xl flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              <span>Doctor Profile</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </nav>
      </div>

      {/* Bottom WebVission Support & Reset Card */}
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100/70 p-4 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              +
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Need System Support?</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">WebVission Health Tech</p>
              <p className="text-[11px] font-semibold text-brand-600 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> +91 7000371321
              </p>
            </div>
          </div>
          <a
            href="tel:+917000371321"
            className="mt-3 block text-center w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Call Support Desk
          </a>
        </div>

        
      </div>
    </aside>
  );
};
