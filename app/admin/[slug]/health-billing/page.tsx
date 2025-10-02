// page.tsx (Server Component - default)

import React from 'react';
import { BillingManagerClient } from './BillingManagerClient'; // Import the Client Component

// Define interfaces (move to a shared types.ts file in a real app)
export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELED';
  items: string[];
  notes?: string;
  createdAt: string;
}

export interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

// Mock companyId (from original file)
const COMPANY_ID = "654321098765432109876543";

// Server-side data fetching functions (runs once, before client hydration)
async function getInitialInvoiceData(companyId: string): Promise<Invoice[]> {
  // NOTE: Replace with your direct database query or internal service call.
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return [
    { id: 'inv001', patientId: 'p1', patientName: 'Alice Smith', amount: 150.00, date: '2025-09-01', dueDate: '2025-10-01', status: 'PENDING', items: ['Check-up', 'Medication'], createdAt: '2025-09-01' },
    { id: 'inv002', patientId: 'p2', patientName: 'Bob Johnson', amount: 320.50, date: '2025-08-20', dueDate: '2025-09-19', status: 'OVERDUE', items: ['Lab Test', 'Consultation'], createdAt: '2025-08-20' },
    { id: 'inv003', patientId: 'p3', patientName: 'Charlie Brown', amount: 75.00, date: '2025-09-10', dueDate: '2025-10-10', status: 'PAID', items: ['Vaccination'], createdAt: '2025-09-10' },
  ];
}

async function getPatientOptions(companyId: string): Promise<PatientOption[]> {
  // NOTE: Replace with your direct database query or internal service call.
  await new Promise(resolve => setTimeout(resolve, 100)); 
  return [
    { id: 'c1', name: 'Alice Smith', userId: 'p1' },
    { id: 'c2', name: 'Bob Johnson', userId: 'p2' },
    { id: 'c3', name: 'Charlie Brown', userId: 'p3' },
  ];
}


export default async function AdminBillingPage({ params }: { params: { slug: string } }) {
  const companyId = params.slug || COMPANY_ID;

  // 1. Fetch ALL necessary data concurrently on the server
  const [initialInvoices, initialPatients] = await Promise.all([
    getInitialInvoiceData(companyId),
    getPatientOptions(companyId)
  ]);

  return (
    // Static layout and visual elements are rendered on the server
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
          Billing & Invoices
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Manage all financial transactions and invoices.
        </p>

        {/* 2. Pass data to the Client Component for interactivity */}
        <BillingManagerClient
          initialInvoices={initialInvoices}
          initialPatients={initialPatients}
          companyId={companyId}
        />
      </div>
    </div>
  );
}