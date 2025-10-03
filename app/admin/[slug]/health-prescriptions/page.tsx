// page.tsx (Server Component - default)

import React from 'react';
import { PrescriptionManager } from './PrescriptionManager'; // Import the Client Component


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// Define interfaces (should be moved to a types.ts file in a real app)
interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  instructions?: string;
  issuedDate: string; // Format: YYYY-MM-DD
  expiryDate?: string; // Format: YYYY-MM-DD
  status: 'PENDING' | 'DISPENSED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

interface DoctorOption {
  id: string; // Doctor ID
  name: string;
  userId: string; // Corresponding User ID
}

// Mock companyId (from original file)
const COMPANY_ID = "654321098765432109876543";


// Server-side data fetching functions
async function getInitialPrescriptionData(companyId: string): Promise<Prescription[]> {
  // Simulate a database query or internal service call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // MOCK DATA: Replace with your actual database query
  return [
    { id: 'rx001', patientId: 'p1', patientName: 'Alice Johnson', doctorId: 'd1', doctorName: 'Dr. Smith', medication: 'Amoxicillin', dosage: '250mg', issuedDate: '2025-09-01', status: 'PENDING', createdAt: '2025-09-01' },
    { id: 'rx002', patientId: 'p2', patientName: 'Bob Williams', doctorId: 'd2', doctorName: 'Dr. Lee', medication: 'Lisinopril', dosage: '10mg', issuedDate: '2025-08-15', expiryDate: '2025-10-15', status: 'DISPENSED', createdAt: '2025-08-10' },
    { id: 'rx003', patientId: 'p3', patientName: 'Charlie Brown', doctorId: 'd1', doctorName: 'Dr. Smith', medication: 'Ibuprofen', dosage: '400mg', issuedDate: '2025-01-01', expiryDate: '2025-09-30', status: 'EXPIRED', createdAt: '2025-01-01' },
  ];
}

async function getPatientOptions(companyId: string): Promise<PatientOption[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: 'c1', name: 'Alice Johnson', userId: 'p1' },
    { id: 'c2', name: 'Bob Williams', userId: 'p2' },
    { id: 'c3', name: 'Charlie Brown', userId: 'p3' },
  ];
}

async function getDoctorOptions(companyId: string): Promise<DoctorOption[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: 'd1', name: 'Dr. Smith', userId: 'u11' },
    { id: 'd2', name: 'Dr. Lee', userId: 'u22' },
  ];
}

//  const fetchPrescriptions = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
//       const response = await fetch(`${apiBaseUrl}/admin/prescriptions?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch prescriptions');
//       }
//       const data: Prescription[] = await response.json();
//       setPrescriptions(data);
//     } catch (e: any) {
//       console.error("Error fetching prescriptions:", e);
//       setError(e.message || "Failed to load prescription data.");
//     } finally {
//       setLoading(false);
//     }
//   }, [companyId, searchTerm, filterStatus]);


export default async function AdminPrescriptionsPage({ params }: { params: { slug: string } }) {
  const companyId = params.slug || COMPANY_ID;

  // 1. Fetch ALL necessary data concurrently on the server
  const [initialPrescriptions, patients, doctors] = await Promise.all([
    getInitialPrescriptionData(companyId),
    getPatientOptions(companyId),
    getDoctorOptions(companyId)
  ]);

  return (
    // Static layout and visual elements are server-rendered
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
          Prescription Management
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Manage and track patient prescriptions.
        </p>

        {/* 2. Pass data to the Client Component for interactivity and state */}
        <PrescriptionManager 
          initialPrescriptions={initialPrescriptions}
          initialPatients={patients}
          initialDoctors={doctors}
          companyId={companyId}
        />
      </div>
    </div>
  );
}