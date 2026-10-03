'use client';
import {usePullRefresh} from '@/components/PullToRefresh';
import { DataSkeleton } from '@/components/LoadingFeedback';

import { ButtonSpinner } from '@/components/LoadingFeedback';


import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ward, Bed, Admission } from '@/types';
import { DataService, HospitalStaff, supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
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
  const [transferredBy, setTransferredBy] = useState('');
  const [hospitalStaff,setHospitalStaff]=useState<HospitalStaff[]>([]);
  const [performedBy,setPerformedBy]=useState('');
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

      const activeAdmissions = a.filter((adm) => ['admitted','shifted'].includes(adm.status));

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

      const roster=await DataService.getHospitalStaff();setHospitalStaff(roster);
      const {data:{user}}=await supabase.auth.getUser();if(user)setPerformedBy(prev=>prev||user.id);
      const currentStaff = AuthService.getCurrentStaff();
      if (currentStaff?.name) {
        setTransferredBy(currentStaff.name);
      } else {
        setTransferredBy('Attending Staff');
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

  const activeAdmissions = admissions.filter((a) => ['admitted','shifted'].includes(a.status));
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
        performedBy,
      });

      setSuccessInfo({
        patientName: currentAdmission.patient?.full_name,
        fromBed: currentBed?.bed_number || 'Bed',
        toBed: targetBed?.bed_number || 'Bed',
        fromWard: currentWard?.name || 'Ward',
        toWard: targetWard?.name || 'Ward',
        timestamp: new Date().toLocaleTimeString('en-IN'),
      });



      setTargetBedId('');
      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to complete bed transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DataSkeleton />;

  return <div className="max-w-4xl mx-auto space-y-5 pb-8">
    <header className="flex items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight">Bed transfer</h1><p className="text-xs text-slate-500 mt-2">Move a patient to an available bed.</p></div><Link href="/wards" className="text-xs text-brand-600 border border-brand-100 bg-white rounded-xl px-3 py-2.5">View beds</Link></header>
    {errorMsg&&<p role="alert" className="bg-rose-50 rounded-xl p-3 text-sm text-rose-700">{errorMsg}</p>}
    {successInfo&&<section role="status" className="bg-brand-50 border border-brand-200 rounded-xl p-4"><p className="text-sm font-semibold flex gap-2 items-center"><CheckCircle2 size={17}/>Transfer complete</p><p className="text-xs text-slate-500 mt-2">{successInfo.patientName} · {successInfo.fromBed} → {successInfo.toBed}</p></section>}
    {!activeAdmissions.length?<section className="bg-white border border-brand-100 rounded-2xl p-8 text-center"><h2 className="font-semibold">No admitted patients to transfer</h2><Link href="/patients" className="block text-sm text-brand-600 mt-4">View patients</Link></section>:<form onSubmit={handleExecuteTransfer} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-brand-100 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-semibold">1. Select patient</h2><label className="block text-xs text-slate-500">Patient<select required value={selectedAdmissionId} onChange={e=>{setSelectedAdmissionId(e.target.value);setTargetBedId('');setSuccessInfo(null);}} className="mt-2 w-full border border-brand-100 rounded-xl p-3 text-sm text-brand-800"><option value="">Choose patient</option>{activeAdmissions.map(a=><option key={a.id} value={a.id}>{a.patient?.full_name} · {a.bed?.bed_number}</option>)}</select></label>{currentAdmission&&<div className="bg-[#F8FAF9] border border-brand-100 rounded-xl p-4"><div className="flex justify-between gap-3"><div><h3 className="text-sm font-semibold">{currentAdmission.patient?.full_name}</h3><p className="text-xs text-slate-500 mt-1">{currentAdmission.patient?.age} years · {currentAdmission.patient?.gender}</p></div><span className="bg-brand-100 rounded-lg text-xs px-2 py-1 self-start">{currentBed?.bed_number}</span></div><p className="text-xs text-slate-500 mt-3">{currentWard?.name}</p><p className="text-xs mt-3">{currentAdmission.provisional_diagnosis}</p><p className="text-xs text-slate-500 mt-1">{currentAdmission.admitting_doctor}</p></div>}</section>
        <section className="bg-white border border-brand-100 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-semibold">2. Choose destination</h2><label className="block text-xs text-slate-500">Ward<select required value={targetWardId} onChange={e=>{setTargetWardId(e.target.value);setTargetBedId('');}} className="mt-2 w-full border border-brand-100 rounded-xl p-3 text-sm text-brand-800"><option value="">Choose ward</option>{wards.map(w=><option key={w.id} value={w.id}>{w.name} · {beds.filter(b=>b.ward_id===w.id&&b.status==='vacant').length} available</option>)}</select></label><fieldset><legend className="text-xs text-slate-500 mb-2">Available beds</legend><div className="grid grid-cols-3 gap-2">{availableBeds.map(b=><button type="button" key={b.id} aria-pressed={targetBedId===b.id} onClick={()=>setTargetBedId(b.id)} className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition ${targetBedId===b.id?'bg-brand-700 border-brand-700 text-white':'bg-[#F8FAF9] border-brand-100 text-brand-700 hover:border-brand-400'}`}><BedDouble size={14}/>{b.bed_number}</button>)}</div>{!availableBeds.length&&<p className="text-xs text-slate-500 py-3">No available beds here. Choose another ward.</p>}</fieldset></section>
      </div>
      <section className="bg-white border border-brand-100 rounded-2xl p-5 space-y-4"><h2 className="text-sm font-semibold">3. Transfer details</h2><div className="grid sm:grid-cols-2 gap-4"><label className="text-xs text-slate-500">Reason<select value={reason} onChange={e=>setReason(e.target.value)} className="block mt-2 w-full border border-brand-100 rounded-xl p-3 text-sm text-brand-800"><option>Clinical Condition Improved (Step-down to General Ward)</option><option>Higher level of care required</option><option>Patient / family request</option><option>Bed or ward availability</option><option>Other</option></select></label><label className="text-xs text-slate-500">Performed by<select required value={performedBy} onChange={e=>{setPerformedBy(e.target.value);setTransferredBy(hospitalStaff.find(s=>s.user_id===e.target.value)?.full_name||'');}} className="block mt-2 w-full border border-brand-100 rounded-xl p-3 text-sm text-brand-800"><option value="">Choose staff</option>{hospitalStaff.map(s=><option key={s.user_id} value={s.user_id}>{s.full_name} · {s.role}</option>)}</select></label></div><label className="block text-xs text-slate-500">Notes (optional)<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Add relevant transfer notes" className="mt-2 w-full border border-brand-100 rounded-xl p-3 text-sm text-brand-800"/></label><p className="text-[11px] text-slate-500">Recorded by {AuthService.getCurrentStaff()?.name}. The previous bed will need cleaning.</p></section>
      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"><div className="text-sm font-semibold flex items-center gap-3"><span>{currentBed?.bed_number||'Current bed'}</span><ArrowRight size={16} className="text-brand-400"/><span>{targetBed?.bed_number||'Select destination'}</span></div><button disabled={isSubmitting||!currentAdmission||!targetBedId||!performedBy} className="flex justify-center items-center gap-2 bg-brand-700 text-white rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-40">{isSubmitting?<ButtonSpinner/>:<ArrowRightLeft size={16}/>} {isSubmitting?'Transferring…':'Confirm transfer'}</button></section>
    </form>}
  </div>;
}
export default function TransfersPage() {
  return (
    <>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading transfers…</div>}>
        <TransfersPipeline />
      </Suspense>
    </>
  );
}
