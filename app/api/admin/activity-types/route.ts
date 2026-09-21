import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const DEFAULT_ACTIVITY_TYPES = [
  { name: "Drawing & Art", slug: "drawing", description: "Creative drawing, painting, and visual arts", icon: "🎨", color: "#3B82F6", ageMin: 3, ageMax: 8, sortOrder: 1 },
  { name: "Story Time", slug: "story-time", description: "Interactive stories, comprehension, and vocabulary", icon: "📖", color: "#10B981", ageMin: 3, ageMax: 8, sortOrder: 2 },
  { name: "Puzzle Play", slug: "puzzle-play", description: "Logic puzzles, shapes, and spatial reasoning", icon: "🧩", color: "#F59E0B", ageMin: 4, ageMax: 9, sortOrder: 3 },
  { name: "Sing-Along", slug: "sing-along", description: "Educational songs, rhythm, and phonics", icon: "🎵", color: "#EC4899", ageMin: 3, ageMax: 7, sortOrder: 4 },
  { name: "Make Friends", slug: "make-friends", description: "Social-emotional learning, sharing, and empathy", icon: "🤝", color: "#8B5CF6", ageMin: 4, ageMax: 9, sortOrder: 5 },
];

export const GET = withApiHandler(
  async (request: NextRequest, context) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || context.companyId || context.user?.companyId;

    if (!companyId) {
      return formatResponse(false, null, "Company context required", 400);
    }

    let types = await prisma.activityType.findMany({
      where: { companyId },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { activities: true } },
      },
    });

    // Auto-seed default activity types if none exist yet for this company
    if (types.length === 0) {
      for (const item of DEFAULT_ACTIVITY_TYPES) {
        try {
          await prisma.activityType.create({
            data: {
              ...item,
              companyId,
              isActive: true,
            },
          });
        } catch {}
      }

      types = await prisma.activityType.findMany({
        where: { companyId },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { activities: true } },
        },
      });
    }

    return formatResponse(true, types, "Activity types retrieved", 200);
  },
  { requireAuth: true, requireTenant: true }
);

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const { name, slug, description, icon, color, ageMin, ageMax, sortOrder } = body;

    if (!name) {
      return formatResponse(false, null, "Name is required", 400);
    }

    const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newType = await prisma.activityType.create({
      data: {
        companyId,
        name,
        slug: finalSlug,
        description: description || null,
        icon: icon || "🎯",
        color: color || "#3B82F6",
        ageMin: ageMin ? Number(ageMin) : null,
        ageMax: ageMax ? Number(ageMax) : null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        isActive: true,
      },
    });

    return formatResponse(true, newType, "Activity type created successfully", 201);
  },
  { requireAuth: true, requireTenant: true }
);
