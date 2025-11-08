// app/admin/[slug]/inquiries/page.tsx
// NO 'use client'
import { notFound } from 'next/navigation';
import { ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

// Import the Client Component and Type Definitions
import InquiriesClientPage, { Inquiry } from './InquiriesClientPage'; 

// --- Interface for Server Component Props ---
interface InquiriesPageProps {
  params:Promise<{ slug: string }>
}

// --- Sample Data Generation (Server-side execution) ---
const generateSampleInquiries = (): Inquiry[] => [
  {
    id: 'INQ001', clientName: 'Alice Wonderland', clientEmail: 'alice@example.com', clientPhone: '+254711223344',
    message: 'I am interested in the Modern Apartment in Kilimani. Can I schedule a viewing next week?', propertyId: 'PROP001',
    propertyName: 'Modern Apartment in Kilimani', status: 'New', receivedAt: new Date('2024-07-14T10:00:00Z').toISOString(),
    assignedToAgentId: 'AGT001', assignedToAgentName: 'John Doe',
  },
  {
    id: 'INQ002', clientName: 'Bob The Builder', clientEmail: 'bob@example.com', message: 'Looking for a commercial space around CBD. What options do you have under 100M KES?',
    status: 'Read', receivedAt: new Date('2024-07-13T15:00:00Z').toISOString(),
  },
  {
    id: 'INQ003', clientName: 'Eve Johnson', clientEmail: 'eve.j@example.com', clientPhone: '+254722334455',
    message: 'Could you provide more details about the Spacious Family House in Karen? Any recent price changes?', propertyId: 'PROP002',
    propertyName: 'Spacious Family House, Karen', status: 'Responded', receivedAt: new Date('2024-07-12T09:00:00Z').toISOString(),
    assignedToAgentId: 'AGT002', assignedToAgentName: 'Jane Smith',
  },
  {
    id: 'INQ004', clientName: 'Frank Green', clientEmail: 'frank.g@example.com', message: 'I am looking for land in Ruiru. Do you have anything available for agricultural use?',
    status: 'Archived', receivedAt: new Date('2024-07-01T11:00:00Z').toISOString(),
  },
  {
    id: 'INQ005', clientName: 'Grace Hopper', clientEmail: 'grace@example.com',
    message: 'Interested in the new development near Waiyaki Way. When are viewings available?', propertyId: 'PROP003',
    propertyName: 'Waiyaki Way New Development', status: 'New', receivedAt: new Date('2024-07-15T08:30:00Z').toISOString(),
  },
  {
    id: 'INQ006', clientName: 'Charlie Chaplin', clientEmail: 'charlie@example.com',
    message: 'I want to inquire about renting a 2-bedroom apartment in Westlands.', status: 'Read',
    receivedAt: new Date('2024-07-14T18:00:00Z').toISOString(),
  },
];


// NOTE: This is an async Server Component.
export default async function InquiriesPage({ params }: InquiriesPageProps) {
  const { slug } = await params;
  const cookiesHeader = (await cookies()).toString(); // Capture cookies for potential API calls

  if (!slug) {
    notFound(); 
  }
  
  // --- 1. Server-Side Data Fetching (Replace with actual API/DB call) ---
  let initialInquiries: Inquiry[] = [];
  let isInitialLoadSuccessful = true;
  let serverLoadError: string | null = null;
  
  try {
    // Simulate API call using sample data
    // In a real app: 
    const res = await fetch(`${apiBaserUrl}/admin/inquiries?companyId=${slug}`, { cache: 'no-store', headers: { cookie: cookiesHeader } });
    let data = await res.json();
    console.log("Fetched inquiries data from API:", data);
    if (res.ok) {
      initialInquiries = data.inquiries.sort((a: Inquiry, b: Inquiry) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    }
    
    // Fallback to sample data if API fails
    if (!res.ok || !data.inquiries) {
      console.warn("API fetch failed or returned no data, using sample inquiries.");
      isInitialLoadSuccessful = false;
      serverLoadError = data.error || "Failed to fetch inquiries from API.";
    }
    
    // For demonstration, we use sample data if API fails
    if (!initialInquiries.length) {
      const data = generateSampleInquiries();
      initialInquiries = data.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    }

  } catch (e: any) {
    console.error("Server-side initial inquiry data fetch failed:", e);
    isInitialLoadSuccessful = false;
    serverLoadError = e.message || "Failed to load initial inquiries data.";
  }

  return (
    // Outer container and static elements are rendered once on the server
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen font-sans text-gray-800">

      {/* Static Header Section (Server Rendered) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-purple-600 mr-4 drop-shadow-md" />
            Client Inquiries
            <span className="ml-4 text-teal-600 text-xl sm:text-2xl transform rotate-6 animate-pulse-slight">📧</span>
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl">
            Effectively manage and respond to all incoming client questions and leads from a centralized dashboard.
          </p>
        </div>
      </div>
      
      {/* 2. Render the Client Component with initial data and status */}
      <InquiriesClientPage 
        slug={slug}
        initialInquiries={initialInquiries} 
        isInitialLoadSuccessful={isInitialLoadSuccessful}
        serverLoadError={serverLoadError}
      />
    </div>
  );
}