// app/api/admin/podcasts/route.ts
import { NextRequest, NextResponse } from 'next/server';

import prisma from "@/server/db/prismadb"; 
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs if needed (e.g., for podcastId)
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/admin/podcasts
// Fetches all podcasts, optionally filtered by companyId (creatorId)
export async function GET(request: NextRequest) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const companyId = request.nextUrl.searchParams.get('companyId');

    const whereClause: { creatorId?: string } = {};
    if (companyId) {
      whereClause.creatorId = companyId;
    }

    const podcasts = await prisma.podcast.findMany({
      where: whereClause,
      // You can add orderBy, skip, take for pagination here if needed
      // orderBy: { createdAt: 'desc' },
      include: { // Include related categories and tags if you want to return them
        productCategory: {
          include:{
            StoreCategory:true
          }
        },
        tags: true,
      },
    });

    // For pagination, you'd calculate totalItems, totalPages etc.
    // For simplicity, we're returning all filtered results.
    return NextResponse.json({
      meta: {
        companyId: companyId || 'all',
        totalItems: podcasts.length,
        totalPages: 1, // Simplified
        currentPage: 1, // Simplified
        perPage: podcasts.length, // Simplified
      },
      results: podcasts,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch podcasts', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/podcasts
// Creates a new podcast
export async function POST(request: NextRequest) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body = await request.json();
    const {
      title,
      description,
      audioUrl,
      duration,
      episodeNumber,
      releaseDate,
      categories, // Array of category IDs (strings)
      tags,       // Array of tag IDs (strings)
      coverImageUrl,
      isFeatured,
      creatorId,
      creatorType,
      companyId
    } = body;

    // Basic validation
    if (!companyId || !title || !description || !audioUrl || !duration || !episodeNumber || !releaseDate || !creatorId || !creatorType) {
      return NextResponse.json(
        { message: 'Missing required podcast fields.' },
        { status: 400 }
      );
    }

    // Ensure duration and episodeNumber are numbers
    const parsedDuration = parseInt(duration, 10);
    const parsedEpisodeNumber = parseInt(episodeNumber, 10);

    if (isNaN(parsedDuration) || parsedDuration <= 0 || isNaN(parsedEpisodeNumber) || parsedEpisodeNumber <= 0) {
      return NextResponse.json(
        { message: 'Duration and Episode Number must be positive numbers.' },
        { status: 400 }
      );
    }

    // Create the podcast in the database
    const newPodcast = await prisma.podcast.create({
      data: {
        creatorId,
        creatorType,
        podcastId: `pod-${Date.now()}-${uuidv4().substring(0, 8)}`, // Generate a unique podcastId
        title,
        description,
        audioUrl,
        duration: parsedDuration,
        episodeNumber: parsedEpisodeNumber,
        releaseDate: new Date(releaseDate), // Convert string to Date object for DateTime field
        coverImageUrl: coverImageUrl || '',
        isFeatured: isFeatured || false,
        company: {
          connect: {id : companyId}
        },
        // Connect to existing categories and tags by their IDs
        // productCategory: {
        //   connect: categories[0] //? categories.map((id: string) => ({ id })) : [],
        // },

        // productCategory: { connect: { id: categories[0] } },
        productCategory: categories?.[0] ? {
            connect: { id: categories[0] }
          } : undefined,
        tags: {
          connect: tags ? tags.map((id: string) => ({ id })) : [],
        },
      },
      include: { // Optionally include connected categories/tags in the response
        productCategory: true,
        tags: true,
      },
    });

    return NextResponse.json(newPodcast, { status: 201 });

  } catch (error: any) {
    console.error('Error creating podcast:', error);
    // Handle Prisma specific errors if needed, e.g., unique constraint violation
    if (error.code === 'P2002') { // Unique constraint failed
      return NextResponse.json(
        { message: 'A podcast with this podcastId already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create podcast', error: error.message },
      { status: 500 }
    );
  }
}