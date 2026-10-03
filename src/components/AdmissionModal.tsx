'use client';
import { ButtonSpinner } from '@/components/LoadingFeedback';


import React, { useState, useEffect } from 'react';
import { Ward, Bed } from '@/types';
import { DataService } from '@/lib/supabase';
import { X, UserPlus, CheckCircle2, BedDouble, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: Ward[];
  beds: Bed[];
  preSelectedBed?: Bed | null;
  onAdmissionSuccess: () => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  isOpen,
  onClose,
  wards,
  beds,
  preSelectedBed,
  onAdmissionSuccess,
}) => {
  // Form State
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
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill when preSelectedBed changes
  useEffect(() => {
    if (preSelectedBed) {
      setSelectedWardId(preSelectedBed.ward_id);
      setSelectedBedId(preSelectedBed.id);
    } else if (wards.length > 0 && !selectedWardId) {
      setSelectedWardId(wards[0].id);
    }
  }, [preSelectedBed, wards, selectedWardId]);

  if (!isOpen) return null;

  // Available beds in selected ward
  const availableBeds = beds.filter(
    (b) => b.ward_id === selectedWardId && b.status === 'vacant'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) return setErrorMsg('Patient Full Name is required.');
    if (!age || Number(age) <= 0) return setErrorMsg('Valid patient age is required.');
    if (!mobile.trim() || mobile.length < 10) return setErrorMsg('Valid 10-digit mobile number is required.');
    if (!selectedBedId) return setErrorMsg('Please select an available bed in the ward.');
    if (!provisionalDiagnosis.trim()) return setErrorMsg('Provisional diagnosis is required.');

    setIsSubmitting(true);
    try {
      await DataService.admitPatient({
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
        notes: notes.trim() || undefined,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      onAdmissionSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to complete admission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-brand-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Step 1 & 2: Patient Admission & Bed Allocation</h3>
              <p className="text-[11px] text-brand-100">BedPulse Inpatient Intake System</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Patient Demographics */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <span>👤 Step 1: Patient Demographics</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="125"
                    placeholder="Years"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Attendant / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="Relative / Contact person"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <span>🩺 Clinical Admission Info</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Admitting Doctor *
                </label>
                <select
                  value={admittingDoctor}
                  onChange={(e) => setAdmittingDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="Dr. Sharma (Cardio)">Dr. Sharma (Cardiology)</option>
                  <option value="Dr. Verma (Medicine)">Dr. Verma (General Medicine)</option>
                  <option value="Dr. Gupta (Surgery)">Dr. Gupta (General Surgery)</option>
                  <option value="Dr. Neha Kulkarni (Gynae)">Dr. Neha Kulkarni (Gynaecology)</option>
                  <option value="Dr. Alexander (Chief)">Dr. Alexander (Chief of Inpatient)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Provisional Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Viral Pyrexia / Observation"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Step 2: Ward & Bed Allocation */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>🛏️ Step 2: Ward & Bed Selection</span>
              <span className="text-[10px] text-emerald-600 font-normal">
                {availableBeds.length} Vacant in Ward
              </span>
            </h4>

            {/* Ward Selector */}
            <div className="flex gap-2 overflow-x-auto py-2.5">
              {wards.map((ward) => (
                <button
                  type="button"
                  key={ward.id}
                  onClick={() => {
                    setSelectedWardId(ward.id);
                    setSelectedBedId('');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs shrink-0 ${
                    selectedWardId === ward.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ward.code} ({ward.name})
                </button>
              ))}
            </div>

            {/* Bed Chips */}
            <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <label className="block text-slate-600 font-semibold mb-2">
                Click Available Bed to Allocate:
              </label>
              {availableBeds.length === 0 ? (
                <p className="text-rose-500 text-xs py-2 text-center">
                  ⚠️ No vacant beds available in this ward! Please select another ward.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableBeds.map((bed) => {
                    const isSelected = selectedBedId === bed.id;
                    return (
                      <button
                        type="button"
                        key={bed.id}
                        onClick={() => setSelectedBedId(bed.id)}
                        className={`p-2 rounded-xl text-center font-bold text-xs border transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <BedDouble className="w-4 h-4" />
                        <span>{bed.bed_number}</span>
                        <span className="text-[9px] font-normal opacity-80">
                          ₹{bed.daily_rate}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting || !selectedBedId}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-brand-500/20 transition flex items-center gap-2"
            >{isSubmitting && <ButtonSpinner />}
              {isSubmitting ? (
                <span>Admitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Admission & Allocate Bed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
