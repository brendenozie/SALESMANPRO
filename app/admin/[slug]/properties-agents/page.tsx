// app/admin/[adminSlug]/agents/page.tsx
import { notFound } from 'next/navigation';
import {
  UsersIcon,
  HomeModernIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

// Import the client component
import AgentsClientPage from './AgentsClientPage'; 
import { AgentProfile } from './AgentsClientPage'; // Import the main type from the client module

const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api'; // Replace with your actual API base URL
// --- Interface for Server Component Props ---
interface AgentsPageProps {
  params: {
    slug: string; 
  };
}

// --- Agent Summary Card Component (Server-side, purely presentational) ---
interface AgentSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const AgentSummaryCard: React.FC<AgentSummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-center justify-center text-center`}>
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

// --- Sample Data Generation (Server-side) ---
// This is now executed on the server to get initial data
const generateSampleAgents = (): AgentProfile[] => [
  {
    id: 'AGT001', name: 'Aisha Hassan', email: 'aisha.hassan@example.com', phone: '+254712345678', bio: 'A passionate specialist dedicated to finding clients their perfect need in Nairobi.', profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a3dd78721d6?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isActive: true, specialties: ['Residential', 'Luxury Homes'], regions: ['Kilimani', 'Karen'], totalListings: 22, closedDeals: 14, joinedAt: new Date('2022-01-01T09:00:00Z').toISOString(),
  },
  {
    id: 'AGT002', name: 'David Kimani', email: 'david.kimani@example.com', phone: '+254723456789', bio: 'Commercial guru with an in-depth understanding of investment opportunities.', profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isActive: true, specialties: ['Commercial', 'Investments'], regions: ['CBD', 'Westlands'], totalListings: 18, closedDeals: 12, joinedAt: new Date('2021-06-15T10:30:00Z').toISOString(),
  },
  {
    id: 'AGT003', name: 'Grace Wanjiku', email: 'grace.wanjiku@example.com', phone: '+254734567890', bio: 'Specializing in land acquisition and development.', profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isActive: true, specialties: ['Land', 'Development'], regions: ['Ruiru', 'Kiambu'], totalListings: 10, closedDeals: 7, joinedAt: new Date('2023-03-20T11:00:00Z').toISOString(),
  },
  {
    id: 'AGT004', name: 'Peter Mugo', email: 'peter.mugo@example.com', phone: '+254701234567', bio: 'Inactive agent who previously focused on rentals.', profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isActive: false, specialties: ['Rentals'], regions: ['Ruaraka'], totalListings: 5, closedDeals: 2, joinedAt: new Date('2023-09-01T14:00:00Z').toISOString(),
  },
];


// NOTE: This component is an async Server Component by default in the App Router.
export default async function AgentsPage({ params }: AgentsPageProps) {
  const { slug } = params;
  const cookiesHeader = (await cookies()).toString(); // Get cookies for auth if needed

  if (!slug) {
    notFound(); 
  }
  
  let initialAgents: AgentProfile[] = [];
  let isInitialLoadSuccessful = true; // Assume success or handle error
  
  try {

    const res = await fetch(`${apiBaseUrl}/admin/sales-agents?companyId=${slug}`, 
      { cache: 'no-store', headers: { cookie: cookiesHeader } });
    if (!res.ok) throw new Error('Failed to fetch agents');
    let intialRes = await res.json();
    console.log("Fetched initial agents:", intialRes);
    initialAgents = intialRes.data as AgentProfile[];
    // If the fetch fails, we fall back to sample data for demonstration purposes
    if (initialAgents.length === 0) {
      initialAgents = generateSampleAgents().sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    }
  } catch (e) {
    console.error("Server-side initial data fetch failed:", e);
    isInitialLoadSuccessful = false;
    // Fallback or error handling can go here. For now, we proceed with an empty list.
  }

  // --- 2. Server-Side Summary Calculation ---
  const totalAgents = initialAgents.length;
  const activeAgents = initialAgents.filter(agent => agent.isActive).length;
  const totalListingsOverall = initialAgents.reduce((sum, agent) => sum + agent.totalListings, 0);
  const totalClosedDealsOverall = initialAgents.reduce((sum, agent) => sum + agent.closedDeals, 0);

  // Package summary stats to pass to the client for display logic if needed (e.g., in a filter box)
  const summaryStats = {
    totalAgents,
    activeAgents,
    totalListingsOverall,
    totalClosedDealsOverall,
  };
  
  return (
    // Outer container and static elements are rendered once on the server
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">

      {/* Static Header (Server Rendered) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Agents <span className="ml-2 text-purple-600 text-base sm:text-xl">🏠🔑</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Oversee your team of professionals, track performance, and manage profiles.
          </p>
        </div>
        {/* The 'Add New Agent' button cannot be here because it opens a client-side modal. 
            We must put it inside the Client Component or wrap it with a client component.
            For simplicity, we pass the Add logic to the client component's responsibilities. */}
      </div>

      {/* Summary Cards (Server Rendered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AgentSummaryCard title="Total Agents" value={totalAgents} icon={UsersIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <AgentSummaryCard title="Active Agents" value={activeAgents} icon={CheckCircleIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <AgentSummaryCard title="Total Listings" value={totalListingsOverall} icon={HomeModernIcon} colorClass="bg-gradient-to-br from-purple-500 to-purple-700" />
        <AgentSummaryCard title="Closed Deals" value={totalClosedDealsOverall} icon={CurrencyDollarIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" />
      </div>
      
      {/* 3. Render the Client Component */}
      {/* All interactivity, state, and CRUD operations are delegated here. */}
      <AgentsClientPage 
        adminSlug={slug}
        initialAgents={initialAgents} 
        isInitialLoadSuccessful={isInitialLoadSuccessful}
      />
    </div>
  );
}