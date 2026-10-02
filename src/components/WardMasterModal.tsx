'use client';

import React, { useState } from 'react';
import { Ward, Bed } from '@/types';
import { DataService } from '@/lib/supabase';
import { X, Sliders, Plus, Building2, BedDouble, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WardMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: Ward[];
  beds: Bed[];
  onRefreshData: () => void;
}

export const WardMasterModal: React.FC<WardMasterModalProps> = ({
  isOpen,
  onClose,
  wards,
  beds,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'beds' | 'wards' | 'addBed' | 'addWard'>('beds');

  // Add Ward Form
  const [wardName, setWardName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [wardFloor, setWardFloor] = useState('1st Floor');
  const [wardColor, setWardColor] = useState('#1D77FF');

  // Add Bed Form
  const [selectedWardId, setSelectedWardId] = useState(wards[0]?.id || '');
  const [bedNumber, setBedNumber] = useState('');
  const [roomType, setRoomType] = useState('Standard General');
  const [dailyRate, setDailyRate] = useState<number | ''>(1500);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

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
        color_accent: wardColor,
      });

      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch {}

      setSuccessMsg(`Ward "${wardName}" created successfully!`);
      setWardName('');
      setWardCode('');
      onRefreshData();
      setTimeout(() => setActiveTab('wards'), 1000);
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

    if (!selectedWardId) {
      return setErrorMsg('Please choose which Ward this bed belongs to.');
    }
    if (!bedNumber.trim()) {
      return setErrorMsg('Bed Number is required (e.g. ICU-06, FGW-14).');
    }

    setIsSubmitting(true);
    try {
      await DataService.addBed({
        ward_id: selectedWardId,
        bed_number: bedNumber.trim().toUpperCase(),
        room_type: roomType.trim(),
        daily_rate: Number(dailyRate) || 0,
        status: 'vacant',
      });

      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch {}

      setSuccessMsg(`Bed "${bedNumber.toUpperCase()}" added successfully!`);
      setBedNumber('');
      onRefreshData();
      setTimeout(() => setActiveTab('beds'), 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to add bed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-blue-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Dynamic Ward & Bed Master Studio</h3>
              <p className="text-[11px] text-purple-100">Configure Wards, Beds & Room Charges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Studio Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              setActiveTab('beds');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'beds'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Manage Beds ({beds.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('wards');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'wards'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Wards ({wards.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('addBed');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'addBed'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Bed</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('addWard');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'addWard'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Ward</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: MANAGE BEDS */}
          {activeTab === 'beds' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">All configured beds in the hospital:</p>
                <button
                  onClick={() => setActiveTab('addBed')}
                  className="px-3 py-1 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Bed
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {beds.map((b) => {
                  const ward = wards.find((w) => w.id === b.ward_id);
                  return (
                    <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: ward?.color_accent || '#1D77FF' }}
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">
                            {b.bed_number} — <span className="font-normal text-slate-500">{ward?.name}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {b.room_type} • ₹{b.daily_rate}/day
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          b.status === 'occupied'
                            ? 'bg-rose-50 text-rose-600'
                            : b.status === 'cleaning'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE WARDS */}
          {activeTab === 'wards' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Active hospital wards:</p>
                <button
                  onClick={() => setActiveTab('addWard')}
                  className="px-3 py-1 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Ward
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wards.map((w) => {
                  const wardBeds = beds.filter((b) => b.ward_id === w.id);
                  return (
                    <div key={w.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{w.name}</span>
                        <span className="font-extrabold text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {w.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Floor: {w.floor || 'N/A'}</p>
                      <p className="text-[11px] font-bold text-purple-700 mt-2">
                        {wardBeds.length} Total Configured Beds
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW BED */}
          {activeTab === 'addBed' && (
            <form onSubmit={handleAddBed} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Ward *</label>
                <select
                  value={selectedWardId}
                  onChange={(e) => setSelectedWardId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  required
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bed Identifier / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU-06 or FGW-14 or PVT-04"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Room / Bed Type</label>
                  <input
                    type="text"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    placeholder="e.g. ICU Ventilator, Deluxe Suite"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Daily Bed Rate (₹)</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-md shadow-purple-600/20"
                >
                  {isSubmitting ? 'Creating Bed...' : 'Save New Bed'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ADD NEW WARD */}
          {activeTab === 'addWard' && (
            <form onSubmit={handleAddWard} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ward Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pediatric Ward"
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ward Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PED"
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Floor / Wing</label>
                  <input
                    type="text"
                    value={wardFloor}
                    onChange={(e) => setWardFloor(e.target.value)}
                    placeholder="e.g. 2nd Floor West Wing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Color Tag</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={wardColor}
                      onChange={(e) => setWardColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-500">{wardColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-md shadow-purple-600/20"
                >
                  {isSubmitting ? 'Creating Ward...' : 'Save New Ward'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
