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
  Stethoscope,
  Activity,
  BedDouble,
  Eye,
  EyeOff,
  Sparkles,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Identity & Credentials
  const [fullName, setFullName] = useState('');
  const [councilId, setCouncilId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedRole, setSelectedRole] = useState<'attending' | 'resident' | 'head_nurse' | 'allocator'>('attending');
  const [consentGiven, setConsentGiven] = useState(true);

  // Step 2: Ward & Unit Allocation
  const [department, setDepartment] = useState('icu');
  const [shiftPreference, setShiftPreference] = useState('Day Shift (08:00 AM - 08:00 PM)');
  const [primaryFloor, setPrimaryFloor] = useState('Ground Floor (Critical Wing)');

  // Step 3: Bedside Access PIN
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1 Handler
  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) return setErrorMsg('Please enter your full name and medical title.');
    if (!email.trim() || !email.includes('@')) return setErrorMsg('Please enter a valid official hospital email.');
    if (!mobile.trim() || mobile.length < 10) return setErrorMsg('Please provide a valid 10-digit mobile number.');
    if (!consentGiven) return setErrorMsg('You must consent to hospital data privacy and HIPAA protocols.');

    setCurrentStep(2);
  };

  // Step 2 Handler
  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCurrentStep(3);
  };

  // Final Step 3 Submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pin || pin.length < 4) return setErrorMsg('Shift PIN must be at least 4 digits.');
    if (pin !== confirmPin) return setErrorMsg('PIN confirmation does not match.');

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      try {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      } catch {}
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    }, 1000);
  };

  const roleTitles = {
    attending: { title: 'Attending Physician', sub: 'Senior Consultant & Rounds Lead', icon: Stethoscope },
    resident: { title: 'Resident Doctor', sub: 'Junior Medical Officer / Registrar', icon: Activity },
    head_nurse: { title: 'Head Nurse / Lead', sub: 'Nursing Sister & Ward In-Charge', icon: HeartPulse },
    allocator: { title: 'Bed Allocator', sub: 'Admission Desk & Bed Controller', icon: BedDouble },
  };

  return (
    <div className="min-h-screen bg-[#F1F6FD] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.08)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-100/60 blur-xl pointer-events-none"></div>

        {/* Top Navigation & Stage Bar */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) router.push('/login');
                else setCurrentStep((prev) => (prev - 1) as any);
              }}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-brand-600 transition"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
              <span>Step {currentStep} of 3</span>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span className="text-brand-600">
                {currentStep === 1
                  ? 'Verification & Credentialing'
                  : currentStep === 2
                  ? 'Ward & Sector Allocation'
                  : 'Bedside Security PIN & Authorization'}
              </span>
              <span>{currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
              ></div>
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
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Staff Onboarding &amp; Profile</h1>
              <p className="text-xs text-slate-500">
                Join your hospital clinical care team on <strong className="text-brand-600 font-bold">BedPulse™ OS</strong>
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isCompleted ? (
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-950">Staff Credentials Authorized!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Welcome to BedPulse™ OS, <strong>{fullName}</strong>. Your clinical access token and ward clearance have been activated.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-left text-xs font-sans space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">ACTIVATED PROFILE</p>
              <p className="font-extrabold text-slate-800">{fullName} ({roleTitles[selectedRole].title})</p>
              <p className="text-slate-500 text-[11px]">Assigned to: {department.toUpperCase()} • {primaryFloor}</p>
            </div>

            <p className="text-[11px] text-emerald-600 animate-pulse font-semibold">
              Redirecting to Secure Sign-In Portal...
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1: VERIFICATION & CREDENTIALS */}
            {currentStep === 1 && (
              <form onSubmit={handleNextToStep2} className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Professional Identity
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Encrypted Records
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Full Name &amp; Title *
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Alexander Wright, MD"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Medical Council Reg. / Staff ID
                    </label>
                    <span className="text-[10px] text-slate-400">e.g. MCI-2021-98442</span>
                  </div>
                  <div className="relative flex items-center">
                    <FileText className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      value={councilId}
                      onChange={(e) => setCouncilId(e.target.value.toUpperCase())}
                      placeholder="MCI-2021-98442"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono uppercase text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital Email *
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@hospital.org"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                      <input
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

                {/* 4 Tactile Role Radio Cards from Stitch */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Clinical Station Role (Select One) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['attending', 'resident', 'head_nurse', 'allocator'] as const).map((r) => {
                      const item = roleTitles[r];
                      const Icon = item.icon;
                      const isSelected = selectedRole === r;

                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRole(r)}
                          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-brand-500 text-brand-900 shadow-sm ring-1 ring-brand-500'
                              : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                            </div>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs block leading-tight">{item.title}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.sub}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* HIPAA Consent */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="accent-brand-600 mt-0.5 rounded"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    I agree to <strong>Hospital Data Privacy, HIPAA</strong>, and Patient Records Security Protocols.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 mt-2"
                >
                  <span>Continue to Step 2: Ward Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: WARD & UNIT ALLOCATION */}
            {currentStep === 2 && (
              <form onSubmit={handleNextToStep3} className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-800 text-sm">Ward &amp; Sector Assignment</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Select your primary clinical department and shift</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Clinical Unit / Ward *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="icu">Intensive Care Unit (ICU)</option>
                    <option value="emergency">Emergency Medicine &amp; Triage (ER)</option>
                    <option value="cardio">Cardiology Care Unit (CCU)</option>
                    <option value="general">Male / Female General Ward</option>
                    <option value="pediatrics">Pediatric Intensive Care (PICU)</option>
                    <option value="postop">Post-Operative Recovery Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floor &amp; Wing Location *
                  </label>
                  <select
                    value={primaryFloor}
                    onChange={(e) => setPrimaryFloor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Ground Floor (Critical Wing)">Ground Floor (Critical Care &amp; ER Wing)</option>
                    <option value="1st Floor (General Medical)">1st Floor (General Medical &amp; Recovery)</option>
                    <option value="2nd Floor (Private & Deluxe)">2nd Floor (Private Rooms &amp; Suites)</option>
                    <option value="OT Block Wing">Operation Theatre (OT Wing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Shift Schedule
                  </label>
                  <select
                    value={shiftPreference}
                    onChange={(e) => setShiftPreference(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Day Shift (08:00 AM - 08:00 PM)">Day Shift (08:00 AM - 08:00 PM)</option>
                    <option value="Night Shift (08:00 PM - 08:00 AM)">Night Shift (08:00 PM - 08:00 AM)</option>
                    <option value="Rotational Roster">Rotational Ward Roster</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100/70 text-[11px] text-slate-600 leading-relaxed">
                  Your bed allocation rights and bedside telemetry view will automatically sync to this assigned sector.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25"
                  >
                    <span>Proceed to Security PIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SECURITY PIN & ACTIVATION */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-800 text-sm">Bedside Access PIN</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Set a secret PIN for fast bedside rounds and ward transfers</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Create Shift Access PIN (4-8 Digits) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[10px] text-brand-600 font-bold hover:underline"
                    >
                      {showPin ? 'Hide PIN' : 'Show PIN'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm tracking-widest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Shift Access PIN *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm tracking-widest"
                    />
                  </div>
                </div>

                {/* Summary preview card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">STAFF:</span>
                    <span className="font-bold">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROLE:</span>
                    <span className="font-semibold text-brand-600">{roleTitles[selectedRole].title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DEPARTMENT:</span>
                    <span className="font-semibold">{department.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25"
                  >
                    {isSubmitting ? (
                      <span>Authorizing Staff Profile...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Onboarding &amp; Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Links */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <Link href="/login" className="text-brand-600 font-bold hover:underline">
            Already registered? Sign In here
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
