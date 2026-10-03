'use client';
import {usePullRefresh} from '@/components/PullToRefresh';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Ward,Bed,Admission} from '@/types';
import {DataService} from '@/lib/supabase';
import {WardBedMatrix} from '@/components/WardBedMatrix';
import {StatCards} from '@/components/StatCards';
import {ButtonSpinner,DataSkeleton,startNavigation} from '@/components/LoadingFeedback';
import {RefreshCw} from 'lucide-react';
export default function WardsPage(){
 const router=useRouter();const [wards,setWards]=useState<Ward[]>([]);const [beds,setBeds]=useState<Bed[]>([]);const [admissions,setAdmissions]=useState<Admission[]>([]);const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [error,setError]=useState('');
 async function loadData(){setRefreshing(true);setError('');try{const [w,b,a]=await Promise.all([DataService.getWards(),DataService.getBeds(),DataService.getAdmissions()]);setWards(w);setBeds(b);setAdmissions(a);}catch(e){setError(e instanceof Error?e.message:'Unable to load wards. Try again.');}finally{setLoading(false);setRefreshing(false);}}
 usePullRefresh(loadData);
 useEffect(()=>{loadData();const reload=()=>{void loadData();};const visible=()=>{if(document.visibilityState==='visible')reload();};window.addEventListener('bedpulse_data_change',reload);window.addEventListener('storage',reload);document.addEventListener('visibilitychange',visible);return()=>{window.removeEventListener('bedpulse_data_change',reload);window.removeEventListener('storage',reload);document.removeEventListener('visibilitychange',visible);};},[]);
 function navigate(url:string){startNavigation();router.push(url);}
 async function clean(id:string){await DataService.markBedClean(id);await loadData();}
 return <><div className="space-y-5 pb-6"><header className="flex items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight">Wards & beds</h1><p className="text-xs text-slate-500 mt-2">{wards.length} wards · {beds.length} beds</p></div><button disabled={refreshing} onClick={loadData} className="flex gap-2 items-center rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-xs font-semibold disabled:opacity-60">{refreshing?<ButtonSpinner/>:<RefreshCw size={15}/>}Refresh</button></header>{error&&<p role="alert" className="bg-rose-50 text-rose-700 rounded-xl p-3 text-sm">{error}</p>}{loading?<DataSkeleton/>:<><StatCards occupiedCount={beds.filter(b=>b.status==='occupied').length} availableCount={beds.filter(b=>b.status==='vacant').length} cleaningCount={beds.filter(b=>b.status==='cleaning').length} totalWards={wards.length}/><WardBedMatrix wards={wards} beds={beds} admissions={admissions} onAdmitToBed={b=>navigate(`/admit?bedId=${b.id}`)} onShiftBed={a=>navigate(`/transfers?admissionId=${a.id}`)} onDischargeBed={a=>navigate(`/discharge?admissionId=${a.id}`)} onMarkBedClean={clean}/></>}</div></>;
}
