// app/api/admin/[adminSlug]/virtual-tours/[tourId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// PUT /api/admin/[adminSlug]/virtual-tours/[tourId]
// Updates an existing virtual tour.
export async function PUT(request, { params }) {
  const { adminSlug, tourId } = params;

  try {
    const body = await request.json();
    const {
      title,
      location,
      duration,
      category,
      videoUrl,
      thumbnailUrl,
      description,
      published,
    } = body;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingTour = await prisma.content.findUnique({
      where: { id: tourId },
      select: { companyId: true }, // Select companyId to verify ownership
    });

    if (!existingTour || existingTour.companyId !== company.id) {
      return NextResponse.json({ message: 'Virtual tour not found or does not belong to this company.' }, { status: 404 });
    }

    const updatedTour = await prisma.content.update({
      where: { id: tourId },
      data: {
        title: title,
        location: location,
        duration: duration,
        category: category,
        contentUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        description: description || null,
        published: published,
      },
    });

    // Format the updated tour data for frontend display
    const formattedUpdatedTour = {
      id: updatedTour.id,
      title: updatedTour.title,
      location: updatedTour.location || 'N/A',
      duration: updatedTour.duration || 'N/A',
      category: updatedTour.category || 'Uncategorized',
      videoUrl: updatedTour.contentUrl,
      thumbnailUrl: updatedTour.thumbnailUrl || 'https://placehold.co/400x250/E0E7FF/4338CA?text=No+Thumbnail',
      description: updatedTour.description || '',
      published: updatedTour.published,
    };

    return NextResponse.json(formattedUpdatedTour);
  } catch (error) {
    console.error(`Error updating virtual tour ${tourId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Virtual tour not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update virtual tour', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/virtual-tours/[tourId]
// Deletes a specific virtual tour.
export async function DELETE(request, { params }) {
  const { adminSlug, tourId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const tourToDelete = await prisma.content.findUnique({
      where: { id: tourId },
      select: { companyId: true },
    });

    if (!tourToDelete || tourToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Virtual tour not found or does not belong to this company.' }, { status: 404 });
    }

    await prisma.content.delete({
      where: { id: tourId },
    });

    return NextResponse.json({ message: 'Virtual tour deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting virtual tour ${tourId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Virtual tour not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete virtual tour', error: error.message }, { status: 500 });
  }
}
