// page.tsx (Server Component)

import React from 'react';
import { StaffManagerClient } from './StaffManagerClient'; // Import the Client Component

import { cookies } from 'next/headers';

// Define the Staff interface (can be moved to a shared types.ts)
interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  jobTitle: string;
  department: string;
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  startDate?: string;
  createdAt: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Server-side data fetching function
// This function will only run on the server.
async function getInitialStaffData(companyId: string, searchTerm: string, statusParam: string): Promise<Staff[]> {
  // NOTE: In a real Next.js app, you'd fetch directly here without the API route
  const cookieHeaders = (await cookies())?.toString() || '';
  
  try {
    // IMPORTANT: When fetching from a Server Component, use the full absolute URL 
    const response = await fetch(
      `${apiBaseUrl}/admin/staff?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`,
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
          const dataRes = await response.json();
          const data: Staff[] = dataRes.data || [];
    
    // MOCK DATA: Replace with your actual database/API call
    const mockStaffData: Staff[] = [
      { id: '1', userId: 'u1', name: 'Alice Smith', email: 'alice@corp.com', jobTitle: 'Software Engineer', department: 'Technology', employmentStatus: 'ACTIVE', createdAt: '2023-01-15' },
      { id: '2', userId: 'u2', name: 'Bob Johnson', email: 'bob@corp.com', phone: '555-1234', jobTitle: 'Project Manager', department: 'Operations', employmentStatus: 'ON_LEAVE', createdAt: '2022-05-20' },
      { id: '3', userId: 'u3', name: 'Charlie Brown', email: 'charlie@corp.com', jobTitle: 'HR Specialist', department: 'Human Resources', employmentStatus: 'TERMINATED', createdAt: '2021-11-01' },
      { id: '4', userId: 'u4', name: 'Diana Prince', email: 'diana@corp.com', jobTitle: 'Software Engineer', department: 'Technology', employmentStatus: 'ACTIVE', createdAt: '2023-03-01' },
    ];
    
    return data || mockStaffData;

  } catch (error) {
    console.error("Server-side initial data fetch failed:", error);
    // Return an empty array on failure, or handle error display gracefully
    return [];
  }
}

interface Props {
  params: { slug: string };
}

export default async function AdminStaffPage({ params }: Props) {

  const { slug } = params;

  // 1. Fetch data on the server
  const initialStaff = await getInitialStaffData(slug, '', '');

  return (
    // Static layout and visual elements
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
          Staff Management
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Manage all non-critical staff within the organisation.
        </p>

        {/* 2. Pass data and companyId to the Client Component for interactivity */}
        <StaffManagerClient initialStaff={initialStaff} companyId={slug} />
      </div>
    </div>
  );
}

