// app/admin/[adminSlug]/clients/page.tsx
import { notFound } from 'next/navigation';
import {
  UserGroupIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

// Import the Client Component and Type Definitions
import ClientsClientPage, { ClientProfile } from './ClientsClientPage'; 

const apiBaseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000/api';


// --- Interface for Server Component Props ---
interface ClientsPageProps {
  params:Promise<{ slug: string }>
}

// --- Client Summary Card Component (Server-side, purely presentational) ---
interface ClientSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const ClientSummaryCard: React.FC<ClientSummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-center justify-center text-center`}>
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

// --- Sample Data Generation (Server-side) ---
const generateSampleClients = (): ClientProfile[] => [
  {
    id: 'CLT001', name: 'James Otieno', email: 'james.o@example.com', phone: '+254711122333', inquiryCount: 5, dealStatus: 'Active', lastActivity: new Date('2024-09-20T10:00:00Z').toISOString(), notes: 'Looking for a 3-bedroom apartment near Westlands. Priority is security.', preferredVehicleTypes: ['Apartment', 'Townhouse'], budgetRange: '15M-25M KES', salesAgentId: 'AGT001', bio: 'High-value client with an immediate need.'
  },
  {
    id: 'CLT002', name: 'Fatuma Said', email: 'fatuma.s@example.com', phone: '+254722334455', inquiryCount: 1, dealStatus: 'Lead', lastActivity: new Date('2024-10-01T15:30:00Z').toISOString(), notes: 'Sent initial brochure on land investment opportunities in Kiambu.', preferredVehicleTypes: ['Land'], budgetRange: '5M-10M KES', salesAgentId: null, bio: 'New lead from a digital campaign.'
  },
  {
    id: 'CLT003', name: 'Chen Lee', email: 'chen.l@example.com', phone: '+254733445566', inquiryCount: 12, dealStatus: 'Closed', lastActivity: new Date('2024-08-15T11:00:00Z').toISOString(), notes: 'Successfully purchased 5-bedroom villa in Karen. Follow up in 6 months for investment properties.', preferredVehicleTypes: ['Villa'], budgetRange: '50M+ KES', salesAgentId: 'AGT002', bio: 'Completed high-end transaction.'
  },
  {
    id: 'CLT004', name: 'Samuel Mwangi', email: 'samuel.m@example.com', phone: '', inquiryCount: 3, dealStatus: 'Archived', lastActivity: new Date('2023-11-05T09:00:00Z').toISOString(), notes: 'Interest dropped off after budget constraints. Inquiries about rentals only.', preferredVehicleTypes: ['Apartment'], budgetRange: '1M-5M KES', salesAgentId: 'AGT001', bio: 'Low priority, cold lead.'
  },
];


// NOTE: This is an async Server Component.
export default async function ClientsPage({ params }: ClientsPageProps) {
  const { slug } = await params;
  const cookiesHeader = (await cookies()).toString();

  if (!slug) {
    notFound(); 
  }

  // --- 1. Server-Side Data Fetching ---
  let initialClients: ClientProfile[] = [];
  let isInitialLoadSuccessful = true; 
  
  try {
    // In a production app, you would fetch data here:
    const res = await fetch(`${apiBaseUrl}/admin/properties-clients?companyId=${slug}`, 
      { 
        cache: 'no-store', 
        headers: { Cookie: cookiesHeader } 
      });

    let initialRes = await res.json();
      console.log("Fetched initial client data:", initialRes);
    initialClients = initialRes.data;

    if (!initialClients || initialClients.length === 0) {
      initialClients = generateSampleClients();
    }
  } catch (e) {
    console.error("Server-side initial client data fetch failed:", e);
    isInitialLoadSuccessful = false;
  }

  // --- 2. Server-Side Summary Calculation ---
  const totalClients = initialClients.length;
  const activeClients = initialClients.filter(client => client.dealStatus === 'Active').length;
  const leads = initialClients.filter(client => client.dealStatus === 'Lead').length;
  const closedDeals = initialClients.filter(client => client.dealStatus === 'Closed').length;

  return (
    // Outer container and static elements are rendered once on the server
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">

      {/* Static Header (Server Rendered) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Vehicle Clients <span className="ml-2 text-orange-600 text-base sm:text-xl">🤝</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Keep track of all your client interactions and deal progress.
          </p>
        </div>
        {/* The Add Client button is placed inside the Client Component for interactivity */}
      </div>

      {/* Summary Cards (Server Rendered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ClientSummaryCard title="Total Clients" value={totalClients} icon={UserGroupIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <ClientSummaryCard title="Active Deals" value={activeClients} icon={CheckBadgeIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <ClientSummaryCard title="New Leads" value={leads} icon={ChatBubbleLeftRightIcon} colorClass="bg-gradient-to-br from-orange-500 to-orange-700" />
        <ClientSummaryCard title="Closed Deals" value={closedDeals} icon={CurrencyDollarIcon} colorClass="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>
      
      {/* 3. Render the Client Component with initial data */}
      <ClientsClientPage 
        adminSlug={slug}
        initialClients={initialClients} 
        isInitialLoadSuccessful={isInitialLoadSuccessful}
      />
    </div>
  );
}