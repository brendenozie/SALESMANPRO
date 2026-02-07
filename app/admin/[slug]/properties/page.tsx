// app/admin/[slug]/properties/page.tsx
// NO 'use client' directive

import { notFound } from 'next/navigation';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import PropertyClientPage from './PropertyClientPage'; 

import { ILocation, IStoreCategory, MarketListingForm } from '@/types/typings';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

// --- Sample Data Generation (MOCKUPS FOR FALLBACK) ---
const generateMockProperties = (): MarketListingForm[] => [
    {
      id: 'PROP001',
      name: 'Luxury 4-Bedroom Villa',
      category: 'property',
      type: 'For Sale',
      status: 'Available',
      finalPrice: 55000000,
      locationName: 'Karen, Nairobi',
      contactName: 'Jane Smith',
      images: ['/images/property/villa-1.jpg'],
      bathrooms: 4.5,
      area: "4500",
      createdAt: new Date(),
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: undefined,
      requiredClientInfo: undefined,
      amenities: [],
      delivery: false,
      paymentOption: '',
      location: null
    },
    {
      id: 'VEH002',
      name: 'Toyota Prado TXL 2020',
      category: 'vehicle',
      type: 'Used',
      status: 'Under_Offer',
      finalPrice: 8900000,
      locationName: 'Westlands, Nairobi',
      contactName: 'John Doe',
      images: ['/images/vehicle/prado-2.jpg'],
      make: 'Toyota',
      model: 'Prado TXL',
      mileage: "45000",
      createdAt: new Date(),
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: undefined,
      requiredClientInfo: undefined,
      amenities: [],
      delivery: false,
      paymentOption: '',
      location: null
    },
    {
      id: 'BOOK003',
      name: 'The Art of Frontend Design',
      category: 'book',
      type: 'New',
      status: 'Available',
      finalPrice: 1500,
      locationName: 'Online Store',
      contactName: 'Michael Otieno',
      images: ['/images/book/design-book.jpg'],
      author: 'A. I. Designer',
      publisher: 'TechPress',
      isbn: '978-1234567890',
      createdAt: new Date(),
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: undefined,
      requiredClientInfo: undefined,
      amenities: [],
      delivery: false,
      paymentOption: '',
      location: null
    },
];

// --- Generalized Data Fetching Utility ---
const fetchData = async <T,>(
    endpoint: string,
    companyId: string,
    cookiesHeaders: string,
    fallbackData: () => T,
    queryParam = 'companyId'
): Promise<{ data: T | null; error: string | null }> => {
    const url = `${apiBaseUrl}/${endpoint}?${queryParam}=${encodeURIComponent(companyId)}`;
    try {
        const res = await fetch(url, { cache: 'no-store', headers: { cookie: cookiesHeaders } });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${endpoint} (Status: ${res.status})`);
        }

        const dataRes = await res.json();
        // Adjusting based on common API responses from the original file (results or data)
        console.log(`✅ Successfully fetched data for ${endpoint}:`, dataRes);
        const data = dataRes?.results || dataRes?.data || dataRes?.data?.results || null; 
        console.log(`Extracted data for ${endpoint}:`, data);
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.warn(`No data received for ${endpoint}. Using fallback sample data.`);
            return { data: fallbackData(), error: null };
        }

        return { data: data as T, error: null };

    } catch (e: any) {
        console.error(`Server-side fetch failed for ${endpoint}:`, e);
        return { data: fallbackData(), error: e.message || `Failed to load ${endpoint}.` };
    }
};


interface PropertyPageProps {
    params:Promise<{ slug: string }>
}


export default async function PropertyManagementPage({ params }: PropertyPageProps) {
    const { slug : companyId } = await params;
    const cookiesHeaders = (await cookies()).toString();

    if (!companyId) {
        notFound();
    }

    // --- 1. Fetch Properties (Market Listings) ---
    const propertiesResult = await fetchData<any>('admin/my-market-place', companyId, cookiesHeaders, generateMockProperties);
    
    // --- 2. Fetch Categories ---
    // NOTE: The original component had a complicated fetch/mapping for categories. We simplify the fetch call here.
    const categoriesResult = await fetchData<any>('admin/get-store-categories', companyId, cookiesHeaders, () => ({ results: [] } ), 'companyId');

    // --- 3. Fetch Locations ---
    // NOTE: The original fetch was to `${apiBaseUrl}/admin/locations' without companyId. Assuming this is a global list.
    const locationsResult = await fetchData<any>('admin/locations', '', cookiesHeaders, () => ({ results: [] }), 'none');


    // Consolidate data and error handling
    const initialProperties: MarketListingForm[] = propertiesResult.data?.results || generateMockProperties();
    const initialCategories: IStoreCategory[] = categoriesResult.data?.results || [];
    const initialLocations: ILocation[] = locationsResult.data || [];
    
    // Check if at least the main data (properties) failed initially
    const serverLoadError: string | null = propertiesResult.error;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-gray-800">
            {/* Static Header Section (Server Rendered) - Enhanced Visual Design */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 bg-white p-6 rounded-2xl shadow-lg border-b-4 border-indigo-600">
                <div className="flex flex-col">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
                        <BuildingOfficeIcon className="h-10 w-10 text-indigo-600 mr-4 drop-shadow-md" />
                        Property Listings Management
                        <span className="ml-4 text-teal-600 text-2xl transform rotate-6 animate-pulse">🏠</span>
                    </h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl">
                        Effortlessly manage your diverse property portfolio, add new listings, and update details with a beautifully designed, intuitive interface.
                    </p>
                </div>
            </div>

            {/* 2. Render the Client Component with initial data */}
            <PropertyClientPage
                companyId={companyId}
                initialProperties={initialProperties}
                initialCategories={initialCategories}
                initialLocations={initialLocations}
                serverLoadError={serverLoadError}
            />
        </div>
    );
}