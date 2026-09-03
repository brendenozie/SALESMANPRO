import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";


import prisma from '@/server/db/prismadb'; // Adjust this path
// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Define the type for the dynamic route context
type RouteContext = {
    params: {
        adminSlug: string; // The company slug
    };
};

// =======================================================================
// Helper to initialize default settings
// =======================================================================
const initializeSettings = async (companyId: string, companySlug: string, companyName: string) => {
    return prisma.companySettings.create({
        data: {
            companyId: companyId,
            companyName: companyName,
            contactEmail: `info@${companySlug}.com`,
            contactPhone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            logoUrl: '',
            currency: 'USD',
            timezone: 'America/New_York',
            emailNotifications: true,
            smsNotifications: false,
        },
    });
};

// =======================================================================
// --- GET Handler Logic (Fetches general settings) ---
// =======================================================================
const getSettingsLogic = async (request: Request, { params }: RouteContext) => {
    const { adminSlug } = params;

    // 1. Find the company ID based on the adminSlug
    
    const cacheKey = buildTenantCacheKey(adminSlug, "fitness-settings", {});

    try {
        const cached = await cacheGet(cacheKey);
        if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

  const company = await prisma.company.findUnique({
        where: { slug: adminSlug },
        select: { id: true, name: true, slug: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found for the given slug.', 404);
    }

    // 2. Fetch existing settings
    let settings = await prisma.companySettings.findUnique({
        where: { companyId: company.id },
    });

    // 3. If settings don't exist, create default ones
    if (!settings) {
        settings = await initializeSettings(company.id, company.slug, company.name);
    }

        try {
            if (settings) {
                await cacheSet(cacheKey, settings, 60);
            }
        } catch (e) {}

    return formatResponse(true, settings, 'Settings fetched successfully', 200);
};

// =======================================================================
// --- PUT Handler Logic (Updates general settings) ---
// =======================================================================
const putSettingsLogic = async (request: Request, { params }: RouteContext) => {
    const { adminSlug } = params;
    const body = await request.json();

    // 1. Find the company ID based on the adminSlug
    const company = await prisma.company.findUnique({
        where: { slug: adminSlug },
        select: { id: true, name: true, slug: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found for the given slug.', 404);
    }

    const {
        companyName,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        zipCode,
        country,
        logoUrl,
        currency,
        timezone,
        emailNotifications,
        smsNotifications,
    } = body;

    // 2. Upsert: update if exists, create if not
    const updatedSettings = await prisma.companySettings.upsert({
        where: { companyId: company.id },
        update: {
            companyName: companyName,
            contactEmail: contactEmail,
            contactPhone: contactPhone,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            country: country,
            logoUrl: logoUrl,
            currency: currency,
            timezone: timezone,
            emailNotifications: emailNotifications,
            smsNotifications: smsNotifications,
        },
        create: { // Used if no setting exists and PUT is the first call (robustness)
            companyId: company.id,
            companyName: companyName || company.name, // Use existing company name if not provided
            contactEmail: contactEmail || `info@${company.slug}.com`,
            contactPhone: contactPhone,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            country: country,
            logoUrl: logoUrl,
            currency: currency || 'USD',
            timezone: timezone || 'America/New_York',
            emailNotifications: emailNotifications ?? true,
            smsNotifications: smsNotifications ?? false,
        },
    });

    
    try {
      await cacheDel(`tenant:${adminSlug}:fitness-settings:*`);
      await cacheDel(`admin:fitness-settings:*`);
    } catch (e) {}
    return formatResponse(true, updatedSettings, 'Settings updated successfully', 200);
};

// Export the handlers wrapped with withApiHandler
// Authentication and general error handling are now centralized.
export const GET = withApiHandler(getSettingsLogic);
export const PUT = withApiHandler(putSettingsLogic);
