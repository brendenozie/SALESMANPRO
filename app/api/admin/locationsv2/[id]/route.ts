// app/api/admin/[adminSlug]/locations/[locationId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// A robust slugify function (duplicate for self-containment)
const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// PUT /api/admin/[adminSlug]/locations/[locationId]
// Updates an existing location.
export async function PUT(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, locationId } = params;

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
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId },
      select: { companyId: true, slug: true, name: true }, // Select slug and name to check for uniqueness if name is updated
    });

    if (!existingLocation || existingLocation.companyId !== company.id) {
      return NextResponse.json({ message: 'Location not found or does not belong to this company.' }, { status: 404 });
    }

    let updatedSlug = existingLocation.slug;
    // If name is changed, regenerate slug and check for uniqueness
    if (name && name !== existingLocation.name) {
      const newGeneratedSlug = slugify(name);
      if (newGeneratedSlug !== existingLocation.slug) { // Only check if slug actually changes
        let uniqueSlug = newGeneratedSlug;
        let suffix = 1;
        while (await prisma.location.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${newGeneratedSlug}-${suffix}`;
          suffix++;
        }
        updatedSlug = uniqueSlug;
      }
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: name,
        slug: updatedSlug, // Use the updated/re-generated slug
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
        status: status,
      },
    });

    // Format the updated location data for frontend display
    const formattedUpdatedLocation = {
      id: updatedLocation.id,
      name: updatedLocation.name,
      slug: updatedLocation.slug,
      address: updatedLocation.address,
      city: updatedLocation.city,
      state: updatedLocation.state || '',
      zipCode: updatedLocation.zipCode || '',
      country: updatedLocation.country,
      description: updatedLocation.description || '',
      imageUrl: updatedLocation.imageUrl || 'https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image',
      phone: updatedLocation.phone || 'N/A',
      email: updatedLocation.email || 'N/A',
      capacity: updatedLocation.capacity || 0,
      openHours: updatedLocation.openHours || 'N/A',
      status: updatedLocation.status,
    };

    return NextResponse.json(formattedUpdatedLocation);
  } catch (error) {
    console.error(`Error updating location ${locationId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Location not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Unique constraint violation (e.g., slug conflict)
      return NextResponse.json({ message: 'A location with this slug already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update location', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/locations/[locationId]
// Deletes a specific location.
export async function DELETE(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, locationId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const locationToDelete = await prisma.location.findUnique({
      where: { id: locationId },
      select: { companyId: true },
    });

    if (!locationToDelete || locationToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Location not found or does not belong to this company.' }, { status: 404 });
    }

    await prisma.location.delete({
      where: { id: locationId },
    });

    return NextResponse.json({ message: 'Location deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting location ${locationId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Location not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete location', error: error.message }, { status: 500 });
  }
}
