'use client';

import React from 'react';
import { Search, Phone, Bell, Calendar, Menu, User } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenMobileMenu?: () => void;
  onOpenProfile?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenMobileMenu,
  onOpenProfile,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const currentDay = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <header className="h-16 flex items-center justify-between pb-3 px-1 shrink-0 gap-3">
      {/* Mobile Menu trigger & Date Selector Pill */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-white border border-blue-100 shadow-sm text-slate-700 hover:bg-slate-50 transition"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="bg-white px-3.5 py-2 rounded-full border border-blue-100/80 shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          <span className="hidden sm:inline">{currentDate}</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="bg-blue-50 text-brand-600 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {currentDay}
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patient, UHID, ward, bed..."
          className="w-full bg-white pl-10 pr-4 py-2 text-xs rounded-full border border-blue-100/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition placeholder:text-slate-400"
        />
      </div>

      {/* Right Quick Action Capsules */}
      <div className="flex items-center gap-2">
        {/* Support Call */}
        <a
          href="tel:+917000371321"
          title="Direct Support Line: 7000371321"
          className="w-9 h-9 rounded-full bg-white border border-blue-100/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-500 hover:shadow transition"
        >
          <Phone className="w-4 h-4" />
        </a>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-full bg-white border border-blue-100/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-500 hover:shadow transition relative"
          onClick={() => alert('No critical unread system alarms.')}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Capsule (Clickable -> Opens DoctorProfileModal) */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-white pl-1.5 pr-3.5 py-1 rounded-full border border-blue-100/80 shadow-sm select-none hover:border-brand-300 transition text-left"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            Dr
          </div>
          <div className="leading-tight hidden md:block">
            <p className="text-xs font-bold text-slate-800">Dr. Alexander</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              On Duty Rounds
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
