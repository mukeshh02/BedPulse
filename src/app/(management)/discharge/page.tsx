'use client';
import {usePullRefresh} from '@/components/PullToRefresh';
import { DataSkeleton } from '@/components/LoadingFeedback';

import { ButtonSpinner } from '@/components/LoadingFeedback';

import { HospitalService } from '@/lib/hospital';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
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
  const [referralReason, setReferralReason] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Clearances
  const [pharmacyCleared, setPharmacyCleared] = useState(false);
  const [labsCleared, setLabsCleared] = useState(false);
  const [billingCleared, setBillingCleared] = useState(false);

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

      const activeAdmissions = a.filter((adm) => ['admitted', 'shifted'].includes(adm.status));

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

 usePullRefresh(loadData);
  useEffect(() => {
    loadData();
  }, [queryAdmissionId, queryBedId]);

  const activeAdmissions = admissions.filter((a) => ['admitted', 'shifted'].includes(a.status));
  const currentAdmission = activeAdmissions.find((a) => a.id === selectedAdmissionId);
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

  if (loading) return <DataSkeleton />;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-semibold tracking-tight">Discharge &amp; referral</h1><p className="mt-2 text-xs text-slate-500">Complete a patient’s stay.</p></div>
        <Link href="/patients" className="inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-xs font-medium"><User size={15}/>Patients ({activeAdmissions.length})</Link>
      </header>
      {/* DISCHARGE SUCCESS SLIP PREVIEW */}
      {dischargedData ? (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-brand-100 shadow-[0_10px_35px_rgba(16,185,129,0.08)] space-y-6">
          <div className="flex flex-wrap gap-3 items-center justify-between border-b border-brand-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Discharge complete</h3>
                <p className="text-xs text-brand-700 font-semibold">
                  Bed <strong>{dischargedData.bedNumber}</strong> has been marked as <strong>Sanitizing / Cleaning</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-brand-500/25"
            >
              <Printer className="w-4 h-4" />
              Print summary
            </button>
          </div>

          {/* Printable Discharge Card */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl border-2 border-slate-200/80 max-w-2xl mx-auto space-y-5 shadow-sm text-xs print:p-0 print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-brand-500 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <HeartPulse className="w-6 h-6 text-brand-600" />
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{HospitalService.current()?.hospital.name || 'Hospital'}</h2>
              </div>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                {dischargedData.dischargeType === 'referred'
                  ? 'OFFICIAL PATIENT REFERRAL SLIP'
                  : dischargedData.dischargeType === 'lama'
                  ? 'DISCHARGE AGAINST MEDICAL ADVICE (L.A.M.A)'
                  : 'INPATIENT DISCHARGE SUMMARY'}
              </p>

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
                <p className="font-semibold text-sm mt-0.5">{dischargedData.destinationHospital}</p>
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
                <div className="bg-brand-50 p-2.5 rounded-xl border border-brand-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-800">Follow-up OPD Review:</span>
                  <span className="text-xs font-semibold text-brand-900 font-mono">
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
                <div className="w-28 sm:w-36 border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-700">
                  Sister In-Charge
                </div>
                <span>Nursing Station Sign</span>
              </div>
              <div className="text-center">
                <div className="w-32 sm:w-48 border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-900">
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
              Another discharge
            </button>
            <Link
              href="/wards"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-brand-500/25"
            >
              View beds
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
            <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-brand-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  Patient
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {activeAdmissions.length} Inpatients
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select patient *
                </label>
                <select
                  value={selectedAdmissionId}
                  onChange={(e) => {setSelectedAdmissionId(e.target.value); setPharmacyCleared(false); setLabsCleared(false); setBillingCleared(false); setDischargeSummary(''); setDoctorAdvice(''); setFollowUpDate('');}}
                  className="w-full px-3.5 py-2.5 text-sm bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800"
                >
                  <option value="">Choose a patient</option>{activeAdmissions.map((adm) => {
                    const b = beds.find((bed) => bed.id === adm.bed_id);
                    const w = wards.find((ward) => ward.id === b?.ward_id);
                    return (
                      <option key={adm.id} value={adm.id}>
                        {adm.patient?.full_name} · {b?.bed_number}
                      </option>
                    );
                  })}
                </select>
              </div>

              {currentAdmission?.patient && currentBed && currentWard ? (
                <div className="p-4 bg-brand-50/40 rounded-2xl border border-brand-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{currentAdmission.patient.full_name}</h4>
                      <p className="text-xs text-slate-500">
                        {currentAdmission.patient.age}y · {currentAdmission.patient.gender}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-brand-100 text-brand-800 font-semibold text-xs font-mono">
                      {currentBed.bed_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-brand-200/60">
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
                    Bed <strong>{currentBed.bed_number}</strong> will be marked for cleaning.
                  </div>
                </div>
              ) : null}

              {/* Clearance Checkboxes */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-extrabold text-slate-800 block mb-1">
                  Clearance
                </span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pharmacyCleared}
                    onChange={(e) => setPharmacyCleared(e.target.checked)}
                    className="accent-brand-600 w-4 h-4 rounded shrink-0"
                  />
                  <span>Medication returns checked</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={labsCleared}
                    onChange={(e) => setLabsCleared(e.target.checked)}
                    className="accent-brand-600 w-4 h-4 rounded shrink-0"
                  />
                  <span>Reports attached</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingCleared}
                    onChange={(e) => setBillingCleared(e.target.checked)}
                    className="accent-brand-600 w-4 h-4 rounded shrink-0"
                  />
                  <span className="font-bold text-slate-900">Billing cleared *</span>
                </label>
              </div>
            </div>

            {/* DISCHARGE DETAILS (7 COLS) */}
            <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-brand-100 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Discharge details</h3>

              </div>

              {/* Category Radio Cards */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDischargeType('normal')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    dischargeType === 'normal'
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-brand-50/40 text-slate-700 border-brand-200 hover:bg-brand-50'
                  }`}
                >
                  <Home className="w-5 h-5 mb-1.5" />
                  <span className="font-extrabold text-xs block">Discharge</span>

                </button>

                <button
                  type="button"
                  onClick={() => setDischargeType('referred')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    dischargeType === 'referred'
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-brand-50 text-brand-600 border-brand-100 hover:bg-brand-100'
                  }`}
                >
                  <Ambulance className="w-5 h-5 mb-1.5" />
                  <span className="font-extrabold text-xs block">Referral</span>

                </button>

                <button
                  type="button"
                  onClick={() => setDischargeType('lama')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    dischargeType === 'lama'
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-brand-50 text-brand-600 border-brand-100 hover:bg-brand-100'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mb-1.5" />
                  <span className="font-extrabold text-xs block">LAMA</span>

                </button>
              </div>

              {/* Referral Details if Referred */}
              {dischargeType === 'referred' && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Destination hospital *
                    </label>
                    <input
                      type="text"
                      required
                      value={destinationHospital}
                      onChange={(e) => setDestinationHospital(e.target.value)}
                      placeholder="Hospital name"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Referral reason
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
                  Discharge summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
                ></textarea>
              </div>

              {/* Doctor Advice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Advice &amp; medications
                </label>
                <textarea
                  rows={3}
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
                ></textarea>
              </div>

              {/* Follow-up Date */}
              {dischargeType === 'normal' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Follow-up date (optional)
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full sm:w-1/2 px-3.5 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-brand-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <p className="text-xs text-slate-400">
                  Selected bed will need cleaning.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || !currentAdmission || !billingCleared}
                  className="px-6 py-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-brand-600/25 shrink-0"
                >{isSubmitting && <ButtonSpinner />}
                  {isSubmitting ? (
                    <span>Saving…</span>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>{dischargeType === 'referred' ? 'Confirm referral' : 'Confirm discharge'}</span>
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
    <>
      <Suspense fallback={<DataSkeleton />}>
        <DischargeFlow />
      </Suspense>
    </>
  );
}
