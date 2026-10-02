'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import {
  LogOut,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Printer,
  Ambulance,
  Home,
  AlertTriangle,
  RotateCcw,
  HeartPulse,
  Clock,
  Calendar,
  ShieldCheck,
  FileText,
  User,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function DischargeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAdmissionId = searchParams.get('admissionId');
  const queryBedId = searchParams.get('bedId');

  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string>('');
  const [dischargeType, setDischargeType] = useState<'normal' | 'referred' | 'lama'>('normal');
  const [destinationHospital, setDestinationHospital] = useState('');
  const [referralReason, setReferralReason] = useState('Need Tertiary Cardiac Catheterization / Advanced ICU care');
  const [dischargeSummary, setDischargeSummary] = useState('Patient vitals stabilized, course of treatment completed successfully.');
  const [doctorAdvice, setDoctorAdvice] = useState('Continue prescribed oral medications, low salt diet, complete bed rest, follow up in OPD after 5 days.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Clearances
  const [pharmacyCleared, setPharmacyCleared] = useState(true);
  const [labsCleared, setLabsCleared] = useState(true);
  const [billingCleared, setBillingCleared] = useState(true);

  // Submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dischargedData, setDischargedData] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [w, b, a] = await Promise.all([
        DataService.getWards(),
        DataService.getBeds(),
        DataService.getAdmissions(),
      ]);
      setWards(w);
      setBeds(b);
      setAdmissions(a);

      const activeAdmissions = a.filter((adm) => adm.status === 'admitted');

      if (queryAdmissionId) {
        setSelectedAdmissionId(queryAdmissionId);
      } else if (queryBedId) {
        const found = activeAdmissions.find((adm) => adm.bed_id === queryBedId);
        if (found) setSelectedAdmissionId(found.id);
      } else if (activeAdmissions.length > 0 && !selectedAdmissionId) {
        setSelectedAdmissionId(activeAdmissions[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryAdmissionId, queryBedId]);

  const activeAdmissions = admissions.filter((a) => a.status === 'admitted');
  const currentAdmission = admissions.find((a) => a.id === selectedAdmissionId);
  const currentBed = beds.find((b) => b.id === currentAdmission?.bed_id);
  const currentWard = wards.find((w) => w.id === currentBed?.ward_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentAdmission) return setErrorMsg('Please choose an admitted patient to discharge.');
    if (dischargeType === 'referred' && !destinationHospital.trim()) {
      return setErrorMsg('Please specify the destination referral hospital name.');
    }
    if (!dischargeSummary.trim()) {
      return setErrorMsg('Discharge summary note is required.');
    }
    if (!billingCleared) {
      return setErrorMsg('Billing clearance checklist must be confirmed prior to discharge.');
    }

    setIsSubmitting(true);
    try {
      await DataService.dischargePatient({
        admissionId: currentAdmission.id,
        bedId: currentAdmission.bed_id,
        dischargeType,
        destinationHospital: dischargeType === 'referred' ? destinationHospital.trim() : undefined,
        dischargeSummary: dischargeSummary.trim(),
        doctorAdvice: doctorAdvice.trim() || undefined,
        followUpDate: dischargeType === 'normal' ? followUpDate : undefined,
      });

      setDischargedData({
        patientName: currentAdmission.patient?.full_name,
        uhid: currentAdmission.patient?.uhid,
        age: currentAdmission.patient?.age,
        gender: currentAdmission.patient?.gender,
        admissionNo: currentAdmission.admission_number,
        admissionDate: new Date(currentAdmission.admission_date).toLocaleDateString('en-IN'),
        dischargeDate: new Date().toLocaleDateString('en-IN'),
        dischargeType,
        destinationHospital: dischargeType === 'referred' ? destinationHospital.trim() : null,
        referralReason: dischargeType === 'referred' ? referralReason : null,
        bedNumber: currentBed?.bed_number || 'Bed',
        wardName: currentWard?.name || 'Ward',
        doctor: currentAdmission.admitting_doctor,
        diagnosis: currentAdmission.provisional_diagnosis,
        summary: dischargeSummary.trim(),
        advice: doctorAdvice.trim(),
        followUp: dischargeType === 'normal' ? followUpDate : null,
      });

      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}

      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to complete discharge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_20px_rgba(29,119,255,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <LogOut className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Patient Discharge &amp; Referral Management
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Step 4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate final discharge summary, refer to higher centers, and release beds back to sanitization protocol.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/wards"
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <BedDouble className="w-3.5 h-3.5 text-brand-500" />
            Check Live Beds
          </Link>
          <Link
            href="/patients"
            className="px-3.5 py-2 rounded-2xl bg-blue-50 text-brand-600 border border-blue-100 text-xs font-bold hover:bg-blue-100 transition shadow-sm"
          >
            Inpatients ({activeAdmissions.length})
          </Link>
        </div>
      </div>

      {/* DISCHARGE SUCCESS SLIP PREVIEW */}
      {dischargedData ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-[0_10px_35px_rgba(16,185,129,0.08)] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Discharge Completed Successfully</h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  Bed <strong>{dischargedData.bedNumber}</strong> has been marked as <strong>Sanitizing / Cleaning</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-500/25"
            >
              <Printer className="w-4 h-4" />
              Print Discharge Card
            </button>
          </div>

          {/* Printable Discharge Card */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200/80 max-w-2xl mx-auto space-y-5 shadow-sm text-xs print:p-0 print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-brand-500 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <HeartPulse className="w-6 h-6 text-brand-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">BEDPULSE™ HOSPITAL &amp; RESEARCH CENTER</h2>
              </div>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                {dischargedData.dischargeType === 'referred'
                  ? 'OFFICIAL PATIENT REFERRAL SLIP'
                  : dischargedData.dischargeType === 'lama'
                  ? 'DISCHARGE AGAINST MEDICAL ADVICE (L.A.M.A)'
                  : 'INPATIENT DISCHARGE SUMMARY'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">24x7 Emergency Helpline: +91 7000371321 • WebVission Care OS</p>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">PATIENT NAME</span>
                <span className="font-extrabold text-slate-900 text-sm">{dischargedData.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">UHID / IP NUMBER</span>
                <span className="font-mono font-bold text-brand-600">{dischargedData.uhid}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">AGE / GENDER</span>
                <span className="font-semibold text-slate-800">{dischargedData.age} Years / {dischargedData.gender}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">DATE OF ADMISSION</span>
                <span className="font-semibold text-slate-800">{dischargedData.admissionDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">DATE OF DISCHARGE</span>
                <span className="font-semibold text-slate-800">{dischargedData.dischargeDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">WARD &amp; BED</span>
                <span className="font-semibold text-slate-800">{dischargedData.wardName} — {dischargedData.bedNumber}</span>
              </div>
            </div>

            {/* Referral Banner if referred */}
            {dischargedData.dischargeType === 'referred' && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <span className="font-bold block text-xs flex items-center gap-1.5">
                  <Ambulance className="w-4 h-4 text-amber-600" />
                  REFERRED TO HIGHER CENTER:
                </span>
                <p className="font-black text-sm mt-0.5">{dischargedData.destinationHospital}</p>
                <p className="text-[11px] mt-1 text-amber-800">
                  <strong>Referral Justification:</strong> {dischargedData.referralReason}
                </p>
              </div>
            )}

            {/* Diagnosis & Summary */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">FINAL DIAGNOSIS:</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{dischargedData.diagnosis}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">CLINICAL COURSE &amp; SUMMARY:</span>
                <p className="text-slate-700 leading-relaxed text-xs mt-0.5">{dischargedData.summary}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">DISCHARGE ADVICE &amp; MEDICATIONS:</span>
                <p className="text-slate-700 leading-relaxed text-xs mt-0.5">{dischargedData.advice}</p>
              </div>

              {dischargedData.followUp && (
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Follow-up OPD Review:</span>
                  <span className="text-xs font-black text-emerald-900 font-mono">
                    {new Date(dischargedData.followUp).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
              <div className="text-center">
                <div className="w-36 border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-700">
                  Sister In-Charge
                </div>
                <span>Nursing Station Sign</span>
              </div>
              <div className="text-center">
                <div className="w-48 border-b border-slate-300 pb-1 mb-1 font-black text-slate-900">
                  {dischargedData.doctor}
                </div>
                <span>Authorized Attending Consultant</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDischargedData(null);
                loadData();
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Process Another Discharge
            </button>
            <Link
              href="/wards"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-brand-500/25"
            >
              Back to Live Wards
            </Link>
          </div>
        </div>
      ) : (
        /* DISCHARGE FORM */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PATIENT TO DISCHARGE (5 COLS) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Select Admitted Patient
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {activeAdmissions.length} Inpatients
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inpatient File *
                </label>
                <select
                  value={selectedAdmissionId}
                  onChange={(e) => setSelectedAdmissionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                >
                  {activeAdmissions.map((adm) => {
                    const b = beds.find((bed) => bed.id === adm.bed_id);
                    const w = wards.find((ward) => ward.id === b?.ward_id);
                    return (
                      <option key={adm.id} value={adm.id}>
                        {adm.patient?.full_name} ({adm.patient?.uhid}) — Bed {b?.bed_number} [{w?.name}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {currentAdmission?.patient && currentBed && currentWard ? (
                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{currentAdmission.patient.full_name}</h4>
                      <p className="text-[11px] font-mono text-slate-500">
                        UHID: {currentAdmission.patient.uhid} • Age: {currentAdmission.patient.age}y
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs font-mono">
                      {currentBed.bed_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-emerald-200/60">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">CURRENT WARD:</span>
                      <span className="font-semibold text-slate-800">{currentWard.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">ADMIT DATE:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(currentAdmission.admission_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">PROVISIONAL DIAGNOSIS:</span>
                      <span className="font-semibold text-slate-800">{currentAdmission.provisional_diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">ATTENDING DOCTOR:</span>
                      <span className="font-semibold text-slate-800">{currentAdmission.admitting_doctor}</span>
                    </div>
                  </div>

                  {/* Bed Auto Release Notification */}
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                    Bed <strong>{currentBed.bed_number}</strong> will automatically be released and placed under sanitization cleaning.
                  </div>
                </div>
              ) : null}

              {/* Clearance Checkboxes */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-extrabold text-slate-800 block mb-1">
                  Discharge Clearance Checklist
                </span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pharmacyCleared}
                    onChange={(e) => setPharmacyCleared(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                  <span>Pharmacy &amp; Medication returns verified</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={labsCleared}
                    onChange={(e) => setLabsCleared(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                  <span>Laboratory &amp; Radiology reports attached</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingCleared}
                    onChange={(e) => setBillingCleared(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                  <span className="font-bold text-slate-900">Hospital IP Billing &amp; TPA Clearance Settled *</span>
                </label>
              </div>
            </div>

            {/* DISCHARGE DETAILS (7 COLS) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Discharge Category &amp; Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select clinical disposition pathway</p>
              </div>

              {/* Category Radio Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDischargeType('normal')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    dischargeType === 'normal'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25'
                      : 'bg-emerald-50/40 text-slate-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <Home className="w-5 h-5 mb-1.5" />
                  <span className="font-extrabold text-xs block">Normal Discharge</span>
                  <span className={`text-[10px] block mt-0.5 ${dischargeType === 'normal' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Recovered / Home
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDischargeType('referred')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    dischargeType === 'referred'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/25'
                      : 'bg-amber-50/40 text-slate-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Ambulance className="w-5 h-5 mb-1.5" />
                  <span className="font-extrabold text-xs block">Refer to Higher</span>
                  <span className={`text-[10px] block mt-0.5 ${dischargeType === 'referred' ? 'text-amber-100' : 'text-slate-500'}`}>
                    Tertiary / Cardiac Care
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDischargeType('lama')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    dischargeType === 'lama'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25'
                      : 'bg-rose-50/40 text-slate-700 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mb-1.5" />
                  <span className="font-extrabold text-xs block">L.A.M.A Discharge</span>
                  <span className={`text-[10px] block mt-0.5 ${dischargeType === 'lama' ? 'text-rose-100' : 'text-slate-500'}`}>
                    Against Medical Advice
                  </span>
                </button>
              </div>

              {/* Referral Details if Referred */}
              {dischargeType === 'referred' && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Destination Referral Hospital Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={destinationHospital}
                      onChange={(e) => setDestinationHospital(e.target.value)}
                      placeholder="e.g. AIIMS Bhopal / Medanta Super Speciality"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Reason for Higher Center Referral
                    </label>
                    <input
                      type="text"
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Clinical Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discharge Clinical Course &amp; Condition *
                </label>
                <textarea
                  rows={2}
                  required
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                ></textarea>
              </div>

              {/* Doctor Advice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physician Advice &amp; Discharge Prescriptions
                </label>
                <textarea
                  rows={2}
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                ></textarea>
              </div>

              {/* Follow-up Date */}
              {dischargeType === 'normal' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Follow-up OPD Review Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Frees bed immediately for terminal cleaning &amp; sanitization.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAdmissionId}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 shrink-0"
                >
                  {isSubmitting ? (
                    <span>Processing Discharge...</span>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Confirm Discharge &amp; Release Bed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function DischargePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Discharge Pipeline...</div>}>
        <DischargeFlow />
      </Suspense>
    </AppShell>
  );
}
