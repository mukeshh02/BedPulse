import { Ward, Bed, Patient, Admission } from '@/types';

export const initialWards: Ward[] = [
  {
    id: 'w-icu',
    name: 'Intensive Care Unit',
    code: 'ICU',
    description: 'Critical care with ventilator and monitor support',
    floor: 'Ground Floor',
    color_accent: '#F43F5E',
  },
  {
    id: 'w-fgw',
    name: 'Female General Ward',
    code: 'FGW',
    description: 'Inpatient recovery for female patients',
    floor: '1st Floor',
    color_accent: '#EC4899',
  },
  {
    id: 'w-mgw',
    name: 'Male General Ward',
    code: 'MGW',
    description: 'Inpatient recovery for male patients',
    floor: '1st Floor',
    color_accent: '#3B82F6',
  },
  {
    id: 'w-pvt',
    name: 'Private Rooms',
    code: 'PVT',
    description: 'Single-occupancy private recovery rooms',
    floor: '2nd Floor',
    color_accent: '#8B5CF6',
  },
  {
    id: 'w-dlx',
    name: 'Deluxe Rooms',
    code: 'DLX',
    description: 'Luxury inpatient suites with attendant couch',
    floor: '2nd Floor',
    color_accent: '#F59E0B',
  },
  {
    id: 'w-pre',
    name: 'Pre-Operative Care',
    code: 'PRE',
    description: 'Pre-surgical preparation and observation beds',
    floor: 'Ground Floor OT Wing',
    color_accent: '#06B6D4',
  },
];

export const initialBeds: Bed[] = [
  // ICU (5 Beds - All Vacant)
  { id: 'b-icu-1', bed_number: 'ICU-01', ward_id: 'w-icu', room_type: 'ICU Ventilator', daily_rate: 4500, status: 'vacant' },
  { id: 'b-icu-2', bed_number: 'ICU-02', ward_id: 'w-icu', room_type: 'ICU Ventilator', daily_rate: 4500, status: 'vacant' },
  { id: 'b-icu-3', bed_number: 'ICU-03', ward_id: 'w-icu', room_type: 'ICU Monitor', daily_rate: 4000, status: 'vacant' },
  { id: 'b-icu-4', bed_number: 'ICU-04', ward_id: 'w-icu', room_type: 'ICU Monitor', daily_rate: 4000, status: 'vacant' },
  { id: 'b-icu-5', bed_number: 'ICU-05', ward_id: 'w-icu', room_type: 'ICU Stepdown', daily_rate: 3500, status: 'vacant' },

  // FGW (13 Beds - All Vacant)
  { id: 'b-fgw-1', bed_number: 'FGW-01', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-2', bed_number: 'FGW-02', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-3', bed_number: 'FGW-03', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-4', bed_number: 'FGW-04', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-5', bed_number: 'FGW-05', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-6', bed_number: 'FGW-06', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-7', bed_number: 'FGW-07', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-8', bed_number: 'FGW-08', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-9', bed_number: 'FGW-09', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-10', bed_number: 'FGW-10', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-11', bed_number: 'FGW-11', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-12', bed_number: 'FGW-12', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-fgw-13', bed_number: 'FGW-13', ward_id: 'w-fgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },

  // MGW (6 Beds - All Vacant)
  { id: 'b-mgw-1', bed_number: 'MGW-01', ward_id: 'w-mgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-mgw-2', bed_number: 'MGW-02', ward_id: 'w-mgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-mgw-3', bed_number: 'MGW-03', ward_id: 'w-mgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-mgw-4', bed_number: 'MGW-04', ward_id: 'w-mgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-mgw-5', bed_number: 'MGW-05', ward_id: 'w-mgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },
  { id: 'b-mgw-6', bed_number: 'MGW-06', ward_id: 'w-mgw', room_type: 'General Bed', daily_rate: 1200, status: 'vacant' },

  // Private (3 Rooms - All Vacant)
  { id: 'b-pvt-1', bed_number: 'PVT-01', ward_id: 'w-pvt', room_type: 'Private Single Room', daily_rate: 2800, status: 'vacant' },
  { id: 'b-pvt-2', bed_number: 'PVT-02', ward_id: 'w-pvt', room_type: 'Private Single Room', daily_rate: 2800, status: 'vacant' },
  { id: 'b-pvt-3', bed_number: 'PVT-03', ward_id: 'w-pvt', room_type: 'Private Single Room', daily_rate: 2800, status: 'vacant' },

  // Deluxe (4 Rooms - All Vacant)
  { id: 'b-dlx-1', bed_number: 'DLX-01', ward_id: 'w-dlx', room_type: 'Deluxe Suite', daily_rate: 4500, status: 'vacant' },
  { id: 'b-dlx-2', bed_number: 'DLX-02', ward_id: 'w-dlx', room_type: 'Deluxe Suite', daily_rate: 4500, status: 'vacant' },
  { id: 'b-dlx-3', bed_number: 'DLX-03', ward_id: 'w-dlx', room_type: 'Deluxe Suite', daily_rate: 4500, status: 'vacant' },
  { id: 'b-dlx-4', bed_number: 'DLX-04', ward_id: 'w-dlx', room_type: 'Deluxe Suite', daily_rate: 4500, status: 'vacant' },

  // Pre-Op (2 Beds - All Vacant)
  { id: 'b-pre-1', bed_number: 'PRE-01', ward_id: 'w-pre', room_type: 'Pre-Op Holding Bed', daily_rate: 1500, status: 'vacant' },
  { id: 'b-pre-2', bed_number: 'PRE-02', ward_id: 'w-pre', room_type: 'Pre-Op Holding Bed', daily_rate: 1500, status: 'vacant' },
];

export const initialPatients: Patient[] = [];

export const initialAdmissions: Admission[] = [];
