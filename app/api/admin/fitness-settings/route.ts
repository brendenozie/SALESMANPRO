// app/api/admin/[adminSlug]/settings/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/admin/[adminSlug]/settings
// Fetches general settings for a specific company.
export async function GET(request, { params }) {
  const { adminSlug } = params;

   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    let settings = await prisma.companySettings.findUnique({
      where: { companyId: company.id },
    });

    // If settings don't exist, create default ones
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyId: company.id,
          companyName: company.name, // Initialize with company name
          contactEmail: `info@${company.slug}.com`, // Default email
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
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ message: 'Failed to fetch settings', error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/[adminSlug]/settings
// Updates general settings for a specific company.
export async function PUT(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;

  try {
    const body = await request.json();
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

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // Upsert: update if exists, create if not
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
      create: { // Should ideally not be hit if GET creates defaults, but good for robustness
        companyId: company.id,
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
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ message: 'Failed to update settings', error: error.message }, { status: 500 });
  }
}
