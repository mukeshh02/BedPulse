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
  Phone,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('Critical Care & ICU');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      return setErrorMsg('Please fill in all mandatory fields.');
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      try {
        confetti({ particleCount: 50, spread: 60 });
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
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-blue-100/60 blur-xl pointer-events-none"></div>

        {/* Brand */}
        <div className="text-center mb-6 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/30 mb-3">
            <HeartPulse className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            BedPulse<span className="text-brand-500">™</span> Staff Enrollment
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Clinical Credentialing &amp; Ward Clearance</p>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-extrabold text-emerald-950">Registration Successful!</h3>
            <p className="text-xs text-emerald-700">
              Staff credentials registered. Redirecting to sign in portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name &amp; Title *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                >
                  <option value="Doctor">Doctor / Attending Consultant</option>
                  <option value="Nurse">Registered Staff Nurse</option>
                  <option value="Admin">Ward Administrator</option>
                  <option value="Intern">Medical Resident / Intern</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical Registration / MCI No.
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="MCI-2024-XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="ICU / Cardiology"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bedpulse.health"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9826012345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Set Shift Access PIN (4-8 digits) *
              </label>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 mt-3"
            >
              {isSubmitting ? (
                <span>Registering Staff Member...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register &amp; Request Sector Access</span>
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
          Support:{' '}
          <a href="tel:+917000371321" className="text-brand-600 font-bold hover:underline">
            +91 7000371321
          </a>
        </p>
      </footer>
    </div>
  );
}
