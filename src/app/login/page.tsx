'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Key,
  BadgeAlert,
  Eye,
  EyeOff,
  HeartPulse,
  Building2,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Phone,
  Sparkles,
  Lock,
} from 'lucide-react';

import { AuthService, ActiveStaff, StaffRole } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<StaffRole>('Doctor');
  const [staffId, setStaffId] = useState('alexander.m@bedpulse.health');
  const [password, setPassword] = useState('WardAlpha2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSector, setSelectedSector] = useState('ICU / Critical Care');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: StaffRole) => {
    setSelectedRole(role);
    if (role === 'Doctor') {
      setStaffId('alexander.m@bedpulse.health');
      setSelectedSector('ICU / Critical Care');
    } else if (role === 'Nurse') {
      setStaffId('priya.nurse@bedpulse.health');
      setSelectedSector('General Medical Ward');
    } else {
      setStaffId('admin@bedpulse.health');
      setSelectedSector('Hospital Operations');
    }
  };

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const staff: ActiveStaff = {
      name:
        selectedRole === 'Doctor'
          ? 'Dr. Alexander Wright, MD'
          : selectedRole === 'Nurse'
          ? 'Sister Priya Sharma'
          : 'Chief Administrator',
      title:
        selectedRole === 'Doctor'
          ? 'Chief of Inpatient Care & Intensive Care Unit'
          : selectedRole === 'Nurse'
          ? 'Head Staff Nurse & Nursing Lead'
          : 'Hospital Operations & Ward Director',
      role: selectedRole,
      sector: selectedSector,
      email: staffId,
      avatar: selectedRole === 'Doctor' ? '/assets/doctor.png' : '',
      loginTime: new Date().toISOString(),
    };

    AuthService.login(staff);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/');
    }, 400);
  };

  const sectors = [
    'ICU / Critical Care',
    'General Medical Ward',
    'Emergency & Triage',
    'Cardiology Wing',
    'Pediatric Care',
  ];

  return (
    <div className="min-h-screen bg-[#F1F6FD] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.08)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-100/60 blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-100/40 blur-xl pointer-events-none"></div>

        {/* Active Ward Status Pill */}
        <div className="flex items-center justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-600 border border-blue-100/80 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>St. Jude Care OS v2.4 • Active</span>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-5 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/30 mb-2.5">
            <HeartPulse className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome to BedPulse<span className="text-brand-500">™</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure Inpatient Care &amp; Clinical Rounds Shift OS
          </p>
        </div>

        {/* HIPAA & HL7 Security Banner */}
        <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-2xl mb-4 text-[11px] border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>HIPAA &amp; HL7 Audited Session</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-2xs border border-slate-200">
            Floor 4 Active
          </span>
        </div>

        {/* Role Switcher */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Operational Role
          </label>
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            {(['Doctor', 'Nurse', 'Admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition ${
                  selectedRole === role
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hospital Staff ID / Clinical Email *
            </label>
            <input
              type="text"
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-800"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Shift PIN or Access Password *
              </label>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> 256-bit Encrypted
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-slate-800 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Department Selector Chips */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Assign Immediate Ward Sector
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {sectors.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSector(s)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition shrink-0 ${
                    selectedSector === s
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 mt-2"
          >
            {isSubmitting ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Inpatient Care OS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <Link href="/register" className="text-brand-600 font-bold hover:underline">
            Register New Staff
          </Link>
          <Link href="/" className="text-slate-400 hover:text-slate-600">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* WebVission Footer */}
      <footer className="mt-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-500">WebVission Health Tech • BedPulse™ OS</p>
        <p className="mt-0.5">
          Support Helpline:{' '}
          <a href="tel:+917000371321" className="text-brand-600 font-bold hover:underline">
            +91 7000371321
          </a>
        </p>
      </footer>
    </div>
  );
}
