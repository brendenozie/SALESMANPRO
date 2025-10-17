// page.tsx (Server Component - default)

import React from 'react';
import { BillingManagerClient } from './BillingManagerClient'; // Import the Client Component

import { cookies } from 'next/headers';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// Define interfaces (move to a shared types.ts file in a real app)
export interface Invoice {
  amountDue: number;
  currency: string;
  downloadUrl: string;
  notes?: string;
  dueDate: string;
  id: string;
  issuedDate: string;
  lineItems: any;//{ create: Array<{ description: string; amount: number; quantity: number }> };
  periodEnd: string;
  periodStart: string;
  status: "PAID" | "UNPAID" | "OVERDUE" | "PENDING" | "CANCELED";
  userEmail: string;
  userId: string;
  userName: string;
  // id: string;
  // patientId: string;
  // patientName: string;
  // amount: number;
  // date: string;
  // dueDate?: string;
  // status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELED';
  // items: string[];
  // notes?: string;
  // createdAt: string;
}

export interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

// Mock companyId (from original file)
// const COMPANY_ID = "654321098765432109876543";

// Server-side data fetching functions (runs once, before client hydration)
async function getInitialInvoiceData(companyId: string, cookieHeader: string): Promise<Invoice[]> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/billing/invoices?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        next: { revalidate: 60 }, // always fresh
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch invoices: ${res.statusText}`);
    }
    const json = await res.json();
    console.log("Fetched invoices:", json);
    console.log("Invoices data:", json.data.invoicesData);
    return json.data.invoicesData || [];
  } catch (error) {
    console.error("Error fetching initial invoice data:", error);
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
    console.log("Fetched patients:", json);
    return json.data || [];
  } catch (err) {
    console.error("fetchPatients error:", err);
    return [];
  }
}

interface AdminBillingPageProps {
  params: Promise<{
    slug: string; // companyId
  }>;
}

export default async function AdminBillingPage({ params }: AdminBillingPageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString(); // Get the cookie header from the request context

  // 1. Fetch ALL necessary data concurrently on the server
  const [initialInvoices, initialPatients] = await Promise.all([
    getInitialInvoiceData(companyId, cookieHeader),
    fetchPatients(companyId, cookieHeader)
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