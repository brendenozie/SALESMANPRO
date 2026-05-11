import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/showings/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET all Showings for a specific company
async function getShowings(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company ID is required to fetch showings",
        400,
      );
    }

    const cacheKey = `admin:showings:${companyId || "global"}:all`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const showings = await prisma.showing.findMany({
      where: { companyId },
      orderBy: { dateTime: "asc" },
      // Include relations if needed
      // include: { company: true, agent: true, property: true, client: true }
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
      companyId,
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
      !companyId ||
      !propertyId ||
      !propertyName ||
      !clientName ||
      // !agentId ||
      // !agentName ||
      !dateTime
    ) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

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
    const validStatuses = ["Scheduled", "Completed", "Canceled"];
    if (status && !validStatuses.includes(status)) {
      return formatResponse(
        false,
        null,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400,
      );
    }

    const newShowing = await prisma.showing.create({
      data: {
        // companyId: companyId,
        company: { connect: { id: companyId } },
        propertyId,
        propertyName,
        ...(consumerId && { clientId: consumerId }),
        clientName,
        agentId,
        agentName,
        dateTime: new Date(dateTime),
        status: status || "Scheduled",
        notes,
      },
    });

    try {
      await cacheDel(`admin:showings:${companyId || "global"}:*`);
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

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getShowings);
export const POST = withApiHandler(createShowing);
