'use client';
import Link from 'next/link';
import { Users, BedDouble, Sparkles, Building2 } from 'lucide-react';
interface StatCardsProps { occupiedCount: number; availableCount: number; cleaningCount: number; totalWards: number }
export function StatCards({ occupiedCount, availableCount, cleaningCount, totalWards }: StatCardsProps) {
 const cards = [{label:'Admitted patients', value:occupiedCount, icon:Users, href:'/patients'}, {label:'Available beds', value:availableCount, icon:BedDouble, href:'/wards'}, {label:'Need cleaning', value:cleaningCount, icon:Sparkles, href:'/wards'}, {label:'Wards', value:totalWards, icon:Building2, href:'/wards'}];
 return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(({label,value,icon:Icon,href}) => <Link key={label} href={href} className="rounded-2xl border border-[#DFE7DE] bg-white p-5 transition hover:border-[#91AD97]"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-[#7D8E80]">{label}</p><Icon size={18} className="text-[#87A08C]" strokeWidth={1.6}/></div><p className="text-4xl font-semibold tracking-tight text-[#183E33] mt-4">{value}</p></Link>)}</div>;
}
