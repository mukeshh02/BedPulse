'use client';

import React, { useState, useEffect } from 'react';
import { Ward, Bed, Admission } from '@/types';
import { DataService } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { HeroBanner } from '@/components/HeroBanner';
import { StatCards } from '@/components/StatCards';
import { WardBedMatrix } from '@/components/WardBedMatrix';
import { WardDonutChart } from '@/components/WardDonutChart';
import { PatientActivityList } from '@/components/PatientActivityList';
import { AdmissionModal } from '@/components/AdmissionModal';
import { ShiftBedModal } from '@/components/ShiftBedModal';
import { DischargeModal } from '@/components/DischargeModal';
import { WardMasterModal } from '@/components/WardMasterModal';
import { DoctorProfileModal } from '@/components/DoctorProfileModal';
import { InpatientsDirectory } from '@/components/InpatientsDirectory';
import { SignInModal } from '@/components/SignInModal';
import { StaffRegistrationModal } from '@/components/StaffRegistrationModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileLiveBedScroller } from '@/components/MobileLiveBedScroller';
import { UserPlus } from 'lucide-react';

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Controls
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [preSelectedBed, setPreSelectedBed] = useState<Bed | null>(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAdmission, setTransferAdmission] = useState<Admission | null>(null);

  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [dischargeAdmission, setDischargeAdmission] = useState<Admission | null>(null);

  const [isWardMasterOpen, setIsWardMasterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({ name: 'Dr. Alexander Wright, MD', role: 'Doctor' });

  // Load / Refresh Data
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
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered beds by search query
  const filteredBeds = beds.filter((bed) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const bedMatch = bed.bed_number.toLowerCase().includes(q);
    const wardMatch = wards.find((w) => w.id === bed.ward_id)?.name.toLowerCase().includes(q);
    const admission = admissions.find((a) => a.bed_id === bed.id && a.status === 'admitted');
    const patientMatch =
      admission?.patient?.full_name.toLowerCase().includes(q) ||
      admission?.patient?.uhid.toLowerCase().includes(q) ||
      admission?.admission_number.toLowerCase().includes(q);
    return bedMatch || wardMatch || patientMatch;
  });

  // KPI counts
  const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
  const availableCount = beds.filter((b) => b.status === 'vacant').length;
  const cleaningCount = beds.filter((b) => b.status === 'cleaning').length;

  // Triggers from bed matrix
  const handleAdmitToBed = (bed: Bed) => {
    setPreSelectedBed(bed);
    setIsAdmissionOpen(true);
  };

  const handleShiftBed = (admission: Admission) => {
    setTransferAdmission(admission);
    setIsTransferOpen(true);
  };

  const handleDischargeBed = (admission: Admission) => {
    setDischargeAdmission(admission);
    setIsDischargeOpen(true);
  };

  const handleMarkBedClean = async (bedId: string) => {
    await DataService.updateBedStatus(bedId, 'vacant');
    loadData();
  };

  return (
    <div className="flex h-screen overflow-hidden p-2 sm:p-3 md:p-5 gap-5 font-sans bg-[#F1F6FD] relative">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAdmission={() => {
          setPreSelectedBed(null);
          setIsAdmissionOpen(true);
        }}
        onOpenTransfer={() => {
          const firstAdmitted = admissions.find((a) => a.status === 'admitted');
          setTransferAdmission(firstAdmitted || null);
          setIsTransferOpen(true);
        }}
        onOpenDischarge={() => {
          const firstAdmitted = admissions.find((a) => a.status === 'admitted');
          setDischargeAdmission(firstAdmitted || null);
          setIsDischargeOpen(true);
        }}
        onOpenWardMaster={() => setIsWardMasterOpen(true)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        totalOccupied={occupiedCount}
        totalBeds={beds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenMobileMenu={() => setIsWardMasterOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Scrollable View with safe padding for Mobile Bottom Nav */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 pb-24 lg:pb-6">
          {/* Hero Welcome Banner with Doctor Cutout */}
          <HeroBanner
            availableBeds={availableCount}
            totalBeds={beds.length}
            onOpenAdmission={() => {
              setPreSelectedBed(null);
              setIsAdmissionOpen(true);
            }}
            onOpenTransfer={() => {
              const firstAdmitted = admissions.find((a) => a.status === 'admitted');
              setTransferAdmission(firstAdmitted || null);
              setIsTransferOpen(true);
            }}
            onOpenDischarge={() => {
              const firstAdmitted = admissions.find((a) => a.status === 'admitted');
              setDischargeAdmission(firstAdmitted || null);
              setIsDischargeOpen(true);
            }}
          />

          {/* KPI Stat Cards Row */}
          <StatCards
            occupiedCount={occupiedCount}
            availableCount={availableCount}
            cleaningCount={cleaningCount}
            totalWards={wards.length}
          />

          {/* Horizontal Snap Scroll Bed Telemetry Scroller (Exact Stitch Mobile Feature) */}
          <MobileLiveBedScroller
            beds={beds}
            wards={wards}
            admissions={admissions}
            onSelectBed={handleAdmitToBed}
            onViewMatrix={() => {
              const el = document.getElementById('ward-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Donut Chart & Roster Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <WardDonutChart wards={wards} beds={beds} />
            </div>
            <div className="lg:col-span-2">
              <PatientActivityList
                admissions={admissions}
                beds={beds}
                onShiftBed={handleShiftBed}
                onDischargeBed={handleDischargeBed}
              />
            </div>
          </div>

          {/* Interactive Live Bed Matrix */}
          <WardBedMatrix
            wards={wards}
            beds={filteredBeds}
            admissions={admissions}
            onAdmitToBed={handleAdmitToBed}
            onShiftBed={handleShiftBed}
            onDischargeBed={handleDischargeBed}
            onMarkBedClean={handleMarkBedClean}
          />

          {/* Footer Attribution */}
          <footer className="pt-6 pb-2 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-500">
              BedPulse™ — Smart Inpatient & Ward Care OS
            </p>
            <p className="mt-0.5">
              Developed by <strong className="text-slate-700">WebVission</strong> • Support Helpline:{' '}
              <a href="tel:+917000371321" className="text-brand-600 font-bold hover:underline">
                +91 7000371321
              </a>
            </p>
          </footer>
        </div>
      </main>

      {/* Floating Quick Action FAB (Mobile Only) */}
      <div className="fixed right-5 bottom-20 z-30 lg:hidden">
        <button
          onClick={() => {
            setPreSelectedBed(null);
            setIsAdmissionOpen(true);
          }}
          aria-label="Quick Admit"
          className="w-14 h-14 rounded-full bg-brand-500 text-white shadow-xl shadow-brand-500/35 flex items-center justify-center active:scale-90 transition-transform"
        >
          <UserPlus className="w-6 h-6" />
        </button>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (Stitch Mobile Shell) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAdmission={() => {
          setPreSelectedBed(null);
          setIsAdmissionOpen(true);
        }}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Admission (Step 1 & 2) */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        wards={wards}
        beds={beds}
        preSelectedBed={preSelectedBed}
        onAdmissionSuccess={loadData}
      />

      {/* 2. Bed Shift (Step 3) */}
      <ShiftBedModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        admission={transferAdmission}
        wards={wards}
        beds={beds}
        onShiftSuccess={loadData}
      />

      {/* 3. Discharge (Step 4) */}
      <DischargeModal
        isOpen={isDischargeOpen}
        onClose={() => setIsDischargeOpen(false)}
        admission={dischargeAdmission}
        beds={beds}
        onDischargeSuccess={loadData}
      />

      {/* 4. Dynamic Ward Master Studio */}
      <WardMasterModal
        isOpen={isWardMasterOpen}
        onClose={() => setIsWardMasterOpen(false)}
        wards={wards}
        beds={beds}
        onRefreshData={loadData}
      />

      {/* 5. Doctor Profile & Duty Settings (Stitch Mobile Profile) */}
      <DoctorProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenWardMaster={() => setIsWardMasterOpen(true)}
        onLogout={() => setIsSignInOpen(true)}
        totalOccupied={occupiedCount}
      />

      {/* 6. Inpatients Directory (Stitch Inpatients Directory) */}
      <InpatientsDirectory
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        wards={wards}
        beds={beds}
        admissions={admissions}
        onShiftBed={handleShiftBed}
        onDischargeBed={handleDischargeBed}
      />

      {/* 7. Staff Sign-In (Stitch Mobile Sign-In) */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onLoginSuccess={(role, name) => setCurrentStaff({ role, name })}
      />

      {/* 8. Staff Registration (Stitch Mobile Staff Registration) */}
      <StaffRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(name, role) => setCurrentStaff({ name, role })}
      />
    </div>
  );
}
