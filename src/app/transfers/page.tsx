'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import {
  ArrowRightLeft,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Clock,
  User,
  ArrowRight,
  ShieldAlert,
  Building2,
  Sparkles,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function TransfersPipeline() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAdmissionId = searchParams.get('admissionId');
  const queryBedId = searchParams.get('bedId');

  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer State
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string>('');
  const [targetWardId, setTargetWardId] = useState<string>('');
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [reason, setReason] = useState<string>('Clinical Condition Improved (Step-down to General Ward)');
  const [transferredBy, setTransferredBy] = useState('Dr. Alexander Wright, MD');
  const [notes, setNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

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

      if (w.length > 0 && !targetWardId) {
        setTargetWardId(w[0].id);
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

  // Available vacant beds in target ward (excluding current bed)
  const availableBeds = beds.filter(
    (b) => b.ward_id === targetWardId && b.status === 'vacant' && b.id !== currentBed?.id
  );
  const targetBed = beds.find((b) => b.id === targetBedId);
  const targetWard = wards.find((w) => w.id === targetWardId);

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentAdmission) return setErrorMsg('Please choose an admitted patient to transfer.');
    if (!targetBedId) return setErrorMsg('Please select a destination vacant bed.');

    setIsSubmitting(true);
    try {
      await DataService.shiftBed({
        admissionId: currentAdmission.id,
        fromBedId: currentAdmission.bed_id,
        toBedId: targetBedId,
        reason: `${reason}${notes ? ` — ${notes}` : ''}`,
        transferredBy,
      });

      setSuccessInfo({
        patientName: currentAdmission.patient?.full_name,
        fromBed: currentBed?.bed_number || 'Bed',
        toBed: targetBed?.bed_number || 'Bed',
        fromWard: currentWard?.name || 'Ward',
        toWard: targetWard?.name || 'Ward',
        timestamp: new Date().toLocaleTimeString('en-IN'),
      });

      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}

      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to complete bed transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_20px_rgba(29,119,255,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
            <ArrowRightLeft className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Inpatient Bed Transfer Pipeline
              </h1>
              <span className="bg-amber-50 text-amber-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                Step 3
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Shift patient between wards, step-down to recovery, or transfer to intensive care with automated bed status updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/wards"
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <BedDouble className="w-3.5 h-3.5 text-brand-500" />
            Check Live Floor
          </Link>
          <Link
            href="/patients"
            className="px-3.5 py-2 rounded-2xl bg-blue-50 text-brand-600 border border-blue-100 text-xs font-bold hover:bg-blue-100 transition shadow-sm"
          >
            Active Inpatients ({activeAdmissions.length})
          </Link>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-emerald-950 text-sm">Bed Transfer Executed Successfully</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                <strong>{successInfo.patientName}</strong> shifted from{' '}
                <span className="font-mono font-bold">{successInfo.fromBed} ({successInfo.fromWard})</span> to{' '}
                <span className="font-mono font-bold text-emerald-700">{successInfo.toBed} ({successInfo.toWard})</span>.
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Bed {successInfo.fromBed} has been set to <strong>Sanitization / Cleaning</strong> protocol.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TRANSFER WORKFLOW CARD */}
      <form onSubmit={handleExecuteTransfer} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SOURCE PATIENT SELECTOR (6 COLS) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                  A
                </span>
                Source Inpatient (Current Bed)
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {activeAdmissions.length} Admitted Patients
              </span>
            </div>

            {/* Select Admission Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Patient to Relocate *
              </label>
              <select
                value={selectedAdmissionId}
                onChange={(e) => setSelectedAdmissionId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
              >
                {activeAdmissions.map((adm) => {
                  const b = beds.find((bed) => bed.id === adm.bed_id);
                  const w = wards.find((ward) => ward.id === b?.ward_id);
                  return (
                    <option key={adm.id} value={adm.id}>
                      {adm.patient?.full_name} ({adm.patient?.uhid}) — Bed: {b?.bed_number || 'N/A'} [{w?.name || 'Ward'}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Patient Card Details */}
            {currentAdmission?.patient && currentBed && currentWard ? (
              <div className="p-4 bg-gradient-to-br from-amber-50/40 to-orange-50/30 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {currentAdmission.patient.full_name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500">
                      UHID: {currentAdmission.patient.uhid} • Age: {currentAdmission.patient.age}y ({currentAdmission.patient.gender})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-black text-xs font-mono">
                    {currentBed.bed_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-amber-200/60">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">CURRENT WARD:</span>
                    <span className="font-semibold text-slate-800">{currentWard.name} ({currentWard.floor_number})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">CURRENT RATE:</span>
                    <span className="font-semibold text-slate-800">₹{currentBed.price_per_day || currentWard.base_price_per_day}/day</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">DIAGNOSIS:</span>
                    <span className="font-semibold text-slate-800">{currentAdmission.provisional_diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">ATTENDING DOCTOR:</span>
                    <span className="font-semibold text-slate-800">{currentAdmission.admitting_doctor}</span>
                  </div>
                </div>

                <div className="bg-amber-100/60 p-2.5 rounded-xl text-[11px] text-amber-900 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Upon transfer, Bed <strong>{currentBed.bed_number}</strong> will automatically switch to <strong>Cleaning</strong> status.</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No active inpatient selected.
              </div>
            )}
          </div>

          {/* DESTINATION BED SELECTOR (6 COLS) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                  B
                </span>
                Target Destination Bed
              </span>
              <span className="text-[11px] font-bold text-brand-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {availableBeds.length} Available in Ward
              </span>
            </div>

            {/* Target Ward Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Hospital Ward *
              </label>
              <select
                value={targetWardId}
                onChange={(e) => {
                  setTargetWardId(e.target.value);
                  setTargetBedId('');
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-800"
              >
                {wards.map((w) => {
                  const vac = beds.filter((b) => b.ward_id === w.id && b.status === 'vacant').length;
                  return (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.floor_number}) — {vac} Vacant Beds
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Vacant Bed Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Destination Bed in {targetWard?.name || 'Target Ward'} *
              </label>

              {availableBeds.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-700">No vacant beds in this ward.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Please choose another destination ward above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {availableBeds.map((bed) => {
                    const isSelected = targetBedId === bed.id;
                    return (
                      <button
                        type="button"
                        key={bed.id}
                        onClick={() => setTargetBedId(bed.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-600 shadow-md shadow-brand-500/25 scale-[1.02]'
                            : 'bg-blue-50/30 text-slate-800 border-blue-200 hover:border-brand-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs">{bed.bed_number}</span>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span
                          className={`text-[10px] block mt-1 ${
                            isSelected ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          {bed.bed_type}
                        </span>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {bed.has_oxygen && (
                            <span className={`text-[8px] font-bold px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                              O₂
                            </span>
                          )}
                          {bed.has_ventilator && (
                            <span className={`text-[8px] font-bold px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
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

            {/* Target Bed Summary */}
            {targetBed && targetWard && (
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Selected Target</span>
                  <h5 className="font-extrabold text-slate-800">{targetBed.bed_number} • {targetWard.name}</h5>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-600">₹{targetBed.price_per_day || targetWard.base_price_per_day}/day</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP C: CLINICAL JUSTIFICATION & AUTHORIZATION */}
        <div className="bg-white p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              C
            </span>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              Transfer Justification &amp; Clinical Audit Record
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Reason for Transfer *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="Clinical Condition Improved (Step-down to General Ward)">
                  Clinical Condition Improved (Step-down to General Ward)
                </option>
                <option value="Clinical Deterioration (Shift to ICU / Intensive Care)">
                  Clinical Deterioration (Shift to ICU / Intensive Care)
                </option>
                <option value="Specialized Monitoring Required (Cardiac / High Flow O₂)">
                  Specialized Monitoring Required (Cardiac / High Flow O₂)
                </option>
                <option value="Infection Control / Isolation Requirement">
                  Infection Control / Isolation Requirement
                </option>
                <option value="Patient / Family Category Upgrade Request">
                  Patient / Family Category Upgrade Request
                </option>
                <option value="Ward Sanitization / Maintenance Shift">
                  Ward Sanitization / Maintenance Shift
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorized Transferring Physician *
              </label>
              <input
                type="text"
                value={transferredBy}
                onChange={(e) => setTransferredBy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physician Transfer Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hemodynamically stable. Vitals normal on room air. Shifted for observation."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            ></textarea>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Executing this shift will instantaneously update bed availability and log a permanent audit record.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !selectedAdmissionId || !targetBedId}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 shrink-0"
            >
              {isSubmitting ? (
                <span>Executing Shift...</span>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Execute Clinical Bed Transfer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TransfersPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Transfer Pipeline...</div>}>
        <TransfersPipeline />
      </Suspense>
    </AppShell>
  );
}
