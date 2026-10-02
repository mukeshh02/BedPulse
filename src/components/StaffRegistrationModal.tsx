'use client';

import React, { useState } from 'react';
import {
  X,
  BadgeAlert,
  Mail,
  Building2,
  CheckCircle2,
  ArrowRight,
  User,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, role: string) => void;
}

export const StaffRegistrationModal: React.FC<StaffRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [councilId, setCouncilId] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [department, setDepartment] = useState('icu');
  const [shift, setShift] = useState('day');
  const [role, setRole] = useState('Doctor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
      setTimeout(() => {
        onSuccess(fullName, role);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#F9F9FF] rounded-3xl w-full max-w-md border border-blue-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800">
              Staff Registration • Step 1 of 3
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 h-1.5 w-full">
          <div className="bg-brand-500 h-full transition-all duration-500" style={{ width: isDone ? '100%' : '33%' }}></div>
        </div>

        {/* Form Body */}
        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-slate-900">Profile Created Successfully!</h3>
            <p className="text-xs text-slate-500">
              Welcome, <strong>{fullName}</strong>. Your clinical credentials have been recorded.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
            {/* Header Banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
                <BadgeAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">Create Staff Profile</h3>
                <p className="text-[11px] text-slate-500">
                  Join your care unit on <span className="font-bold text-brand-600">BedPulse™ OS</span>
                </p>
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Professional Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Doctor">Doctor / Consultant Physician</option>
                <option value="Nurse">Nursing Officer / Sister</option>
                <option value="Admin">Ward Administrator</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Staff Full Name *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Gupta"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Council ID */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Medical Council Reg. / Staff ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MCI-2023-88912"
                value={councilId}
                onChange={(e) => setCouncilId(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Hospital Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Official Hospital Email *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="staff@hospital.org"
                  value={hospitalEmail}
                  onChange={(e) => setHospitalEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Department */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Unit *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="icu">ICU / Critical Care</option>
                  <option value="general">General Medical Ward</option>
                  <option value="cardio">Cardiology Ward</option>
                  <option value="postop">Post-Operative</option>
                  <option value="pediatrics">Pediatrics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Shift *</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="day">Day (08:00 - 20:00)</option>
                  <option value="night">Night (20:00 - 08:00)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <span>Continue to Credentialing</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
