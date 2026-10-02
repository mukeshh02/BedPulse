'use client';

import React from 'react';
import { Admission, Bed } from '@/types';
import { Activity, ArrowRightLeft, LogOut, User } from 'lucide-react';

interface PatientActivityListProps {
  admissions: Admission[];
  beds: Bed[];
  onShiftBed: (admission: Admission) => void;
  onDischargeBed: (admission: Admission) => void;
}

export const PatientActivityList: React.FC<PatientActivityListProps> = ({
  admissions,
  beds,
  onShiftBed,
  onDischargeBed,
}) => {
  const activeAdmissions = admissions.filter((a) => a.status === 'admitted');

  return (
    <div className="bg-white rounded-3xl p-5 border border-blue-50/80 shadow-[0_10px_35px_rgba(29,119,255,0.04)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-500" />
            <span>Active Inpatient Roster</span>
          </h4>
          <p className="text-[11px] text-slate-400">Currently admitted in wards</p>
        </div>
        <span className="text-[11px] font-bold text-brand-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          {activeAdmissions.length} Patients
        </span>
      </div>

      {activeAdmissions.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No patients currently admitted. Click &quot;Admit Patient&quot; to begin.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 space-y-2 max-h-96 overflow-y-auto pr-1">
          {activeAdmissions.map((adm) => {
            const bed = beds.find((b) => b.id === adm.bed_id);
            return (
              <div key={adm.id} className="pt-2 flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {adm.patient?.full_name || 'Patient'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {bed?.bed_number || 'Bed'} • {adm.provisional_diagnosis}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onShiftBed(adm)}
                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-100"
                    title="Shift Bed"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDischargeBed(adm)}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-100"
                    title="Discharge Patient"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
