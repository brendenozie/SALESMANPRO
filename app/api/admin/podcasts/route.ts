// app/api/admin/podcasts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { v4 as uuidv4 } from "uuid";

import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/admin/podcasts
const getPodcasts = async (request: NextRequest) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const companyId = request.nextUrl.searchParams.get("companyId");

  const whereClause: { creatorId?: string } = {};
  if (companyId) {
    whereClause.creatorId = companyId;
  }

  const podcasts = await prisma.podcast.findMany({
    where: whereClause,
    include: {
      productCategory: {
        include: {
          StoreCategory: true,
        },
      },
      tags: true,
    },
  });

  return NextResponse.json(
    {
      meta: {
        companyId: companyId || "all",
        totalItems: podcasts.length,
        totalPages: 1,
        currentPage: 1,
        perPage: podcasts.length,
      },
      results: podcasts,
    },
    { status: 200 }
  );
};

// POST /api/admin/podcasts
const createPodcast = async (request: NextRequest) => {
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
    categories,
    tags,
    coverImageUrl,
    isFeatured,
    creatorId,
    creatorType,
    companyId,
  } = body;

  if (
    !companyId ||
    !title ||
    !description ||
    !audioUrl ||
    !duration ||
    !episodeNumber ||
    !releaseDate ||
    !creatorId ||
    !creatorType
  ) {
    return NextResponse.json(
      { message: "Missing required podcast fields." },
      { status: 400 }
    );
  }

  const parsedDuration = parseInt(duration, 10);
  const parsedEpisodeNumber = parseInt(episodeNumber, 10);

  if (
    isNaN(parsedDuration) ||
    parsedDuration <= 0 ||
    isNaN(parsedEpisodeNumber) ||
    parsedEpisodeNumber <= 0
  ) {
    return NextResponse.json(
      { message: "Duration and Episode Number must be positive numbers." },
      { status: 400 }
    );
  }

  const newPodcast = await prisma.podcast.create({
    data: {
      creatorId,
      creatorType,
      podcastId: `pod-${Date.now()}-${uuidv4().substring(0, 8)}`,
      title,
      description,
      audioUrl,
      duration: parsedDuration,
      episodeNumber: parsedEpisodeNumber,
      releaseDate: new Date(releaseDate),
      coverImageUrl: coverImageUrl || "",
      isFeatured: isFeatured || false,
      company: {
        connect: { id: companyId },
      },
      productCategory: categories?.[0]
        ? {
            connect: { id: categories[0] },
          }
        : undefined,
      tags: {
        connect: tags ? tags.map((id: string) => ({ id })) : [],
      },
    },
    include: {
      productCategory: true,
      tags: true,
    },
  });

  return NextResponse.json(newPodcast, { status: 201 });
};

// Wrap handlers withApiHandler for consistent error handling
export const GET = withApiHandler(getPodcasts);
export const POST = withApiHandler(createPodcast);
