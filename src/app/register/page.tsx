'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Building2,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  Phone,
  AlertCircle,
  Lock,
  Mail,
  User,
  FileText,
  Badge,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [councilId, setCouncilId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('icu');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      return setErrorMsg('Please fill in all mandatory clinical credentials.');
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F1F6FD] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.08)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-100/60 blur-xl pointer-events-none"></div>

        {/* Top Navigation & Stage Bar */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-brand-600 transition"
              title="Back to Sign In"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
              <span>Step 1 of 3</span>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span className="text-brand-600">Verification &amp; Credentialing</span>
              <span>33%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-500 w-1/3"></div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 mb-5 border border-blue-100/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-500/20">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Create Staff Profile</h1>
              <p className="text-xs text-slate-500">
                Join your clinical care unit on <strong className="text-brand-600 font-bold">BedPulse™ OS</strong>
              </p>
            </div>
          </div>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-extrabold text-emerald-950">Registration Successful!</h3>
            <p className="text-xs text-emerald-700">
              Staff profile created and sector clearance granted. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field: Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="fullName">
                Staff Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. / Nurse / Admin Full Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Field: Medical Council Reg */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700" htmlFor="councilId">
                  Medical Council Reg. / Staff ID
                </label>
                <span className="text-[10px] text-slate-400">e.g. MCI-2021-98442</span>
              </div>
              <div className="relative flex items-center">
                <FileText className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  id="councilId"
                  type="text"
                  value={councilId}
                  onChange={(e) => setCouncilId(e.target.value.toUpperCase())}
                  placeholder="MCI-2021-98442"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono uppercase text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Field: Hospital Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="email">
                  Hospital Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@bedpulse.health"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="mobile">
                  Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                  <input
                    id="mobile"
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9826012345"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Doctor">Doctor / Consultant</option>
                  <option value="Nurse">Staff Nurse</option>
                  <option value="Admin">Ward Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Unit *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="icu">Intensive Care Unit (ICU)</option>
                  <option value="emergency">Emergency Medicine (ER)</option>
                  <option value="cardio">Cardiology Ward</option>
                  <option value="general">General Medical Ward</option>
                  <option value="pediatrics">Pediatric Unit</option>
                </select>
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="pin">
                Set Shift Access PIN (4-8 characters) *
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  id="pin"
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 mt-2"
            >
              {isSubmitting ? (
                <span>Registering Staff Member...</span>
              ) : (
                <>
                  <span>Continue to Role Authorization</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <Link href="/login" className="text-brand-600 font-bold hover:underline">
            Already have an account? Sign In
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
