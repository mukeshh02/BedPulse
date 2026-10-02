'use client';

import React, { useState } from 'react';
import { Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { X, LogOut, CheckCircle2, AlertCircle, Printer, Ambulance, Home, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: Admission | null;
  beds: Bed[];
  onDischargeSuccess: () => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  isOpen,
  onClose,
  admission,
  beds,
  onDischargeSuccess,
}) => {
  const [dischargeType, setDischargeType] = useState<'normal' | 'referred' | 'lama'>('normal');
  const [destinationHospital, setDestinationHospital] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('Patient vitals stabilized, course of treatment completed.');
  const [doctorAdvice, setDoctorAdvice] = useState('Continue prescribed oral medications, rest, follow up after 5 days.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  if (!isOpen || !admission) return null;

  const currentBed = beds.find((b) => b.id === admission.bed_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (dischargeType === 'referred' && !destinationHospital.trim()) {
      return setErrorMsg('Please enter destination referral hospital name.');
    }
    if (!dischargeSummary.trim()) {
      return setErrorMsg('Discharge summary note is required.');
    }

    setIsSubmitting(true);
    try {
      await DataService.dischargePatient({
        admissionId: admission.id,
        bedId: admission.bed_id,
        dischargeType,
        destinationHospital: dischargeType === 'referred' ? destinationHospital.trim() : undefined,
        dischargeSummary: dischargeSummary.trim(),
        doctorAdvice: doctorAdvice.trim() || undefined,
        followUpDate: dischargeType === 'normal' ? followUpDate : undefined,
      });

      try {
        confetti({ particleCount: 50, spread: 70 });
      } catch {}

      setShowPrintSlip(true);
      onDischargeSuccess();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-blue-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Step 4: Patient Discharge & Refer</h3>
              <p className="text-[11px] text-emerald-100">Release Bed & Final Clinical Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Discharge Slip View after success */}
        {showPrintSlip ? (
          <div className="p-6 space-y-4 text-xs overflow-y-auto">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold">Discharge Completed Successfully!</h4>
              <p className="text-[11px] text-emerald-700">
                Bed <strong>{currentBed?.bed_number}</strong> has been released and marked for sanitization.
              </p>
            </div>

            {/* Printable summary box */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-slate-50 font-sans print:border-none print:p-0">
              <div className="border-b border-slate-200 pb-2">
                <h5 className="font-extrabold text-sm text-slate-800">BedPulse™ Clinical Discharge Slip</h5>
                <p className="text-[10px] text-slate-400">Developed by WebVission | Support: +91 7000371321</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <p><strong>Patient:</strong> {admission.patient?.full_name}</p>
                <p><strong>UHID:</strong> {admission.patient?.uhid}</p>
                <p><strong>Type:</strong> <span className="uppercase font-bold text-emerald-600">{dischargeType}</span></p>
                <p><strong>Released Bed:</strong> {currentBed?.bed_number}</p>
                {dischargeType === 'referred' && (
                  <p className="col-span-2"><strong>Referred To:</strong> {destinationHospital}</p>
                )}
                <p className="col-span-2"><strong>Doctor Advice:</strong> {doctorAdvice}</p>
                {followUpDate && <p><strong>Follow-up Date:</strong> {followUpDate}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Slip
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Patient Info */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-semibold uppercase">Patient To Discharge</p>
                <h4 className="text-sm font-bold text-slate-900">{admission.patient?.full_name}</h4>
                <p className="text-[11px] text-slate-500">
                  UHID: {admission.patient?.uhid} • Diagnosis: {admission.provisional_diagnosis}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400">Current Bed</span>
                <p className="text-sm font-black text-slate-800">{currentBed?.bed_number}</p>
              </div>
            </div>

            {/* Discharge Action Toggle */}
            <div>
              <label className="block text-slate-700 font-bold mb-2">
                Select Discharge Action Type:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDischargeType('normal')}
                  className={`p-2.5 rounded-2xl border transition text-center font-bold flex flex-col items-center gap-1 ${
                    dischargeType === 'normal'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Normal Discharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDischargeType('referred')}
                  className={`p-2.5 rounded-2xl border transition text-center font-bold flex flex-col items-center gap-1 ${
                    dischargeType === 'referred'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Ambulance className="w-4 h-4" />
                  <span>Refer to Center</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDischargeType('lama')}
                  className={`p-2.5 rounded-2xl border transition text-center font-bold flex flex-col items-center gap-1 ${
                    dischargeType === 'lama'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>LAMA Exit</span>
                </button>
              </div>
            </div>

            {/* If Referred: Destination Hospital */}
            {dischargeType === 'referred' && (
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
                <label className="block text-blue-900 font-bold mb-1">
                  Referred To (Destination Hospital) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIIMS / City Multi-Specialty Hospital"
                  value={destinationHospital}
                  onChange={(e) => setDestinationHospital(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Summary & Advice */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Discharge Summary Note *
              </label>
              <textarea
                rows={2}
                required
                value={dischargeSummary}
                onChange={(e) => setDischargeSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Doctor Advice & Instructions
              </label>
              <textarea
                rows={2}
                value={doctorAdvice}
                onChange={(e) => setDoctorAdvice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {dischargeType === 'normal' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Follow-Up Review Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Discharge...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Discharge & Free Bed 🚪</span>
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
