import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/podcasts/route.ts

import prisma from "@/server/db/prismadb";
import { v4 as uuidv4 } from "uuid";

import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/admin/podcasts
const getPodcasts = async (request: Request) => {
  
  const searchParams = new URL(request.url).searchParams;

  const companyId = searchParams.get("companyId");

  const whereClause: { creatorId?: string } = {};
  if (companyId) {
    whereClause.creatorId = companyId;
  }

  
    const cacheKey = `admin:podcasts:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
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

  try {
    if (podcasts) {
      await cacheSet(cacheKey, podcasts, 60);
    }
  } catch (e) {}

  return formatResponse(true, podcasts, null, 200);
};

// POST /api/admin/podcasts
const createPodcast = async (request: Request) => {
  


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
    return formatResponse(
      false,
      null,
      "Missing required fields",
      400
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
    return formatResponse(
      false,
      null,
      "Duration and episodeNumber must be positive integers",
      400
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

  
    try { await cacheDel(`admin:podcasts:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newPodcast, null, 201);
};

// Wrap handlers withApiHandler for consistent error handling
export const GET = withApiHandler(getPodcasts);
export const POST = withApiHandler(createPodcast);
