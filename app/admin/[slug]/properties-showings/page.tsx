// app/admin/[slug]/showings/page.tsx
// NO 'use client' directive

import { notFound } from 'next/navigation';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

// Import the Type Definition from the new Client Component
import ShowingsClientPage, { Showing, SelectOption } from './ShowingsClientPage';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Interface for Server Component Props ---
interface ShowingsPageProps {
  params:Promise<{ slug: string }>
}

// --- Sample Data Generation (MOCKUPS FOR FALLBACK) ---

const generateSampleShowings = (): Showing[] => [
    {
        id: 'shw_001',
        propertyId: 'PROP001',
        propertyName: 'Modern Apartment in Kilimani',
        clientId: 'CLNT001',
        clientName: 'Alice Wonderland',
        agentId: 'AGT001',
        agentName: 'John Doe',
        dateTime: new Date('2025-08-01T11:00:00Z').toISOString(),
        status: 'Scheduled',
        notes: 'Client is very keen on a quick purchase.',
        createdAt: new Date('2025-07-28T10:00:00Z').toISOString(),
        updatedAt: new Date('2025-07-28T10:00:00Z').toISOString(),
    },
    {
        id: 'shw_002',
        propertyId: 'PROP002',
        propertyName: 'Spacious Family House, Karen',
        clientId: 'CLNT003',
        clientName: 'Grace Wanjiru',
        agentId: 'AGT002',
        agentName: 'Jane Smith',
        dateTime: new Date('2025-07-29T14:00:00Z').toISOString(),
        status: 'Completed',
        notes: 'Client liked it but budget might be an issue. Follow up with financing options.',
        createdAt: new Date('2025-07-25T09:00:00Z').toISOString(),
        updatedAt: new Date('2025-07-29T14:05:00Z').toISOString(),
    },
];

const generateSampleProperties = (): SelectOption[] => [
    { id: 'PROP001', name: 'Modern Apartment in Kilimani' },
    { id: 'PROP002', name: 'Spacious Family House, Karen' },
    { id: 'PROP003', name: 'Commercial Office Space, CBD' },
];
const generateSampleClients = (): SelectOption[] => [
    { id: 'CLNT001', name: 'Alice Wonderland' },
    { id: 'CLNT002', name: 'Bob The Builder' },
    { id: 'CLNT003', name: 'Grace Wanjiru' },
];
const generateSampleAgents = (): SelectOption[] => [
    { id: 'AGT001', name: 'John Doe' },
    { id: 'AGT002', name: 'Jane Smith' },
    { id: 'AGT003', name: 'Michael Otiende' },
];

// --- Generalized Data Fetching Utility ---
// This function handles fetching from different endpoints and mapping the data.
const fetchData = async <T,>(
    endpoint: string,
    slug: string,
    cookiesHeaders: string,
    fallbackData: () => T
): Promise<{ data: T | null; error: string | null }> => {
    const url = `${apiUrl}/${endpoint}?companyId=${slug}`;
    try {
        const res = await fetch(url, { cache: 'no-store', headers: { cookie: cookiesHeaders } });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${endpoint} (Status: ${res.status})`);
        }

        const dataRes = await res.json();
        const data = dataRes?.data;

        // Use fallback data if API returns empty or null (but status 200)
        if (!data || data.length === 0) {
            console.warn(`No data received for ${endpoint}. Using fallback sample data.`);
            return { data: fallbackData(), error: null };
        }

        // Map the results to the SelectOption structure (id, name)
        if (endpoint.includes('showings')) {
             // Showings have a different structure, return as is (T=Showing[])
             return { data: data as T, error: null };
        } else if (Array.isArray(data)) {
            // Assume lists (properties, clients, agents) return items with identifiable id/name fields
            const mappedData: SelectOption[] = data.map((item: any) => ({
                id: item.id || item._id, 
                name: item.name || item.title || item.clientName || item.agentName || 'Unknown Name',
            })).filter(item => item.id) as SelectOption[];
            return { data: mappedData as T, error: null };
        }


        return { data: data as T, error: null };

    } catch (e: any) {
        console.error(`Server-side fetch failed for ${endpoint}:`, e);
        // Use fallback data on failure
        return { data: fallbackData(), error: e.message || `Failed to load ${endpoint}.` };
    }
};


export default async function ShowingsPage({ params }: ShowingsPageProps) {
    const { slug } = await params;
    const cookiesHeaders = (await cookies()).toString();

    if (!slug) {
        notFound();
    }

    // --- 1. Fetch Showings, Properties, Clients, and Agents in parallel ---
    const [
        showingsResult,
        propertiesResult,
        clientsResult,
        agentsResult,
    ] = await Promise.all([
        fetchData<Showing[]>('admin/showings', slug, cookiesHeaders, generateSampleShowings),
        fetchData<SelectOption[]>('admin/my-market-place', slug, cookiesHeaders, generateSampleProperties),
        fetchData<SelectOption[]>('admin/properties-clients', slug, cookiesHeaders, generateSampleClients),
        fetchData<SelectOption[]>('admin/sales-agents', slug, cookiesHeaders, generateSampleAgents),
    ]);

    // Consolidate data and error handling
    let initialShowings: Showing[] = showingsResult.data || generateSampleShowings();
    if (initialShowings.length > 0) {
         // Sort only if data is present
         initialShowings = initialShowings.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    }

    const allProperties: SelectOption[] = propertiesResult.data || generateSampleProperties();
    const allClients: SelectOption[] = clientsResult.data || generateSampleClients();
    const allAgents: SelectOption[] = agentsResult.data || generateSampleAgents();

    const initialLoadSuccessful = !showingsResult.error && !propertiesResult.error && !clientsResult.error && !agentsResult.error;
    const serverLoadError: string | null = showingsResult.error || propertiesResult.error || clientsResult.error || agentsResult.error;


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-indigo-50 to-green-100 min-h-screen font-sans text-gray-800">

            {/* Static Header Section (Server Rendered) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="flex flex-col">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
                        <CalendarDaysIcon className="h-10 w-10 text-green-600 mr-4 drop-shadow-md" />
                        Property Showings
                        <span className="ml-4 text-purple-600 text-xl sm:text-2xl transform rotate-6 animate-bounce-slight">🏠</span>
                    </h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl">
                        Efficiently manage and track all property viewings and appointments.
                    </p>
                </div>
            </div>

            {/* 2. Render the Client Component with initial data */}
            <ShowingsClientPage
                adminSlug={slug}
                initialShowings={initialShowings}
                isInitialLoadSuccessful={initialLoadSuccessful}
                serverLoadError={serverLoadError}
                allProperties={allProperties}
                allClients={allClients}
                allAgents={allAgents}
            />
        </div>
    );
}