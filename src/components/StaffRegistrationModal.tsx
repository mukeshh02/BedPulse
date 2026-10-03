'use client';
import Link from 'next/link';
interface Props { isOpen: boolean; onClose: () => void; onSuccess: (name: string, role: string) => void }
export function StaffRegistrationModal({isOpen,onClose}: Props) { if(!isOpen) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6"><section className="bg-white p-8 rounded-3xl"><h2 className="font-bold mb-4">Invite hospital staff</h2><p className="mb-4">Use hospital settings to invite staff with their assigned role.</p><Link href="/setup" className="text-brand-600">Open hospital settings</Link><button onClick={onClose} className="ml-5">Close</button></section></div>; }
