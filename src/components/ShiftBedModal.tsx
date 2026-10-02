'use client';

import React, { useState } from 'react';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { X, ArrowRightLeft, CheckCircle2, BedDouble, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShiftBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: Admission | null;
  wards: Ward[];
  beds: Bed[];
  onShiftSuccess: () => void;
}

export const ShiftBedModal: React.FC<ShiftBedModalProps> = ({
  isOpen,
  onClose,
  admission,
  wards,
  beds,
  onShiftSuccess,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [reason, setReason] = useState<string>('Clinical Condition Improved (Step-down)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Set initial ward
  React.useEffect(() => {
    if (admission) {
      const currentBed = beds.find((b) => b.id === admission.bed_id);
      if (currentBed) {
        setSelectedWardId(currentBed.ward_id);
      }
    }
  }, [admission, beds]);

  if (!isOpen || !admission) return null;

  const currentBed = beds.find((b) => b.id === admission.bed_id);
  const currentWard = wards.find((w) => w.id === currentBed?.ward_id);

  // Available vacant beds in target ward
  const availableBeds = beds.filter(
    (b) => b.ward_id === selectedWardId && b.status === 'vacant' && b.id !== currentBed?.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!targetBedId) {
      return setErrorMsg('Please select a target vacant bed to transfer the patient.');
    }

    setIsSubmitting(true);
    try {
      await DataService.shiftBed({
        admissionId: admission.id,
        fromBedId: admission.bed_id,
        toBedId: targetBedId,
        reason,
        transferredBy: 'Duty Medical Officer',
      });

      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {}

      onShiftSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to complete bed shift.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-blue-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Step 3: Bed Transfer / Shift in Ward</h3>
              <p className="text-[11px] text-amber-100">Live Ward Shift Execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Patient Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[11px] font-semibold">Transferring Patient:</p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {admission.patient?.full_name}
              </h4>
              <p className="text-[11px] text-slate-500">
                UHID: {admission.patient?.uhid} • Diagnosis: {admission.provisional_diagnosis}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Current Bed</span>
              <p className="text-sm font-black text-slate-800">
                {currentBed?.bed_number} ({currentWard?.code})
              </p>
            </div>
          </div>

          {/* Destination Ward Picker */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Select Destination Ward:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {wards.map((ward) => (
                <button
                  type="button"
                  key={ward.id}
                  onClick={() => {
                    setSelectedWardId(ward.id);
                    setTargetBedId('');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs shrink-0 ${
                    selectedWardId === ward.id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ward.code} ({ward.name})
                </button>
              ))}
            </div>
          </div>

          {/* Available Beds in Target Ward */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <label className="block text-slate-700 font-bold mb-2">
              Select Vacant Bed to Shift:
            </label>
            {availableBeds.length === 0 ? (
              <p className="text-rose-500 text-xs py-2 text-center">
                ⚠️ No vacant beds available in this ward! Please choose another ward.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableBeds.map((bed) => {
                  const isSelected = targetBedId === bed.id;
                  return (
                    <button
                      type="button"
                      key={bed.id}
                      onClick={() => setTargetBedId(bed.id)}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                      <span>{bed.bed_number}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        ₹{bed.daily_rate}/d
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reason for Transfer */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Clinical / Operational Reason:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              {[
                'Clinical Condition Improved (Step-down)',
                'Condition Deteriorated (Shift to ICU)',
                'Patient Request (Room Upgrade)',
                'Sanitization / Ward Maintenance',
              ].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className={`p-2 rounded-xl text-left border transition text-[11px] font-semibold ${
                    reason === r
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or write custom transfer reason..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

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
              disabled={isSubmitting || !targetBedId}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Executing Shift...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Bed Shift 🔄</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
