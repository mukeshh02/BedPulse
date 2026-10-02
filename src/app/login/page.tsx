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
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'Doctor' | 'Nurse' | 'Admin'>('Doctor');
  const [staffId, setStaffId] = useState('alexander.m@bedpulse.health');
  const [password, setPassword] = useState('WardAlpha2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSector, setSelectedSector] = useState('ICU / Critical Care');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: 'Doctor' | 'Nurse' | 'Admin') => {
    setSelectedRole(role);
    if (role === 'Doctor') {
      setStaffId('alexander.m@bedpulse.health');
    } else if (role === 'Nurse') {
      setStaffId('priya.nurse@bedpulse.health');
    } else {
      setStaffId('admin@bedpulse.health');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F1F6FD] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.08)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-blue-100/60 blur-xl pointer-events-none"></div>

        {/* Brand */}
        <div className="text-center mb-6 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/30 mb-3">
            <HeartPulse className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            BedPulse<span className="text-brand-500">™</span> Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Clinical Staff Authentication &amp; Sector Access</p>
        </div>

        {/* Role Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 mb-5">
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

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Staff ID / Medical Email *
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Shift Security PIN / Password *
            </label>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Duty Sector / Ward Assignment
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-800"
            >
              <option value="ICU / Critical Care">ICU / Intensive Care Wing</option>
              <option value="Male General Ward">Male General Ward (MGW)</option>
              <option value="Female General Ward">Female General Ward (FGW)</option>
              <option value="Emergency & Triage">Emergency &amp; Casualty Triage</option>
              <option value="All Wards (Admin Floor)">All Wards (Supervisory Level)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 mt-2"
          >
            {isSubmitting ? (
              <span>Authenticating Credentials...</span>
            ) : (
              <>
                <span>Access Inpatient OS</span>
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
          Helpline:{' '}
          <a href="tel:+917000371321" className="text-brand-600 font-bold hover:underline">
            +91 7000371321
          </a>
        </p>
      </footer>
    </div>
  );
}
