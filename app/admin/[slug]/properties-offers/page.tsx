// app/admin/[slug]/offers/page.tsx
// NO 'use client' directive

import { notFound } from 'next/navigation';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

// Import Types and the Client Component
import OffersClientPage, { OfferContract, SelectOption } from './OffersClientPage';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Interface for Server Component Props ---
interface OffersPageProps {
    params: {
        slug: string; // The admin/company ID
    };
}

// --- Sample Data Generation (MOCKUPS FOR FALLBACK) ---

const generateSampleOffers = (): OfferContract[] => [
    {
        id: 'ofr_001',
        propertyId: 'PROP001',
        propertyName: 'Modern Apartment in Kilimani',
        clientId: 'CLNT001',
        clientName: 'Alice Wonderland',
        agentId: 'AGT001',
        agentName: 'John Doe',
        offerAmount: 15500000,
        status: 'Pending',
        offerDate: new Date('2025-09-01T10:00:00Z').toISOString(),
        notes: 'Offer slightly below asking, client can close quickly.',
        createdAt: new Date('2025-09-01T09:00:00Z').toISOString(),
        updatedAt: new Date('2025-09-01T09:00:00Z').toISOString(),
    },
    {
        id: 'ofr_002',
        propertyId: 'PROP002',
        propertyName: 'Spacious Family House, Karen',
        clientId: 'CLNT003',
        clientName: 'Grace Wanjiru',
        agentId: 'AGT002',
        agentName: 'Jane Smith',
        offerAmount: 32000000,
        status: 'Accepted',
        offerDate: new Date('2025-08-25T14:00:00Z').toISOString(),
        closureDate: new Date('2025-08-28T09:00:00Z').toISOString(),
        contractUrl: 'https://example.com/contract-002',
        notes: 'Full asking price offer, pending final contract signing.',
        createdAt: new Date('2025-08-24T09:00:00Z').toISOString(),
        updatedAt: new Date('2025-08-28T09:00:00Z').toISOString(),
    },
    {
        id: 'ofr_003',
        propertyId: 'PROP003',
        propertyName: 'Commercial Office Space, CBD',
        clientId: 'CLNT002',
        clientName: 'Bob The Builder',
        agentId: 'AGT001',
        agentName: 'John Doe',
        offerAmount: 45000000,
        status: 'Rejected',
        offerDate: new Date('2025-08-15T10:30:00Z').toISOString(),
        notes: 'Lowball offer, counter-offer sent.',
        createdAt: new Date('2025-08-14T16:00:00Z').toISOString(),
        updatedAt: new Date('2025-08-15T11:00:00Z').toISOString(),
    },
];

const generateSampleProperties = (): SelectOption[] => [
    { id: 'PROP001', name: 'Modern Apartment in Kilimani' },
    { id: 'PROP002', name: 'Spacious Family House, Karen' },
    { id: 'PROP003', name: 'Commercial Office Space, CBD' },
    { id: 'PROP004', name: 'Studio Apartment, Westlands' },
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
        const data = dataRes?.results || dataRes?.data; // Use 'results' for offers, 'data' for lists

        if (!data || data.length === 0) {
            console.warn(`No data received for ${endpoint}. Using fallback sample data.`);
            return { data: fallbackData(), error: null };
        }

        if (endpoint.includes('offers')) {
             return { data: data as T, error: null };
        } else if (Array.isArray(data)) {
            // Map the results to the SelectOption structure (id, name)
            const mappedData: SelectOption[] = data.map((item: any) => ({
                id: item.id || item._id, 
                name: item.name || item.title || item.clientName || item.agentName || 'Unknown Name',
            })).filter(item => item.id) as SelectOption[];
            return { data: mappedData as T, error: null };
        }

        return { data: data as T, error: null };

    } catch (e: any) {
        console.error(`Server-side fetch failed for ${endpoint}:`, e);
        // Use fallback data on API failure
        return { data: fallbackData(), error: e.message || `Failed to load ${endpoint}.` };
    }
};


export default async function OffersPage({ params }: OffersPageProps) {
    const { slug } = params;
    const cookiesHeaders = (await cookies()).toString();

    if (!slug) {
        notFound();
    }

    // --- 1. Fetch Offers, Properties, Clients, and Agents in parallel ---
    const [
        offersResult,
        propertiesResult,
        clientsResult,
        agentsResult,
    ] = await Promise.all([
        fetchData<OfferContract[]>('admin/offers', slug, cookiesHeaders, generateSampleOffers),
        fetchData<SelectOption[]>('admin/my-market-place', slug, cookiesHeaders, generateSampleProperties),
        fetchData<SelectOption[]>('admin/clients', slug, cookiesHeaders, generateSampleClients),
        fetchData<SelectOption[]>('admin/sales-agents', slug, cookiesHeaders, generateSampleAgents),
    ]);

    // Consolidate data and error handling
    let initialOffers: OfferContract[] = offersResult.data || generateSampleOffers();
    if (initialOffers.length > 0) {
         initialOffers = initialOffers.sort((a, b) => new Date(b.offerDate).getTime() - new Date(a.offerDate).getTime());
    }

    const allProperties: SelectOption[] = propertiesResult.data || generateSampleProperties();
    const allClients: SelectOption[] = clientsResult.data || generateSampleClients();
    const allAgents: SelectOption[] = agentsResult.data || generateSampleAgents();

    const isInitialLoadSuccessful = !offersResult.error && !propertiesResult.error && !clientsResult.error && !agentsResult.error;
    const serverLoadError: string | null = offersResult.error || propertiesResult.error || clientsResult.error || agentsResult.error;


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans text-gray-800">
            {/* Static Header Section (Server Rendered) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="flex flex-col">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
                        <DocumentTextIcon className="h-10 w-10 text-green-600 mr-4 drop-shadow-md" />
                        Offers & Contracts
                        <span className="ml-4 text-purple-600 text-xl sm:text-2xl transform rotate-6 animate-bounce-slight">📄</span>
                    </h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl">
                        Track and manage all property offers and sales contracts.
                    </p>
                </div>
            </div>

            {/* 2. Render the Client Component with initial data */}
            <OffersClientPage
                adminSlug={slug}
                initialOffers={initialOffers}
                isInitialLoadSuccessful={isInitialLoadSuccessful}
                serverLoadError={serverLoadError}
                allProperties={allProperties}
                allClients={allClients}
                allAgents={allAgents}
            />
        </div>
    );
}