'use client';
import {usePullRefresh} from '@/components/PullToRefresh';
import { DataSkeleton } from '@/components/LoadingFeedback';
import { ButtonSpinner } from '@/components/LoadingFeedback';


import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ward, Bed } from '@/types';
import { DataService, DoctorProfile } from '@/lib/supabase';
import { AuthService, ActiveStaff, StaffRole } from '@/lib/auth';
import {
  Settings,
  Sliders,
  BedDouble,
  Building2,
  UserPlus,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Search,
  DollarSign,
  Activity,
  Phone,
  RefreshCw,
  Layers,
  Lock,
  Check,
  Sparkles,
  User,
  Users,
  X,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type SettingsTab = 'wards' | 'doctors' | 'staff' | 'system';

function SettingsHub() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'wards';

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<ActiveStaff | null>(null);

  // Filters & Search
  const [wardFilter, setWardFilter] = useState('all');
  const [bedSearch, setBedSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');

  // Modals
  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Form: Add Ward
  const [wardName, setWardName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [wardFloor, setWardFloor] = useState('1st Floor');
  const [wardDepartment, setWardDepartment] = useState('General Medicine');
  const [wardColor, setWardColor] = useState('#183E33');

  // Form: Add Bed
  const [newBedWardId, setNewBedWardId] = useState('');
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedType, setNewBedType] = useState('Standard General');
  const [newBedRate, setNewBedRate] = useState<number | ''>(2000);
  const [hasOxygen, setHasOxygen] = useState(true);
  const [hasVentilator, setHasVentilator] = useState(false);
  const [hasMonitor, setHasMonitor] = useState(false);

  // Form: Add Doctor
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docDept, setDocDept] = useState('Critical Care / ICU');

  // Form: Add Staff
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Nurse');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffSector, setNewStaffSector] = useState('General Ward');

  // Status messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const [w, b, d] = await Promise.all([
        DataService.getWards(),
        DataService.getBeds(),
        DataService.getDoctors(),
      ]);
      setWards(w);
      setBeds(b);
      setDoctors(d);
      if (w.length > 0 && !newBedWardId) {
        setNewBedWardId(w[0].id);
      }
    } catch (err) {
      console.error('Error loading settings data:', err);
    } finally {
      setLoading(false);
    }
  };

 usePullRefresh(loadData);
  useEffect(() => {
    loadData();
    setStaff(AuthService.getCurrentStaff());

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('bedpulse_data_change', handleDataChange);
    window.addEventListener('storage', handleDataChange);
    return () => {
      window.removeEventListener('bedpulse_data_change', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  // Flash feedback helper
  const showFlash = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- SUBMISSIONS ---

  // 1. Add Ward
  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardName.trim() || !wardCode.trim()) {
      showFlash('error', 'Please provide Ward Name and Code.');
      return;
    }
    setIsSubmitting(true);
    try {
      await DataService.addWard({
        name: wardName.trim(),
        code: wardCode.trim().toUpperCase(),
        floor: wardFloor,
        description: wardDepartment,
        color_accent: wardColor,
      });
      confetti({ particleCount: 40, spread: 60 });
      showFlash('success', `Ward "${wardName}" successfully created!`);
      setWardName('');
      setWardCode('');
      setShowAddWardModal(false);
      await loadData();
    } catch (err: any) {
      showFlash('error', err?.message || 'Failed to create ward.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Add Bed
  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedWardId || !newBedNumber.trim()) {
      showFlash('error', 'Please select a ward and specify Bed Number.');
      return;
    }
    setIsSubmitting(true);
    try {
      await DataService.addBed({
        ward_id: newBedWardId,
        bed_number: newBedNumber.trim().toUpperCase(),
        room_type: newBedType,
        daily_rate: Number(newBedRate) || 2000,
        status: 'vacant',
      });
      confetti({ particleCount: 40, spread: 60 });
      showFlash('success', `Bed "${newBedNumber.toUpperCase()}" added to inventory!`);
      setNewBedNumber('');
      setShowAddBedModal(false);
      await loadData();
    } catch (err: any) {
      showFlash('error', err?.message || 'Failed to add bed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Delete Bed
  const handleDeleteBed = async (bedId: string, bedNumber: string) => {
    if (!confirm(`Are you sure you want to remove Bed ${bedNumber} from the inventory?`)) return;
    try {
      await DataService.deleteBed(bedId);
      showFlash('success', `Bed ${bedNumber} removed.`);
      await loadData();
    } catch (err: any) {
      showFlash('error', err?.message || 'Could not delete bed.');
    }
  };

  // 4. Add Doctor
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      showFlash('error', 'Doctor Name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formatted = docName.trim().startsWith('Dr.') ? docName.trim() : `Dr. ${docName.trim()}`;
      await DataService.addDoctor({
        name: formatted,
        specialty: docSpecialty.trim() || 'Attending Physician',
        department: docDept.trim() || 'General Medicine',
      });
      confetti({ particleCount: 40, spread: 60 });
      showFlash('success', `${formatted} added to Hospital Doctors Roster!`);
      setDocName('');
      setDocSpecialty('');
      setShowAddDocModal(false);
      await loadData();
    } catch (err: any) {
      showFlash('error', err?.message || 'Failed to add doctor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Delete Doctor
  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from hospital directory?`)) return;
    try {
      await DataService.deleteDoctor(id);
      showFlash('success', `${name} removed from roster.`);
      await loadData();
    } catch (err: any) {
      showFlash('error', err?.message || 'Could not remove doctor.');
    }
  };

  // 6. Add Staff Member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      showFlash('error', 'Staff name and clinical email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      // If role is Doctor, also add to doctors roster
      if (newStaffRole === 'Doctor') {
        const formatted = newStaffName.trim().startsWith('Dr.') ? newStaffName.trim() : `Dr. ${newStaffName.trim()}`;
        await DataService.addDoctor({
          name: formatted,
          specialty: 'Attending Physician',
          department: newStaffSector,
        });
      }
      confetti({ particleCount: 40, spread: 60 });
      showFlash('success', `Staff member ${newStaffName} (${newStaffRole}) successfully onboarded!`);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPin('');
      setShowAddStaffModal(false);
      await loadData();
    } catch (err: any) {
      showFlash('error', err?.message || 'Failed to register staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered beds
  const filteredBeds = beds.filter((b) => {
    if (wardFilter !== 'all' && b.ward_id !== wardFilter) return false;
    if (bedSearch.trim()) {
      const q = bedSearch.toLowerCase();
      const matchNo = b.bed_number.toLowerCase().includes(q);
      const ward = wards.find((w) => w.id === b.ward_id);
      const matchWard = ward?.name.toLowerCase().includes(q);
      return matchNo || matchWard;
    }
    return true;
  });

  // Filtered doctors
  const filteredDoctors = doctors.filter((d) => {
    if (!docSearch.trim()) return true;
    const q = docSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.department.toLowerCase().includes(q);
  });

  if (loading) return <><DataSkeleton /></>;

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* TOP HEADER */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
              <Settings className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Hospital Master Settings Hub
                </h1>
                <span className="bg-brand-100 text-brand-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized setup hub for Wards, Beds, Doctor Rosters, and Staff Management.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadData}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <a
              href="tel:+917000371321"
              className="px-3.5 py-2 bg-brand-50 text-brand-600 border border-brand-100 rounded-2xl text-xs font-bold hover:bg-brand-500 hover:text-white transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Helpline: +91 7000371321</span>
            </a>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 4 UNIFIED SETTINGS TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('wards')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'wards'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Wards &amp; Beds Master ({beds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'doctors'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors &amp; Consultants Roster ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Staff Management &amp; Onboarding</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital Profile &amp; Helpline</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: WARDS & BEDS MASTER */}
        {/* ========================================================================= */}
        {activeTab === 'wards' && (
          <div className="space-y-6">
            {/* KPI METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-3xl border border-brand-50 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Wards
                </span>
                <p className="text-2xl font-semibold text-slate-900">{wards.length}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active Hospital Wings</p>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-brand-50 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Beds
                </span>
                <p className="text-2xl font-semibold text-brand-600">{beds.length}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Inventory Capacity</p>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-brand-50 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Occupied Beds
                </span>
                <p className="text-2xl font-semibold text-brand-600">
                  {beds.filter((b) => b.status === 'occupied').length}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active Inpatients</p>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-brand-50 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Available Beds
                </span>
                <p className="text-2xl font-semibold text-emerald-600">
                  {beds.filter((b) => b.status === 'vacant').length}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Instant Intake Ready</p>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bedSearch}
                    onChange={(e) => setBedSearch(e.target.value)}
                    placeholder="Search bed number or ward..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Ward Filter */}
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Wards ({beds.length} beds)</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAddWardModal(true)}
                  className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Ward</span>
                </button>

                <button
                  onClick={() => setShowAddBedModal(true)}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/25"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Bed</span>
                </button>
              </div>
            </div>

            {/* BEDS TABLE / INVENTORY */}
            <div className="bg-white rounded-3xl border border-brand-50 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-500" />
                  <span>Bed Inventory Master</span>
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  Showing {filteredBeds.length} of {beds.length} beds
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Bed Number</th>
                      <th className="py-3 px-4">Ward / Wing</th>
                      <th className="py-3 px-4">Room Type</th>
                      <th className="py-3 px-4">Daily Tariff</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredBeds.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No beds match the criteria. Click "+ Add Bed" above to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredBeds.map((bed) => {
                        const ward = wards.find((w) => w.id === bed.ward_id);
                        return (
                          <tr key={bed.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                              <BedDouble className="w-4 h-4 text-brand-500" />
                              <span>{bed.bed_number}</span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{ward?.name || 'General'}</p>
                              <p className="text-[10px] text-slate-400">{ward?.floor || '1st Floor'}</p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-600">
                              {bed.room_type || 'Standard'}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              ₹{bed.daily_rate || 2000}/day
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                  bed.status === 'vacant'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : bed.status === 'occupied'
                                    ? 'bg-brand-100 text-brand-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {bed.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteBed(bed.id, bed.bed_number)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                                title="Remove Bed"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WARDS DIRECTORY CARDS */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>Hospital Wards &amp; Wings ({wards.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wards.map((ward) => {
                  const wardBedCount = beds.filter((b) => b.ward_id === ward.id).length;
                  const wardOccupied = beds.filter((b) => b.ward_id === ward.id && b.status === 'occupied').length;
                  return (
                    <div
                      key={ward.id}
                      className="bg-white p-5 rounded-3xl border border-brand-50 shadow-xs space-y-3 relative overflow-hidden"
                    >
                      <div
                        className="w-1.5 absolute left-0 top-0 bottom-0"
                        style={{ backgroundColor: ward.color_accent || '#183E33' }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">{ward.name}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ward.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {ward.floor || 'Floor'} • {ward.description || 'Clinical Care Unit'}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Total Capacity:</span>
                        <span className="text-brand-600">
                          {wardOccupied} / {wardBedCount} Occupied
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DOCTORS & CONSULTANTS ROSTER */}
        {/* ========================================================================= */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* ACTION & SEARCH */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search doctor by name, specialty, or department..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                onClick={() => setShowAddDocModal(true)}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/25 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Doctor to Roster</span>
              </button>
            </div>

            {/* DOCTORS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-5 rounded-3xl border border-brand-100/80 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-brand-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-semibold text-xs border border-brand-100 shadow-2xs">
                        MD
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{doc.name}</h4>
                        <span className="inline-block text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.2 rounded-md border border-brand-100/70 mt-0.5">
                          {doc.specialty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Dept: {doc.department || 'General'}</span>
                    <button
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STAFF MANAGEMENT & ONBOARDING */}
        {/* ========================================================================= */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: ONBOARD NEW STAFF FORM */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-brand-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Onboard New Hospital Staff</h3>
                  <p className="text-[11px] text-slate-500">Create access credentials for Doctor, Nurse, or Admin</p>
                </div>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
                {/* Role Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Designated Operational Role *
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                    {(['Doctor', 'Nurse', 'Admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewStaffRole(r)}
                        className={`py-1.5 text-center rounded-xl font-bold text-xs transition ${
                          newStaffRole === r ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Staff Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Staff Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder={newStaffRole === 'Doctor' ? 'e.g. Dr. Sneha Roy, MD' : 'e.g. Sister Aarti Verma'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                {/* Email / ID */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Clinical Email / Staff ID *</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="e.g. staff.name@bedpulse.health"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-800"
                  />
                </div>

                {/* PIN / Password */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Shift PIN / Password</label>
                  <input
                    type="password"
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value)}
                    placeholder="Shift access PIN (min 4 characters)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-800 font-mono"
                  />
                </div>

                {/* Assigned Sector */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Duty Ward Sector</label>
                  <select
                    value={newStaffSector}
                    onChange={(e) => setNewStaffSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="ICU / Critical Care">ICU / Critical Care</option>
                    <option value="Male General Ward">Male General Ward</option>
                    <option value="Female General Ward">Female General Ward</option>
                    <option value="Deluxe & Private Wing">Deluxe &amp; Private Wing</option>
                    <option value="Hospital Operations">Hospital Operations</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 mt-3"
                >{isSubmitting && <ButtonSpinner />}
                  <Check className="w-4 h-4" />
                  <span>Onboard &amp; Activate Staff Account</span>
                </button>
              </form>
            </div>

            {/* RIGHT: PERMISSION MATRIX CARD */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-brand-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Hospital Role Permissions Matrix</h3>
                  <p className="text-[11px] text-slate-500">Security separation of duties</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-1">
                  <div className="flex items-center justify-between font-bold text-brand-700">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Doctor Role
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-brand-200">Clinical</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Patient admissions, provisional diagnosis, bed transfer orders, vitals monitoring, and discharge approvals.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5" />
                      Nurse Role
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200">Nursing Floor</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Live ward floor view, terminal bed sanitization ("Mark Clean"), patient shift assistance, intake vitals telemetry.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-1">
                  <div className="flex items-center justify-between font-bold text-brand-700">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Administrator Role
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-brand-200">Full Operations</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Ward management (+ Add Wards, + Add Beds, Tariffs), Doctor Registry, Staff Onboarding, and full clinical override.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HOSPITAL PROFILE & SYSTEM */}
        {/* ========================================================================= */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-brand-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Hospital Facility &amp; Software Identity</h3>
                  <p className="text-[11px] text-slate-500">Official system credentials &amp; operations profile</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold">Platform Name</span>
                  <span className="font-semibold text-slate-800">BedPulse™ Inpatient Care OS</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold">Version &amp; Build</span>
                  <span className="font-bold text-slate-800">v2.4 Enterprise Production</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold">Technology Architecture</span>
                  <span className="font-bold text-slate-800">Next.js 14 App Router + Tailwind CSS</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold">Data Storage Architecture</span>
                  <span className="font-bold text-brand-600">PostgreSQL Cloud + Live Storage Sync</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold">Compliance Status</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hospital workspace
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-brand-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">24/7 Ward Tech Support</h3>
                  <p className="text-[11px] text-slate-500">Dedicated hospital engineering helpline</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-brand-50 to-brand-50/50 rounded-2xl border border-brand-100 space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Developed &amp; maintained by <strong>WebVission</strong> for seamless inpatient care, bed allocation telemetry, and hospital operations.
                </p>
                <div className="pt-2 border-t border-brand-200/60 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500">Direct Engineer Helpline:</p>
                  <a
                    href="tel:+917000371321"
                    className="inline-flex items-center gap-2 font-semibold text-base text-brand-600 hover:text-brand-700 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>+91 7000371321</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ADD WARD MODAL */}
        {/* ========================================================================= */}
        {showAddWardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md border border-brand-100 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Add New Hospital Ward</h3>
                    <p className="text-[10px] text-slate-500">Configure new wing or intensive care department</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddWardModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleAddWard} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ward Name *</label>
                  <input
                    type="text"
                    required
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    placeholder="e.g. Neonatal Intensive Care Unit (NICU)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Ward Code *</label>
                    <input
                      type="text"
                      required
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      placeholder="e.g. NICU"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Floor Location</label>
                    <input
                      type="text"
                      value={wardFloor}
                      onChange={(e) => setWardFloor(e.target.value)}
                      placeholder="e.g. 2nd Floor"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department / Specialty</label>
                  <input
                    type="text"
                    value={wardDepartment}
                    onChange={(e) => setWardDepartment(e.target.value)}
                    placeholder="e.g. Pediatrics / Critical Care"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Color Theme Accent</label>
                  <div className="flex items-center gap-2">
                    {['#183E33', '#10B981', '#63816C', '#F59E0B', '#EF4444'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setWardColor(c)}
                        className={`w-6 h-6 rounded-full transition ${wardColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddWardModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/25"
                  >{isSubmitting && <ButtonSpinner />}
                    Create Ward
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: ADD BED MODAL */}
        {/* ========================================================================= */}
        {showAddBedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md border border-brand-100 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Add Bed to Inventory</h3>
                    <p className="text-[10px] text-slate-500">Allocate a new bed to any active ward</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddBedModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleAddBed} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Ward *</label>
                  <select
                    value={newBedWardId}
                    onChange={(e) => setNewBedWardId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code} - {w.floor})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bed Number / Code *</label>
                    <input
                      type="text"
                      required
                      value={newBedNumber}
                      onChange={(e) => setNewBedNumber(e.target.value)}
                      placeholder="e.g. ICU-05"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Room / Bed Type</label>
                    <input
                      type="text"
                      value={newBedType}
                      onChange={(e) => setNewBedType(e.target.value)}
                      placeholder="e.g. Standard / Deluxe"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Daily Rate Tariff (₹)</label>
                  <input
                    type="number"
                    value={newBedRate}
                    onChange={(e) => setNewBedRate(e.target.value ? Number(e.target.value) : '')}
                    placeholder="2000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBedModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/25"
                  >{isSubmitting && <ButtonSpinner />}
                    Add Bed
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: ADD DOCTOR MODAL */}
        {/* ========================================================================= */}
        {showAddDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md border border-brand-100 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Add Doctor to Hospital Roster</h3>
                    <p className="text-[10px] text-slate-500">Enable in admission dropdowns and duty assignments</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddDocModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma, MD"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specialty / Qualification</label>
                  <input
                    type="text"
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    placeholder="e.g. Critical Care &amp; Pulmonology"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Department / Wing</label>
                  <input
                    type="text"
                    value={docDept}
                    onChange={(e) => setDocDept(e.target.value)}
                    placeholder="e.g. Intensive Care Unit"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDocModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/25"
                  >{isSubmitting && <ButtonSpinner />}
                    Save Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAF9]" />}>
      <SettingsHub />
    </Suspense>
  );
}
