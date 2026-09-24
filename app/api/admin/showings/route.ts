import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function resolveCompanyId(idOrSlug: string): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    return idOrSlug;
  }
  const comp = await prisma.company.findFirst({
    where: { slug: idOrSlug },
    select: { id: true },
  });
  return comp?.id || idOrSlug;
}

// GET all Showings for a specific company
async function getShowings(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCompanyId = searchParams.get("companyId");

    if (!rawCompanyId) {
      return formatResponse(
        false,
        null,
        "Company ID is required to fetch showings",
        400,
      );
    }

    const companyId = await resolveCompanyId(rawCompanyId);
    const cacheKey = buildTenantCacheKey(companyId, "showings", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const showings = await prisma.showing.findMany({
      where: { companyId },
      include: {
        agent: true,
        consumer: true,
      },
      orderBy: { dateTime: "asc" },
    });

    try {
      if (showings) {
        await cacheSet(cacheKey, showings, 60);
      }
    } catch (e) {}

    return formatResponse(true, showings, "Showings fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching showings:", error);
    return formatResponse(false, null, "Failed to fetch showings", 500);
  }
}

// POST a new Showing
async function createShowing(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId: rawCompanyId,
      propertyId,
      propertyName,
      clientId,
      clientName,
      agentId,
      agentName,
      dateTime,
      status,
      notes,
      consumerId,
    } = body;

    // Validate required fields
    if (
      !rawCompanyId ||
      !propertyId ||
      !propertyName ||
      !clientName ||
      !dateTime
    ) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const companyId = await resolveCompanyId(rawCompanyId);

    // Validate date
    if (isNaN(new Date(dateTime).getTime())) {
      return formatResponse(
        false,
        null,
        "Invalid dateTime format. Must be a valid date string.",
        400,
      );
    }

    // Validate status
    const validStatuses = ["Scheduled", "Completed", "Canceled", "Requested", "Confirmed", "Rescheduled", "No_Show"];
    if (status && !validStatuses.includes(status)) {
      return formatResponse(
        false,
        null,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400,
      );
    }

    // Zero-double-booking invariant for showings: Check if agent or property already has a confirmed showing at the same time
    const requestedTime = new Date(dateTime);
    const windowStart = new Date(requestedTime.getTime() - 30 * 60 * 1000); // 30 min window
    const windowEnd = new Date(requestedTime.getTime() + 30 * 60 * 1000);

    if (agentId) {
      const existingAgentShowing = await prisma.showing.findFirst({
        where: {
          agentId,
          status: { in: ["Scheduled", "Confirmed"] },
          dateTime: { gte: windowStart, lte: windowEnd },
        },
      });
      if (existingAgentShowing) {
        return formatResponse(
          false,
          null,
          "Agent is already scheduled for another showing within this 30-minute time window.",
          409
        );
      }
    }

    const newShowing = await prisma.showing.create({
      data: {
        company: { connect: { id: companyId } },
        propertyId,
        propertyName,
        ...(consumerId || clientId ? { clientId: consumerId || clientId } : {}),
        clientName,
        agentId,
        agentName,
        dateTime: new Date(dateTime),
        status: status || "Scheduled",
        notes,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:showings:*`);
      await cacheDel(`admin:showings:*`);
    } catch (e) {}
    return formatResponse(
      true,
      newShowing,
      "Showing created successfully",
      201,
    );
  } catch (error: any) {
    console.error("Error creating showing:", error);
    if (error.code === "P2025") {
      return formatResponse(
        false,
        null,
        "Referenced property, client, or agent not found",
        404,
      );
    }
    return formatResponse(false, null, "Failed to create showing", 500);
  }
}

export const GET = withApiHandler(getShowings);
export const POST = withApiHandler(createShowing, { requireAuth: false });
