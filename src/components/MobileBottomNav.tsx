'use client';

import React from 'react';
import { LayoutDashboard, BedDouble, UserPlus, Users, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAdmission: () => void;
  onOpenDirectory: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAdmission,
  onOpenDirectory,
  onOpenProfile,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="h-16 px-3 flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Overview */}
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition ${
            currentTab === 'overview' ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Overview</span>
        </button>

        {/* 2. Wards */}
        <button
          onClick={() => {
            onTabChange('overview');
            const el = document.getElementById('ward-grid-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-400 hover:text-slate-700 transition"
        >
          <BedDouble className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Wards</span>
        </button>

        {/* 3. Center FAB: Admissions */}
        <button
          onClick={onOpenAdmission}
          className="flex flex-col items-center justify-center -mt-6 group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/35 flex items-center justify-center transition group-active:scale-95">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-[10px] mt-1 font-bold text-brand-600">Admit</span>
        </button>

        {/* 4. Patients Directory */}
        <button
          onClick={onOpenDirectory}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-400 hover:text-slate-700 transition"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Patients</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-slate-400 hover:text-slate-700 transition"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
