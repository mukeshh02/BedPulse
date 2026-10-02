'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Search,
  Calendar,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { DataService } from '@/lib/supabase';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [totalOccupied, setTotalOccupied] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const currentDay = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  useEffect(() => {
    DataService.getBeds().then((beds) => {
      setTotalBeds(beds.length);
      setTotalOccupied(beds.filter((b) => b.status === 'occupied').length);
    });
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, badge: null },
    { href: '/admit', label: 'Patient Admission', icon: UserPlus, badge: 'Step 1 & 2', badgeClass: 'bg-blue-50 text-brand-600 border-blue-100' },
    { href: '/transfers', label: 'Bed Transfers', icon: ArrowRightLeft, badge: 'Step 3', badgeClass: 'bg-amber-50 text-amber-600 border-amber-100' },
    { href: '/discharge', label: 'Discharge & Refer', icon: LogOut, badge: 'Step 4', badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { href: '/patients', label: 'Inpatient Directory', icon: Users, badge: `${totalOccupied} Active`, badgeClass: 'bg-slate-100 text-slate-700' },
    { href: '/wards', label: 'Live Ward View', icon: BedDouble, badge: `${totalOccupied}/${totalBeds}`, badgeClass: 'bg-emerald-50 text-emerald-600' },
    { href: '/ward-master', label: 'Ward Master Studio', icon: Sliders, badge: 'Studio', badgeClass: 'bg-purple-50 text-purple-600 border-purple-100' },
    { href: '/profile', label: 'Doctor Profile', icon: User, badge: null },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/patients?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden p-2 sm:p-3 md:p-5 gap-5 font-sans bg-[#F1F6FD] relative">
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-white rounded-3xl p-5 flex flex-col justify-between border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.06)] shrink-0 select-none hidden lg:flex">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-2 pt-1 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
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
          </Link>

          {/* Navigation Menu */}
          <nav aria-label="Main Navigation" className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full font-semibold px-4 py-3 rounded-2xl flex items-center justify-between transition-all group ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                    <span>{link.label}</span>
                  </div>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  ) : link.badge ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${link.badgeClass}`}>
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support & Reset Footer */}
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

          <button
            onClick={() => {
              if (confirm('Reset to standard demo hospital data (6 Wards, 33 Beds)?')) {
                DataService.resetToDemo();
              }
            }}
            className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 py-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Demo Data
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between pb-3 px-1 shrink-0 gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-blue-100 shadow-sm text-slate-700 hover:bg-slate-50 transition"
              title="Open Navigation Drawer"
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

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, UHID, ward, bed... (Press Enter)"
              className="w-full bg-white pl-10 pr-4 py-2 text-xs rounded-full border border-blue-100/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition placeholder:text-slate-400"
            />
          </form>

          {/* Quick Action Capsules */}
          <div className="flex items-center gap-2">
            <a
              href="tel:+917000371321"
              title="Helpline: 7000371321"
              className="w-9 h-9 rounded-full bg-white border border-blue-100/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-500 hover:shadow transition"
            >
              <Phone className="w-4 h-4" />
            </a>

            <Link
              href="/profile"
              title="Duty Alarms"
              className="w-9 h-9 rounded-full bg-white border border-blue-100/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-500 hover:shadow transition relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
            </Link>

            {/* Profile Link */}
            <Link
              href="/profile"
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
            </Link>
          </div>
        </header>

        {/* SCROLLABLE PAGE BODY */}
        <main className="flex-1 overflow-y-auto pr-1 pb-24 lg:pb-6">
          {children}

          {/* Persistent Footer */}
          <footer className="pt-8 pb-3 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-500">
              BedPulse™ — Smart Inpatient &amp; Ward Care OS
            </p>
            <p className="mt-0.5">
              Developed by <strong className="text-slate-700">WebVission</strong> • Support Helpline:{' '}
              <a href="tel:+917000371321" className="text-brand-600 font-bold hover:underline">
                +91 7000371321
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="h-16 px-3 flex items-center justify-around max-w-lg mx-auto">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition ${
              pathname === '/' ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Overview</span>
          </Link>

          <Link
            href="/wards"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition ${
              pathname === '/wards' ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <BedDouble className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Wards</span>
          </Link>

          {/* Center FAB */}
          <Link href="/admit" className="flex flex-col items-center justify-center -mt-6 group">
            <div className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/35 flex items-center justify-center transition group-active:scale-95">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-1 font-bold text-brand-600">Admit</span>
          </Link>

          <Link
            href="/patients"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition ${
              pathname === '/patients' ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Patients</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition ${
              pathname === '/profile' ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex lg:hidden">
          <div className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900">BedPulse™</h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 mt-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full font-semibold px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs transition ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${link.badgeClass}`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              <p className="font-bold text-slate-700">BedPulse™ by WebVission</p>
              <p className="mt-0.5">📞 +91 7000371321</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
