// page.tsx (Server Component - default)

import React from 'react';
import { PrescriptionManager } from './PrescriptionManager'; // Import the Client Component
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";


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
async function getInitialPrescriptionData(companyId: string, cookieHeader: string): Promise<Prescription[]> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/prescriptions?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        next: { revalidate: 60 }, // always fresh
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch prescriptions: ${res.statusText}`);
    }
    const json = await res.json();
    // console.log("Fetched prescriptions:", json);
    return json.data || [];
  } catch (err) {
    // console.error("getInitialPrescriptionData error:", err);
    return [];
  }
}


/**
 * Fetch patients for a given company
 */
async function fetchPatients(companyId: string, cookieHeader: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/patients?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader }, // forward auth cookies if required
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch patients: ${res.statusText}`);
    }

    const json = await res.json();
    // console.log("Fetched patients:", json);
    return json.data || [];
  } catch (err) {
    // console.error("fetchPatients error:", err);
    return [];
  }
}

/**
 * Fetch doctors for a given company
 */
async function fetchDoctors(companyId: string, cookieHeader: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/doctors?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch doctors: ${res.statusText}`);
    }

    const json = await res.json();
    // console.log("Fetched doctors:", json);
    return json.data.data || [];
  } catch (err) {
    // console.error("fetchDoctors error:", err);
    return [];
  }
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

interface AdminPrescriptionsPageProps {
  params: Promise<{
    slug: string;
  }>;
}


export default async function AdminPrescriptionsPage({ params }: AdminPrescriptionsPageProps) {

  const cookieHeader = (await cookies()).toString(); // Get the cookie header from the request context

    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // 1. Fetch ALL necessary data concurrently on the server
  const [initialPrescriptions, patients, doctors] = await Promise.all([
    getInitialPrescriptionData(companyId, cookieHeader),
    fetchPatients(companyId, cookieHeader),
    fetchDoctors(companyId, cookieHeader)
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