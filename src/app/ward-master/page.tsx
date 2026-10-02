'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ward, Bed, BedStatus } from '@/types';
import { DataService } from '@/lib/supabase';
import { AppShell } from '@/components/AppShell';
import {
  Sliders,
  BedDouble,
  Building2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  Activity,
  Layers,
  Wrench,
  Check,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WardMasterPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'beds' | 'wards' | 'addBed' | 'addWard'>('beds');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [bedSearch, setBedSearch] = useState('');

  // Add Ward Form State
  const [wardName, setWardName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [wardFloor, setWardFloor] = useState('1st Floor');
  const [wardDepartment, setWardDepartment] = useState('General Medicine');
  const [wardBaseRate, setWardBaseRate] = useState<number | ''>(2000);
  const [wardColor, setWardColor] = useState('#1D77FF');

  // Add Bed Form State
  const [newBedWardId, setNewBedWardId] = useState('');
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedType, setNewBedType] = useState('Standard General');
  const [newBedRate, setNewBedRate] = useState<number | ''>(2000);
  const [hasOxygen, setHasOxygen] = useState(true);
  const [hasVentilator, setHasVentilator] = useState(false);
  const [hasMonitor, setHasMonitor] = useState(false);

  // Submission messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [w, b] = await Promise.all([DataService.getWards(), DataService.getBeds()]);
      setWards(w);
      setBeds(b);
      if (w.length > 0 && !newBedWardId) {
        setNewBedWardId(w[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered beds
  const filteredBeds = beds.filter((b) => {
    if (selectedWardFilter !== 'all' && b.ward_id !== selectedWardFilter) return false;
    if (bedSearch.trim()) {
      const q = bedSearch.toLowerCase();
      const matchNo = b.bed_number.toLowerCase().includes(q);
      const ward = wards.find((w) => w.id === b.ward_id);
      const matchWard = ward?.name.toLowerCase().includes(q);
      return matchNo || matchWard;
    }
    return true;
  });

  const handleStatusChange = async (bedId: string, newStatus: BedStatus) => {
    await DataService.updateBedStatus(bedId, newStatus);
    await loadData();
  };

  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!wardName.trim() || !wardCode.trim()) {
      return setErrorMsg('Ward Name and Ward Code are required.');
    }

    setIsSubmitting(true);
    try {
      await DataService.addWard({
        name: wardName.trim(),
        code: wardCode.trim().toUpperCase(),
        floor: wardFloor.trim(),
        floor_number: wardFloor.trim(),
        department: wardDepartment.trim(),
        base_price_per_day: Number(wardBaseRate) || 1500,
        color_accent: wardColor,
      });

      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {}

      setSuccessMsg(`Ward "${wardName}" established successfully!`);
      setWardName('');
      setWardCode('');
      await loadData();
      setTimeout(() => setActiveTab('wards'), 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to add ward.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newBedWardId) return setErrorMsg('Please choose which Ward this bed belongs to.');
    if (!newBedNumber.trim()) return setErrorMsg('Bed Number is required (e.g. ICU-06, FGW-12).');

    setIsSubmitting(true);
    try {
      await DataService.addBed({
        ward_id: newBedWardId,
        bed_number: newBedNumber.trim().toUpperCase(),
        room_type: newBedType.trim(),
        bed_type: newBedType.trim(),
        daily_rate: Number(newBedRate) || 2000,
        price_per_day: Number(newBedRate) || 2000,
        has_oxygen: hasOxygen,
        has_ventilator: hasVentilator,
        has_cardiac_monitor: hasMonitor,
        status: 'vacant',
      });

      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {}

      setSuccessMsg(`Bed "${newBedNumber.toUpperCase()}" added to inventory successfully!`);
      setNewBedNumber('');
      await loadData();
      setTimeout(() => setActiveTab('beds'), 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to add bed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-blue-50/80 shadow-[0_4px_20px_rgba(29,119,255,0.04)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
              <Sliders className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                  Ward &amp; Bed Master Studio
                </h1>
                <span className="bg-purple-50 text-purple-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                  Dynamic Capacity Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage hospital floor plans, add beds dynamically without code restrictions, and configure equipment tags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              href="/wards"
              className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/25"
            >
              <BedDouble className="w-3.5 h-3.5" />
              Live Ward View
            </Link>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="bg-white p-2 rounded-3xl border border-blue-50/80 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'beds'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Manage Beds ({beds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wards')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'wards'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Wards ({wards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addBed')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'addBed'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Bed</span>
          </button>

          <button
            onClick={() => setActiveTab('addWard')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'addWard'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Ward</span>
          </button>
        </div>

        {/* TAB 1: MANAGE BEDS INVENTORY */}
        {activeTab === 'beds' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-blue-50/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400">Ward:</span>
                <select
                  value={selectedWardFilter}
                  onChange={(e) => setSelectedWardFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700"
                >
                  <option value="all">All Wards ({beds.length} Beds)</option>
                  {wards.map((w) => {
                    const count = beds.filter((b) => b.ward_id === w.id).length;
                    return (
                      <option key={w.id} value={w.id}>
                        {w.name} ({count} Beds)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bedSearch}
                  onChange={(e) => setBedSearch(e.target.value)}
                  placeholder="Search bed number..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Beds Table / Grid */}
            <div className="bg-white rounded-3xl border border-blue-50/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4">Bed Number</th>
                      <th className="p-4">Ward / Wing</th>
                      <th className="p-4">Type &amp; Pricing</th>
                      <th className="p-4">Equipment Tags</th>
                      <th className="p-4">Live Status</th>
                      <th className="p-4 text-right">Quick Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredBeds.map((bed) => {
                      const ward = wards.find((w) => w.id === bed.ward_id);

                      return (
                        <tr key={bed.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4">
                            <span className="font-mono font-black text-slate-900 text-sm flex items-center gap-2">
                              <BedDouble className="w-4 h-4 text-brand-500" />
                              {bed.bed_number}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-800">{ward?.name || 'General'}</span>
                            <span className="text-[10px] block text-slate-400">{ward?.floor_number || ward?.floor}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">{bed.bed_type || bed.room_type || 'Standard'}</span>
                            <span className="block text-brand-600 font-mono font-bold text-[11px]">
                              ₹{bed.price_per_day || bed.daily_rate || ward?.base_price_per_day}/day
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {bed.has_oxygen && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                  O₂
                                </span>
                              )}
                              {bed.has_ventilator && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                  VENT
                                </span>
                              )}
                              {bed.has_cardiac_monitor && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                                  MONITOR
                                </span>
                              )}
                              {!bed.has_oxygen && !bed.has_ventilator && !bed.has_cardiac_monitor && (
                                <span className="text-[10px] text-slate-400">Standard Bay</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                bed.status === 'vacant'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : bed.status === 'occupied'
                                  ? 'bg-brand-100 text-brand-800'
                                  : bed.status === 'cleaning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {bed.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={bed.status}
                              onChange={(e) => handleStatusChange(bed.id, e.target.value as BedStatus)}
                              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="vacant">Set Vacant</option>
                              <option value="occupied">Set Occupied</option>
                              <option value="cleaning">Set Cleaning</option>
                              <option value="maintenance">Set Maintenance</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE WARDS */}
        {activeTab === 'wards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wards.map((ward) => {
              const wardBeds = beds.filter((b) => b.ward_id === ward.id);
              const vacBeds = wardBeds.filter((b) => b.status === 'vacant').length;
              const occBeds = wardBeds.filter((b) => b.status === 'occupied').length;

              return (
                <div
                  key={ward.id}
                  className="bg-white rounded-3xl p-5 border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: ward.color_accent || '#1D77FF' }}
                      >
                        {ward.code || ward.name.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{ward.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {ward.floor_number || ward.floor} • {ward.department || 'Clinical Care'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-brand-600 bg-blue-50 px-2 py-0.5 rounded-xl border border-blue-100">
                      ₹{ward.base_price_per_day || 2000}/d
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">CAPACITY</span>
                      <span className="font-black text-slate-900 text-sm">{wardBeds.length} Beds</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 block uppercase">OCCUPIED</span>
                      <span className="font-black text-brand-600 text-sm">{occBeds}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 block uppercase">VACANT</span>
                      <span className="font-black text-emerald-600 text-sm">{vacBeds}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setNewBedWardId(ward.id);
                        setActiveTab('addBed');
                      }}
                      className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Bed to this Ward
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: ADD NEW BED */}
        {activeTab === 'addBed' && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Add Bed to Hospital Ward
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a new bed number without software limits. Instantly available for admissions.
              </p>
            </div>

            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign to Ward *
                </label>
                <select
                  required
                  value={newBedWardId}
                  onChange={(e) => setNewBedWardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.floor_number || w.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bed Identifier / Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBedNumber}
                    onChange={(e) => setNewBedNumber(e.target.value)}
                    placeholder="e.g. ICU-06 or MGW-14"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Bed Tariff (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newBedRate}
                    onChange={(e) => setNewBedRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bed Category / Room Type
                </label>
                <select
                  value={newBedType}
                  onChange={(e) => setNewBedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="Standard General">Standard General Bed</option>
                  <option value="ICU Ventilator">ICU Ventilator Bed</option>
                  <option value="ICU Monitor">ICU Cardiac Monitor Bed</option>
                  <option value="Semi-Private">Semi-Private Room Bed</option>
                  <option value="Deluxe Suite">Deluxe Suite Bed</option>
                  <option value="Emergency Triage">Emergency Triage Bed</option>
                </select>
              </div>

              {/* Equipment Toggles */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Bedside Equipment &amp; Features:
                </span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOxygen}
                    onChange={(e) => setHasOxygen(e.target.checked)}
                    className="accent-purple-600 w-4 h-4 rounded"
                  />
                  <span>Central Piped Oxygen Port (O₂)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVentilator}
                    onChange={(e) => setHasVentilator(e.target.checked)}
                    className="accent-purple-600 w-4 h-4 rounded"
                  />
                  <span>Mechanical Ventilator Attached (VENT)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMonitor}
                    onChange={(e) => setHasMonitor(e.target.checked)}
                    className="accent-purple-600 w-4 h-4 rounded"
                  />
                  <span>Multi-para Cardiac Monitor Attached (MONITOR)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/25"
              >
                {isSubmitting ? (
                  <span>Saving to Bed Inventory...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Confirm &amp; Register Bed</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CREATE NEW WARD */}
        {activeTab === 'addWard' && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-blue-50/80 shadow-[0_4px_25px_rgba(29,119,255,0.04)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Establish New Hospital Ward / Wing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Define a new clinical department, wing, or special care unit.
              </p>
            </div>

            <form onSubmit={handleAddWard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ward Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    placeholder="e.g. Pediatric Intensive Care"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code (3-4 Letters) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value.toUpperCase())}
                    placeholder="PICU"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floor / Wing Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={wardFloor}
                    onChange={(e) => setWardFloor(e.target.value)}
                    placeholder="e.g. 3rd Floor East Wing"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Daily Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={wardBaseRate}
                    onChange={(e) => setWardBaseRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="3000"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Specialty
                </label>
                <input
                  type="text"
                  value={wardDepartment}
                  onChange={(e) => setWardDepartment(e.target.value)}
                  placeholder="e.g. Pediatrics / Neonatal"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/25"
              >
                {isSubmitting ? (
                  <span>Establishing Ward...</span>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Create &amp; Publish Ward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
