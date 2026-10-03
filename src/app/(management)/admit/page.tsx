'use client';
import {usePullRefresh} from '@/components/PullToRefresh';
import { DataSkeleton } from '@/components/LoadingFeedback';

import { ButtonSpinner } from '@/components/LoadingFeedback';


import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ward, Bed } from '@/types';
import { DataService, DoctorProfile } from '@/lib/supabase';
import {
  UserPlus,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  HeartPulse,
  Activity,
  ArrowRight,
  Printer,
  ShieldCheck,
  Building2,
  Phone,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Plus,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function AdmissionWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBedId = searchParams.get('bedId');

  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Doctor Modal State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocDept, setNewDocDept] = useState('Critical Care / ICU');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [mobile, setMobile] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [admittingDoctor, setAdmittingDoctor] = useState('Dr. Sharma (Cardio)');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState('');

  // Initial vitals
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('78');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('98.6');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [admittedRecord, setAdmittedRecord] = useState<any | null>(null);

  // Load wards, beds & doctors
  const loadData = async () => {
    try {
      const [w, b, d] = await Promise.all([
        DataService.getWards(),
        DataService.getBeds(),
        DataService.getDoctors(),
      ]);
      setWards(w);
      setBeds(b);
      setDoctors(d);

      if (d.length > 0 && (!admittingDoctor || admittingDoctor === 'Dr. Sharma (Cardio)')) {
        setAdmittingDoctor(d[0].name);
      }

      if (queryBedId) {
        const foundBed = b.find((bed) => bed.id === queryBedId);
        if (foundBed) {
          setSelectedWardId(foundBed.ward_id);
          setSelectedBedId(foundBed.id);
        }
      } else if (w.length > 0 && !selectedWardId) {
        setSelectedWardId(w[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const created = await DataService.addDoctor({
      name: newDocName.trim().startsWith('Dr.') ? newDocName.trim() : `Dr. ${newDocName.trim()}`,
      specialty: newDocSpecialty.trim() || 'Consultant Specialist',
      department: newDocDept,
    });
    const refreshed = await DataService.getDoctors();
    setDoctors(refreshed);
    setAdmittingDoctor(created.name);
    setNewDocName('');
    setNewDocSpecialty('');
    setShowAddDocModal(false);
  };

 usePullRefresh(loadData);
  useEffect(() => {
    loadData();
  }, [queryBedId]);

  // Available vacant beds in chosen ward
  const availableBeds = beds.filter(
    (b) => b.ward_id === selectedWardId && b.status === 'vacant'
  );

  const selectedBed = beds.find((b) => b.id === selectedBedId);
  const selectedWard = wards.find((w) => w.id === selectedWardId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) return setErrorMsg('Patient Full Name is required.');
    if (!age || Number(age) <= 0) return setErrorMsg('Valid patient age is required.');
    if (!mobile.trim() || mobile.length < 10) return setErrorMsg('Valid 10-digit mobile number is required.');
    if (!selectedWardId) return setErrorMsg('Please select a hospital ward.');
    if (!selectedBedId) return setErrorMsg('Please choose an available vacant bed for allocation.');
    if (!provisionalDiagnosis.trim()) return setErrorMsg('Provisional diagnosis is required.');

    setIsSubmitting(true);
    try {
      const result = await DataService.admitPatient({
        patient: {
          full_name: fullName.trim(),
          age: Number(age),
          gender,
          mobile: mobile.trim(),
          guardian_name: guardianName.trim() || undefined,
          guardian_mobile: guardianMobile.trim() || undefined,
        },
        wardId: selectedWardId,
        bedId: selectedBedId,
        admittingDoctor,
        provisionalDiagnosis: provisionalDiagnosis.trim(),
        notes: `${notes.trim() ? notes.trim() + ' | ' : ''}Initial Vitals: BP ${bp}, HR ${pulse}bpm, SpO2 ${spo2}%, Temp ${temp}°F ${isEmergency ? '| [EMERGENCY INTAKE]' : ''}`,
      });

      setAdmittedRecord({
        ...result,
        patientName: fullName.trim(),
        bedNumber: selectedBed?.bed_number || 'Bed',
        wardName: selectedWard?.name || 'Ward',
        doctor: admittingDoctor,
        diagnosis: provisionalDiagnosis.trim(),
        time: new Date().toLocaleString('en-IN'),
      });

      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to complete admission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAdmittedRecord(null);
    setFullName('');
    setAge('');
    setMobile('');
    setGuardianName('');
    setGuardianMobile('');
    setProvisionalDiagnosis('');
    setNotes('');
    loadData();
  };

  if (loading) return <DataSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-brand-50/80 shadow-[0_4px_20px_rgba(24,62,51,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
            <UserPlus className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                Admit patient
              </h1>

            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Register a patient and choose an available bed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/wards"
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <BedDouble className="w-3.5 h-3.5 text-brand-500" />
            View beds
          </Link>
          <Link
            href="/patients"
            className="px-3.5 py-2 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 text-xs font-bold hover:bg-brand-100 transition shadow-sm"
          >
            Inpatient Directory
          </Link>
        </div>
      </div>

      {/* ADMISSION SUCCESS SLIP */}
      {admittedRecord ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-[0_10px_35px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Admission Confirmed Successfully!</h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  Patient registered and bed status marked as Occupied.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Admission Slip
            </button>
          </div>

          {/* Printable Slip Card */}
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 max-w-xl mx-auto space-y-4 font-sans text-xs">
            <div className="text-center border-b border-slate-200 pb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <HeartPulse className="w-5 h-5 text-brand-500" />
                <h4 className="text-base font-semibold text-slate-900">BEDPULSE™ HOSPITAL NETWORK</h4>
              </div>
              <p className="text-[10px] text-slate-500">Inpatient Care OS • Admission Slip &amp; Allocation Token</p>
              <p className="text-[10px] text-slate-400">Helpline: +91 7000371321 • WebVission</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Admission No:</span>
                <p className="font-mono font-bold text-brand-600">{admittedRecord.admission_number || 'ADM-LIVE'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">UHID:</span>
                <p className="font-mono font-bold text-slate-800">{admittedRecord.patient?.uhid || 'UHID-GEN'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Patient Name:</span>
                <p className="font-bold text-slate-900 text-sm">{admittedRecord.patientName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Allocated Bed:</span>
                <p className="font-semibold text-emerald-600 text-sm">{admittedRecord.bedNumber} ({admittedRecord.wardName})</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Attending Doctor:</span>
                <p className="font-semibold text-slate-800">{admittedRecord.doctor}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Provisional Diagnosis:</span>
                <p className="font-semibold text-slate-800">{admittedRecord.diagnosis}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Admission Date &amp; Time:</span>
                <p className="text-slate-600">{admittedRecord.time}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Initial Vitals:</span>
                <p className="font-mono text-slate-700">BP {bp} | SpO₂ {spo2}% | HR {pulse}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Authorized System Record • Verified at Central Inpatient Station
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Admit Another Patient
            </button>
            <Link
              href="/wards"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-brand-500/25"
            >
              View in Live Ward Matrix
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* ADMISSION FORM */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* STEP 1: PATIENT DEMOGRAPHICS (7 COLS) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-brand-50/80 shadow-[0_4px_25px_rgba(24,62,51,0.04)] space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-brand-500 text-white flex items-center justify-center font-semibold text-xs">
                    1
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Patient Demographics &amp; Vitals
                  </h3>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100 text-rose-700 text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="accent-rose-600 rounded"
                  />
                  <span>Emergency Intake</span>
                </label>
              </div>

              {/* Full Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Verma"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Age & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 54"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Mobile (10-Digit) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9826012345"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian / Relative Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Anita Verma (Wife)"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Contact No.
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={guardianMobile}
                    onChange={(e) => setGuardianMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9893098765"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Admitting Doctor & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Admitting Consultant *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddDocModal(true)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Doctor
                    </button>
                  </div>
                  <select
                    value={admittingDoctor}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setShowAddDocModal(true);
                      } else {
                        setAdmittingDoctor(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Doctor / Consultant...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Provisional Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={provisionalDiagnosis}
                    onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Coronary Syndrome / Dyspnea"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Initial Telemetry Vitals Strip */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600 block mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-500" />
                  Initial Triage Vitals
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="120/80"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Pulse (bpm)</label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="78"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">SpO₂ (%)</label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="98"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Temp (°F)</label>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="98.6"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Admission Notes &amp; Allergies
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Patient presented with severe chest pain since 2 hours. Known diabetic. NKDA."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
                ></textarea>
              </div>
            </div>

            {/* STEP 2: BED SELECTION & ALLOCATION (5 COLS) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white p-6 rounded-3xl border border-brand-50/80 shadow-[0_4px_25px_rgba(24,62,51,0.04)] flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-semibold text-xs">
                        2
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Select Vacant Bed
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {availableBeds.length} Vacant in Ward
                    </span>
                  </div>

                  {/* Ward Dropdown */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Hospital Ward *
                    </label>
                    <select
                      value={selectedWardId}
                      onChange={(e) => {
                        setSelectedWardId(e.target.value);
                        setSelectedBedId('');
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800"
                    >
                      {wards.map((w) => {
                        const vacCount = beds.filter((b) => b.ward_id === w.id && b.status === 'vacant').length;
                        return (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.floor_number}) — {vacCount} Available Beds
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Vacant Bed Chips */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Available Beds in {selectedWard?.name || 'Selected Ward'} *
                    </label>

                    {availableBeds.length === 0 ? (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-xs font-bold text-amber-800">No Vacant Beds in this Ward</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          Please select another ward or initiate a discharge/transfer.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {availableBeds.map((bed) => {
                          const isSelected = selectedBedId === bed.id;
                          return (
                            <button
                              type="button"
                              key={bed.id}
                              onClick={() => setSelectedBedId(bed.id)}
                              className={`p-3 rounded-2xl border text-left transition-all relative ${
                                isSelected
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25 scale-[1.02]'
                                  : 'bg-emerald-50/40 text-slate-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs">{bed.bed_number}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </div>
                              <span
                                className={`text-[10px] block mt-1 ${
                                  isSelected ? 'text-emerald-100' : 'text-slate-500'
                                }`}
                              >
                                {bed.bed_type}
                              </span>
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                {bed.has_oxygen && (
                                  <span
                                    className={`text-[8px] font-bold px-1 rounded ${
                                      isSelected ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                                    }`}
                                  >
                                    O₂
                                  </span>
                                )}
                                {bed.has_ventilator && (
                                  <span
                                    className={`text-[8px] font-bold px-1 rounded ${
                                      isSelected ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                                    }`}
                                  >
                                    VENT
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Bed Summary Card */}
                  {selectedBed && selectedWard && (
                    <div className="mt-4 p-3.5 bg-gradient-to-br from-brand-50/60 to-emerald-50/60 rounded-2xl border border-brand-100/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Chosen Allocation</p>
                          <h5 className="font-extrabold text-xs text-slate-800 mt-0.5">
                            {selectedBed.bed_number} • {selectedWard.name}
                          </h5>
                          <p className="text-[10px] text-slate-500">{selectedWard.floor_number} • {selectedWard.department}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-emerald-700">
                            ₹{selectedBed.price_per_day || selectedWard.base_price_per_day}/day
                          </span>
                          <span className="text-[9px] block text-slate-400 font-medium">Daily Ward Charge</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedBedId}
                    className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25"
                  >{isSubmitting && <ButtonSpinner />}
                    {isSubmitting ? (
                      <span>Allocating Bed &amp; Syncing Supabase...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Admission &amp; Allocate Bed</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Direct sync with Supabase PostgreSQL • Audit trail logged automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* QUICK ADD DOCTOR MODAL */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-brand-50 relative space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Add Doctor / Consultant</h3>
                  <p className="text-[11px] text-slate-500">Register new doctor to admission roster</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Khileshar Sharma"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Specialty *</label>
                <input
                  type="text"
                  required
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. Pediatrics / Neonatal Care"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newDocDept}
                  onChange={(e) => setNewDocDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                >
                  <option value="Critical Care / ICU">Critical Care / ICU</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics &amp; Neonatology">Pediatrics &amp; Neonatology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Surgery / OT">Surgery / OT</option>
                  <option value="Obstetrics &amp; Gynecology">Obstetrics &amp; Gynecology</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Doctor to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdmitPage() {
  return (
    <>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Admission Wizard...</div>}>
        <AdmissionWizard />
      </Suspense>
    </>
  );
}
