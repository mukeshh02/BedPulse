'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  BadgeAlert,
  Eye,
  EyeOff,
  HeartPulse,
  Building2,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onLoginSuccess: (role: string, name: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<'Doctor' | 'Nurse' | 'Admin'>('Doctor');
  const [staffId, setStaffId] = useState('alexander.m@bedpulse.health');
  const [password, setPassword] = useState('WardAlpha2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSector, setSelectedSector] = useState('ICU / Critical Care');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      const name =
        selectedRole === 'Doctor'
          ? 'Dr. Alexander Wright, MD'
          : selectedRole === 'Nurse'
          ? 'Sister Priya Sharma'
          : 'Administrator';
      onLoginSuccess(selectedRole, name);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#F9F9FF] rounded-3xl w-full max-w-md border border-blue-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">BedPulse™ Staff Sign-In</h3>
              <p className="text-[10px] text-slate-400">Care OS v2.4 • Clinical Session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Welcome Banner */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-600 text-[10px] font-bold border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Central Medical Unit • Active Shift
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">Welcome Back to BedPulse™</h2>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Secure Inpatient &amp; Bed Management for High-Precision Care
            </p>
          </div>

          {/* HIPAA Badge */}
          <div className="flex items-center justify-between bg-blue-50/60 border border-blue-100 px-3.5 py-2 rounded-2xl text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>HIPAA &amp; HL7 Audited Session</span>
            </div>
            <span className="text-[10px] font-bold bg-white text-brand-600 px-2 py-0.5 rounded-full shadow-xs">
              Floor 4 Active
            </span>
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Select Operational Role
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
              {(['Doctor', 'Nurse', 'Admin'] as const).map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 text-center rounded-xl font-bold text-xs transition ${
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

          {/* Staff ID */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Hospital Staff ID / Clinical Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <BadgeAlert className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">
                Shift PIN / Password
              </label>
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-semibold">
                <ShieldCheck className="w-3 h-3" /> 256-bit Encrypted
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sector Chips */}
          <div>
            <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Assign Immediate Ward Sector
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['ICU / Critical Care', 'General Ward', 'Deluxe & Private'].map((sector) => (
                <button
                  type="button"
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedSector === sector
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedSector === sector ? 'bg-white' : 'bg-slate-400'
                    }`}
                  />
                  <span>{sector}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign In to Shift Dashboard</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="w-full py-2 text-center text-slate-500 hover:text-brand-600 font-semibold text-xs flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Staff Member? Register Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
