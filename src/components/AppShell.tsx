'use client';
import { startNavigation } from '@/components/LoadingFeedback';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ShieldCheck,
  Lock,
  Stethoscope,
  ChevronDown,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { HospitalService } from '@/lib/hospital';
import { DataService } from '@/lib/supabase';
import { AuthService, ActiveStaff, StaffRole, defaultDoctor, defaultNurse, defaultAdmin } from '@/lib/auth';

interface AppShellProps {
  children: React.ReactNode;
  activeStaff?: ActiveStaff | null;
}

export const AppShell: React.FC<AppShellProps> = ({ children, activeStaff: propStaff }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [totalOccupied, setTotalOccupied] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Active staff state
  const [authChecked, setAuthChecked] = useState(false);
  const [staff, setStaff] = useState<ActiveStaff | null>(propStaff || null);

  useEffect(() => {
    void AuthService.refresh().then(current => {
    if (!current) {
      (startNavigation(), router.replace)('/setup');
      return;
    }
    setStaff(current);
    setAuthChecked(true);
    }).catch(() => (startNavigation(), router.replace)('/setup'));

    const handleAuthChange = () => {
      const updated = AuthService.getCurrentStaff();
      if (!updated) {
        (startNavigation(), router.replace)('/');
      } else {
        setStaff(updated);
      }
    };

    window.addEventListener('auth_change', handleAuthChange);
    const handleStorage = (event: StorageEvent) => { if(event.key?.includes('auth-token')) void AuthService.refresh().then(handleAuthChange).catch(() => {}); };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [propStaff, router]);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const currentDay = new Date().toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' });
  const mobileDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  const mobileDay = new Date().toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' });

  useEffect(() => {
    DataService.getBeds().then((beds) => {
      setTotalBeds(beds.length);
      setTotalOccupied(beds.filter((b) => b.status === 'occupied').length);
    }).catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await AuthService.logout();
    (startNavigation(), router.push)('/login');
  };

  const allNavLinks = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      rolePriority: ['Doctor', 'Nurse', 'Admin'],
    },
    {
      href: '/admit',
      label: 'Patient Admission',
      icon: UserPlus,
      badge: 'Step 1 & 2',
      badgeClass: 'bg-brand-50 text-brand-600 border-brand-100',
      rolePriority: ['Doctor', 'Nurse', 'Admin'],
    },
    {
      href: '/transfers',
      label: 'Bed Transfers',
      icon: ArrowRightLeft,
      badge: 'Step 3',
      badgeClass: 'bg-amber-50 text-amber-600 border-amber-100',
      rolePriority: ['Doctor', 'Nurse', 'Admin'],
    },
    {
      href: '/discharge',
      label: 'Discharge & Refer',
      icon: LogOut,
      badge: 'Step 4',
      badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rolePriority: ['Doctor', 'Admin'],
    },
    {
      href: '/patients',
      label: 'Inpatient Directory',
      icon: Users,
      badge: `${totalOccupied} Active`,
      badgeClass: 'bg-slate-100 text-slate-700',
      rolePriority: ['Doctor', 'Nurse', 'Admin'],
    },
    {
      href: '/wards',
      label: 'Live Ward View',
      icon: BedDouble,
      badge: `${totalOccupied}/${totalBeds}`,
      badgeClass: 'bg-emerald-50 text-emerald-600',
      rolePriority: ['Nurse', 'Doctor', 'Admin'],
    },
    {
      href: '/profile',
      label: staff?.role === 'Doctor' ? 'Doctor Profile' : staff?.role === 'Nurse' ? 'Nurse Profile' : 'Admin Profile',
      icon: User,
      badge: null,
      rolePriority: ['Doctor', 'Nurse', 'Admin'],
    },
    {
      href: '/settings',
      label: 'Hospital Settings',
      icon: Settings,
      badge: 'Master',
      badgeClass: 'bg-brand-100 text-brand-700 font-bold border-brand-200',
      rolePriority: ['Doctor', 'Admin'],
    },
  ];

  const currentRole = staff?.role || 'Doctor';
  const visibleNavLinks = allNavLinks.filter((link) => link.rolePriority.includes(currentRole));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      (startNavigation(), router.push)(`/patients?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const roleMeta = AuthService.getRoleMeta(staff?.role || 'Doctor');

  if (!authChecked || !staff) {
    return <div role="status" aria-label="Loading workspace" className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-2.5 text-[#183E33]"><HeartPulse size={26} strokeWidth={1.8} /><span className="text-xl font-semibold tracking-tight">BedPulse</span></div>
        <span aria-hidden="true" className="h-5 w-5 rounded-full border-2 border-[#DCE7DC] border-t-[#63816C] animate-spin" />
        <span className="sr-only">Loading workspace…</span>
      </div>
    </div>;
  }

  return (
    <div className={`flex h-screen overflow-hidden p-2 sm:p-3 md:p-5 gap-5 font-sans bg-[#F8FAF9] relative workspace-theme`}>
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-white rounded-3xl p-5 flex flex-col justify-between border border-brand-50/80 shadow-[0_10px_35px_rgba(24,62,51,0.06)] shrink-0 select-none hidden lg:flex">
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Brand Header */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 pt-1 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  {HospitalService.current()?.hospital.name || 'BedPulse'}<span className="text-brand-500">™</span>
                </h1>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100/80">
                Inpatient Care OS
              </span>
            </div>
          </Link>

          {/* ACTIVE STAFF PROFILE CARD */}
          <div className="bg-slate-50/90 border border-slate-100 p-3 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {staff?.avatar ? (
                  <div className="w-9 h-9 rounded-xl overflow-hidden relative border border-white shadow-xs">
                    <Image src={staff.avatar} alt={staff.name} fill className="object-cover object-top" />
                  </div>
                ) : (
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-white text-xs shadow-xs ${
                      staff?.role === 'Doctor' ? 'bg-brand-500' : staff?.role === 'Nurse' ? 'bg-emerald-500' : 'bg-brand-600'
                    }`}
                  >
                    {staff?.role === 'Doctor' ? 'MD' : staff?.role === 'Nurse' ? 'RN' : 'ADM'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>

              <div className="leading-tight min-w-0 flex-1">
                <h4 className="font-extrabold text-xs text-slate-900 truncate">
                  {staff?.name || 'Medical Staff'}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                      staff?.role === 'Doctor'
                        ? 'bg-brand-100/80 text-brand-700'
                        : staff?.role === 'Nurse'
                        ? 'bg-emerald-100/80 text-emerald-700'
                        : 'bg-brand-100/80 text-brand-700'
                    }`}
                  >
                    {staff?.role || 'Doctor'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{staff?.sector}</span>
                </div>
              </div>
            </div>

            {/* Staff Duty Info */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Shift
              </span>
              <Link
                href="/profile"
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
              >
                Profile &rarr;
              </Link>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav aria-label="Main Navigation" className="flex flex-col gap-1.5">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full font-semibold px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all group text-xs ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                    <span>{link.label}</span>
                  </div>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  ) : false ? (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${link.badgeClass}`}>
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support, Logout & Reset Footer */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="bg-gradient-to-br from-brand-50 to-brand-50/60 border border-brand-100/70 p-3 rounded-2xl relative overflow-hidden shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                +
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[11px]">System Support</h4>
                <p className="text-[10px] text-slate-500">WebVission Health Tech</p>
                <a href="tel:+917000371321" className="text-[10px] font-bold text-brand-600 mt-0.5 flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" /> +91 7000371321
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              title="Sign Out to Landing Page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between pb-3 px-1 shrink-0 gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-brand-100 shadow-sm text-slate-700 hover:bg-slate-50 transition"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="bg-white px-2 sm:px-3 py-1.5 rounded-full border border-brand-100/80 shadow-xs flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden sm:inline">{currentDate}</span>
              <span className="sm:hidden">{mobileDate}</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="hidden sm:inline">{currentDay}</span>
                <span className="sm:hidden">{mobileDay}</span>
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
              placeholder="Search patients, wards or beds"
              className="w-full bg-white pl-10 pr-4 py-2 text-xs rounded-full border border-brand-100/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition placeholder:text-slate-400"
            />
          </form>

          {/* Quick Action Capsules */}
          <div className="flex items-center gap-2 relative">
            <a
              href="tel:+917000371321"
              title="Support Helpline: 7000371321"
              className="w-9 h-9 rounded-full bg-white border border-brand-100/80 shadow-xs flex items-center justify-center text-slate-600 hover:text-brand-500 hover:shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* PERSONA & ROLE SWITCHER CAPSULE */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 bg-white pl-1.5 pr-3 py-1 rounded-full border border-brand-100/80 shadow-xs select-none hover:border-brand-300 transition text-left"
              >
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-semibold text-[11px] shadow-xs ${
                    staff?.role === 'Doctor' ? 'bg-brand-500' : staff?.role === 'Nurse' ? 'bg-emerald-500' : 'bg-brand-600'
                  }`}
                >
                  {staff?.role === 'Doctor' ? 'MD' : staff?.role === 'Nurse' ? 'RN' : 'AD'}
                </div>
                <div className="leading-tight hidden md:block">
                  <p className="text-xs font-bold text-slate-800">
                    {staff?.name || 'Medical Staff'}
                  </p>
                  <p className="text-[10px] font-extrabold flex items-center gap-1 text-brand-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {staff?.role || 'Doctor'} Mode
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Staff Account Dropdown */}
              {roleMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-3.5 shadow-xl border border-brand-100 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
                >
                  <div className="px-3 py-2 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Hospital Session
                      </span>
                      <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        staff?.role === 'Doctor'
                          ? 'bg-brand-100 text-brand-700'
                          : staff?.role === 'Nurse'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-brand-100 text-brand-700'
                      }`}>
                        {staff?.role}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-1">{staff?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{staff?.email}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sector: {staff?.sector || 'General Ward'}</p>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full px-3 py-2 rounded-2xl text-left text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2.5 transition"
                    >
                      <User className="w-4 h-4 text-brand-500" />
                      <div>
                        <p>Staff Profile &amp; Roster</p>
                        <p className="text-[10px] font-normal text-slate-400">Duty sector &amp; hospital registry</p>
                      </div>
                    </Link>

                    {staff?.role === 'Admin' && (
                      <Link
                        href="/settings"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-2xl text-left text-xs font-bold text-brand-700 hover:bg-brand-50 flex items-center gap-2.5 transition"
                      >
                        <Settings className="w-4 h-4 text-brand-600" />
                        <div>
                          <p>Hospital Settings Hub</p>
                          <p className="text-[10px] font-normal text-brand-400">Wards, beds, doctors, staff</p>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2 px-3 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Shift</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE BODY */}
        <main data-pull-refresh-scroll className="overscroll-y-contain flex-1 overflow-y-auto pr-1 pb-24 lg:pb-6">
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
            href="/dashboard"
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition ${
              pathname === '/dashboard' ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-slate-700'
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
            <span className="text-[10px] mt-1 font-medium">{staff?.role || 'Profile'}</span>
          </Link>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex lg:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
          >
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

              {/* Mobile Staff Account Info */}
              <div className="my-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl text-white font-semibold text-xs flex items-center justify-center ${
                    staff?.role === 'Doctor' ? 'bg-brand-500' : staff?.role === 'Nurse' ? 'bg-emerald-500' : 'bg-brand-600'
                  }`}>
                    {staff?.role === 'Doctor' ? 'MD' : staff?.role === 'Nurse' ? 'RN' : 'AD'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{staff?.name}</p>
                    <p className="text-[10px] font-semibold text-brand-600">{staff?.role} Duty Active</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">Sector: {staff?.sector || 'General Ward'}</p>
              </div>

              <nav className="flex flex-col gap-1.5 mt-2">
                {visibleNavLinks.map((link) => {
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

            <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs text-slate-400">
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              <p className="font-bold text-slate-700">BedPulse™ by WebVission</p>
              <p className="text-[11px]">📞 +91 7000371321</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
