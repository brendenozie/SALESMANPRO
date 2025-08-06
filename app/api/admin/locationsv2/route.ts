// app/api/admin/[adminSlug]/locations/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// A robust slugify function to create a URL-friendly string from a name.
const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD') // Normalize characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
};

// GET /api/admin/[adminSlug]/locations
// Fetches all locations for a specific company.
export async function GET(request, { params }) {
  const { adminSlug } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const locations = await prisma.location.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma Location model to a frontend-friendly interface
    const formattedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      address: location.address,
      city: location.city,
      state: location.state || '',
      zipCode: location.zipCode || '',
      country: location.country,
      description: location.description || '',
      imageUrl: location.imageUrl || 'https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image',
      phone: location.phone || 'N/A',
      email: location.email || 'N/A',
      capacity: location.capacity || 0,
      openHours: location.openHours || 'N/A',
      status: location.status,
    }));

    return NextResponse.json(formattedLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ message: 'Failed to fetch locations', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/locations
// Creates a new location.
export async function POST(request, { params }) {
  const { adminSlug } = params;

  try {
    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      zipCode,
      country,
      description,
      imageUrl,
      phone,
      email,
      capacity,
      openHours,
      status,
    } = body;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const companyId = company.id;

    // Basic validation
    if (!name || !address || !city || !country) {
      return NextResponse.json({ message: 'Name, address, city, and country are required.' }, { status: 400 });
    }

    // Generate slug and check for uniqueness
    const generatedSlug = slugify(name);
    const existingLocationWithSlug = await prisma.location.findUnique({
      where: { slug: generatedSlug },
    });

    if (existingLocationWithSlug) {
      // Append a unique suffix if slug already exists
      let uniqueSlug = generatedSlug;
      let suffix = 1;
      while (await prisma.location.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${generatedSlug}-${suffix}`;
        suffix++;
      }
      generatedSlug = uniqueSlug;
    }

    const newLocation = await prisma.location.create({
      data: {
        name: name,
        slug: generatedSlug,
        address: address,
        city: city,
        state: state || null,
        zipCode: zipCode || null,
        country: country,
        description: description || null,
        imageUrl: imageUrl || null,
        phone: phone || null,
        email: email || null,
        capacity: capacity ? parseInt(capacity) : null,
        openHours: openHours || null,
        status: status || 'OPEN',
        company: {
          connect: { id: companyId },
        },
      },
    });

    // Format the new location data for frontend display
    const formattedNewLocation = {
      id: newLocation.id,
      name: newLocation.name,
      slug: newLocation.slug,
      address: newLocation.address,
      city: newLocation.city,
      state: newLocation.state || '',
      zipCode: newLocation.zipCode || '',
      country: newLocation.country,
      description: newLocation.description || '',
      imageUrl: newLocation.imageUrl || 'https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image',
      phone: newLocation.phone || 'N/A',
      email: newLocation.email || 'N/A',
      capacity: newLocation.capacity || 0,
      openHours: newLocation.openHours || 'N/A',
      status: newLocation.status,
    };

    return NextResponse.json(formattedNewLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    // Specific error for unique constraint if slugify logic fails or for other unique fields
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A location with similar details already exists (e.g., slug conflict).', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create location', error: error.message }, { status: 500 });
  }
}
