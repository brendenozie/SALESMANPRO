// page.tsx (Server Component - default is Server)

import React from 'react';
import { ServiceManagerClient } from './ServiceManagerClient'; // Import the Client Component

import { cookies } from 'next/headers';
// Define the Service interface (move to a shared types.ts file for real app)
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
}

// Mock companyId for demonstration (from params)

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000/api';

// Server-side data fetching function
async function getInitialServiceData(companyId: string): Promise<Service[]> {
  const cookieHeaders = (await cookies())?.toString() || '';
  
  const response = await fetch(
      `${apiBaseUrl}/admin/health-services?companyId=${companyId}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', Cookie: cookieHeaders }, // forward auth cookies if required
              next: { revalidate: 60 }, // cache for 60 seconds
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch staff members');
          }

    let dataRes = await response.json();
    
    const data: Service[] = dataRes?.data || [];
  
  // MOCK DATA: Replace with your actual database/internal service call
  const mockServices: Service[] = [
    { id: 'svc001', name: 'General Check-up', description: 'Routine health assessment and consultation.', price: 75.00, duration: '30 min', status: 'ACTIVE', createdAt: '2023-01-10' },
    { id: 'svc002', name: 'Pediatric Vaccination', description: 'Immunization services for children.', price: 50.00, duration: '15 min', status: 'ACTIVE', createdAt: '2023-03-22' },
    { id: 'svc003', name: 'Dermatology Consultation', description: 'Assessment and treatment for skin conditions.', price: 120.00, duration: '45 min', status: 'INACTIVE', createdAt: '2022-11-01' },
    { id: 'svc004', name: 'Physiotherapy Session', description: 'Rehabilitation and physical therapy.', price: 90.00, duration: '1 hour', status: 'ACTIVE', createdAt: '2023-05-15' },
    { id: 'svc005', name: 'Dental Cleaning', description: 'Professional teeth cleaning and oral hygiene.', price: 80.00, duration: '45 min', status: 'ARCHIVED', createdAt: '2022-08-01' },
  ];
  
  // In a real app, you would handle errors and return a fetch result.
  return data || mockServices;
}

export default async function AdminServicesPage({ params }: { params: { slug: string } }) {
  const companyId = params.slug;
  
  // 1. Fetch data on the server
  const initialServices = await getInitialServiceData(companyId);

  return (
    // Static layout and visual elements are server-rendered for fast initial paint
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Headings remain static on the server for faster load */}
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
          Service Management
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Manage the medical services offered by your clinic.
        </p>

        {/* 2. Pass data to the Client Component for interactivity */}
        <ServiceManagerClient initialServices={initialServices} companyId={companyId} />
      </div>
    </div>
  );
}