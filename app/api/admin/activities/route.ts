/**
 * /api/admin/activities
 *
 * GET  — List activities for a company (filterable by type, published status, ageGroup)
 * POST — Create a new activity (teacher/admin only)
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";

// ── GET ──────────────────────────────────────────────────────────────────────
export const GET = withApiHandler(
  async (request: NextRequest, context) => {
    const { searchParams } = new URL(request.url);
    let companyId = searchParams.get("companyId");
    const companySlug = searchParams.get("companySlug") || searchParams.get("schoolSlug");
    const activityTypeId = searchParams.get("activityTypeId");
    const activityTypeSlug = searchParams.get("type") || searchParams.get("activityType") || searchParams.get("activityTypeSlug") || searchParams.get("slug");
    const publishedOnly = searchParams.get("publishedOnly") === "true";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const skip = (page - 1) * limit;

    if (!companyId && companySlug) {
      const company = await findCompanyCached(companySlug);
      if (company) companyId = company.id;
    }

    if (!companyId && context.user?.companyId) {
      companyId = context.user.companyId;
    }

    if (!companyId) {
      return formatResponse(false, null, "companyId or companySlug is required", 400);
    }

    const where: Record<string, unknown> = { companyId };
    if (activityTypeId) where.activityTypeId = activityTypeId;
    if (publishedOnly) where.isPublished = true;
    if (activityTypeSlug) {
      where.activityType = { slug: activityTypeSlug };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          activityType: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          createdBy: { select: { id: true, name: true } },
          mediaAsset: { select: { id: true, url: true, thumbnailUrl: true, type: true } },
          _count: { select: { assignments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return formatResponse(
      true,
      { activities, total, page, limit, totalPages: Math.ceil(total / limit) },
      "Activities retrieved",
      200
    );
  },
  { requireAuth: false }
);

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      companyId,
      activityTypeId,
      title,
      description,
      instructions,
      ageMin,
      ageMax,
      durationMins,
      content,
      mediaAssetId,
      isPublished,
      isAiGenerated,
    } = body;

    if (!companyId || !activityTypeId || !title) {
      return formatResponse(
        false,
        null,
        "companyId, activityTypeId, and title are required",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    // Verify activity type belongs to this company
    const activityType = await prisma.activityType.findFirst({
      where: { id: activityTypeId, companyId },
    });
    if (!activityType) {
      return formatResponse(false, null, "Activity type not found", 404);
    }

    const activity = await prisma.activity.create({
      data: {
        companyId,
        activityTypeId,
        title,
        description,
        instructions,
        ageMin: ageMin ? Number(ageMin) : null,
        ageMax: ageMax ? Number(ageMax) : null,
        durationMins: durationMins ? Number(durationMins) : (body.durationMin ? Number(body.durationMin) : null),
        content: content ?? undefined,
        mediaAssetId: mediaAssetId ?? null,
        createdById: userId,
        isPublished: Boolean(isPublished),
        isAiGenerated: Boolean(isAiGenerated),
      },
      include: {
        activityType: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    return formatResponse(true, activity, "Activity created successfully", 201);
  },
  { requireAuth: true }
);
