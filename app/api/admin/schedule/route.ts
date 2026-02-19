import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/schedule/route.ts

import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- GET: Fetch all scheduled and draft content ---
async function getSchedule(req: Request, { params }: { params: { adminSlug: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const isAdmin = true; // TODO: Replace with real authentication logic
  if (!isAdmin) return formatResponse(false, null, "Unauthorized", 401);
    
  const cacheKey = `admin:schedule:${params.adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
  const articles = await prisma.content.findMany({
      where: { status: { in: ["Scheduled", "Draft"] } },
      select: { id: true, title: true, type: true, status: true, publishDate: true },
    });

    const videos = await prisma.video.findMany({
      where: { status: { in: ["PUBLISHED", "PROCESSING", "DRAFT"] } },
      select: { id: true, title: true, status: true, createdAt: true  },
    });

    const formattedArticles = articles.map(item => ({
      ...item,
      date: item.publishDate ? item.publishDate.toISOString().split("T")[0] : "N/A",
      type: "Article",
    }));

    const formattedVideos = videos.map(item => ({
      ...item,
      date: item.createdAt ? item.createdAt.toISOString().split("T")[0] : "N/A",
      type: "Video",
      status: item.status === "PUBLISHED" ? "Scheduled" : item.status,
    }));

    const mergedContent = [...formattedArticles, ...formattedVideos];
    mergedContent.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    try {
      await cacheSet(cacheKey, mergedContent, 60);
    } catch (e) {}

    return formatResponse(true, mergedContent, "Schedule fetched successfully", 200);
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return formatResponse(false, null, "Internal server error", 500);
  } finally {
    await prisma.$disconnect();
  }
}

// --- POST: Create new scheduled content ---
async function createSchedule(req: Request, { params }: { params: { adminSlug: string } }) {
  
  const company = await prisma.company.findFirst(
    { where: { slug: params.adminSlug } }
  );

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  try {
    const body = await req.json();
    const { type, title, status, date } = body;

    if (!type || !title || !status) {
      return formatResponse(false, null, "Missing required fields: type, title, status", 400);
    }

    let newItem;

    if (type === "Article") {
      newItem = await prisma.content.create({
        data: {
          title,
          status,
          publishDate: date ? new Date(date) : undefined,
          company: { connect: { id: company.id } },
        },
      });
    } else if (type === "Video") {
      newItem = await prisma.video.create({
        data: {
          title,
          status,
          createdAt: date ? new Date(date) : undefined,
          album: { connect: { id: company.id } },
        },
      });
    } else {
      return formatResponse(false, null, "Invalid content type", 400);
    }

    
    try { await cacheDel(`admin:schedule:${params.adminSlug || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newItem, "Content created successfully", 201);
  } catch (error) {
    console.error("Failed to create content:", error);
    return formatResponse(false, null, "Internal server error", 500);
  } finally {
    await prisma.$disconnect();
  }
}

// --- PATCH: Update scheduled content ---
async function updateSchedule(req: Request, { params }: { params: { adminSlug: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const isAdmin = true; // TODO: Replace with real authentication logic
  if (!isAdmin) return formatResponse(false, null, "Unauthorized", 401);

  try {
    const body = await req.json();
    const { id, type, title, status, date } = body;

    let updatedItem;

    if (type === "Article") {
      updatedItem = await prisma.content.update({
        where: { id },
        data: { title, status, publishDate: date ? new Date(date) : undefined },
      });
    } else if (type === "Video") {
      updatedItem = await prisma.video.update({
        where: { id },
        data: { title, status, createdAt: date ? new Date(date) : undefined },
      });
    } else {
      return formatResponse(false, null, "Invalid content type", 400);
    }

    
    try { await cacheDel(`admin:schedule:${params.adminSlug || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedItem, "Content updated successfully", 200);
  } catch (error) {
    console.error("Failed to update item:", error);
    return formatResponse(false, null, "Internal server error", 500);
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getSchedule);
export const POST = withApiHandler(createSchedule);
export const PATCH = withApiHandler(updateSchedule);
