// app/api/admin/[adminSlug]/virtual-tours/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// GET /api/admin/[adminSlug]/virtual-tours
// Fetches all virtual tours for a specific company.
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

    const virtualTours = await prisma.content.findMany({
      where: {
        companyId: company.id,
        contentType: 'VIDEO', // Filter for content of type VIDEO
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma Content model to a frontend-friendly interface
    const formattedTours = virtualTours.map(tour => ({
      id: tour.id,
      title: tour.title,
      location: tour.location || 'N/A',
      duration: tour.duration || 'N/A',
      category: tour.category || 'Uncategorized',
      videoUrl: tour.contentUrl,
      thumbnailUrl: tour.thumbnailUrl || 'https://placehold.co/400x250/E0E7FF/4338CA?text=No+Thumbnail',
      description: tour.description || '', // Include description if it exists
      published: tour.published,
    }));

    return NextResponse.json(formattedTours);
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    return NextResponse.json({ message: 'Failed to fetch virtual tours', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/virtual-tours
// Creates a new virtual tour.
export async function POST(request, { params }) {
  const { adminSlug } = params;

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
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const companyId = company.id;

    // Basic validation
    if (!title || !location || !duration || !category || !videoUrl || !thumbnailUrl) {
      return NextResponse.json({ message: 'Missing required fields for virtual tour creation.' }, { status: 400 });
    }

    const newVirtualTour = await prisma.content.create({
      data: {
        title: title,
        location: location,
        duration: duration,
        category: category,
        contentUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        description: description || null,
        contentType: 'VIDEO', // Explicitly set content type
        published: published || false, // Default to false if not provided
        company: {
          connect: { id: companyId },
        },
      },
    });

    // Format the new tour data for frontend display
    const formattedNewTour = {
      id: newVirtualTour.id,
      title: newVirtualTour.title,
      location: newVirtualTour.location || 'N/A',
      duration: newVirtualTour.duration || 'N/A',
      category: newVirtualTour.category || 'Uncategorized',
      videoUrl: newVirtualTour.contentUrl,
      thumbnailUrl: newVirtualTour.thumbnailUrl || 'https://placehold.co/400x250/E0E7FF/4338CA?text=No+Thumbnail',
      description: newVirtualTour.description || '',
      published: newVirtualTour.published,
    };

    return NextResponse.json(formattedNewTour, { status: 201 });
  } catch (error) {
    console.error('Error creating virtual tour:', error);
    return NextResponse.json({ message: 'Failed to create virtual tour', error: error.message }, { status: 500 });
  }
}
