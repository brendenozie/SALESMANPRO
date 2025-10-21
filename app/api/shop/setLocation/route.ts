import prisma from "@/server/db/prismadb";
import { rateLimit } from "@/lib/rate-limit";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// POST /api/location
async function handler(req: Request) {

  const ip = req.headers.get("x-forwarded-for") || "local";

  if (!rateLimit(ip)) {
    return formatResponse(false, null, "Too many requests", 429);
  }

  try {
    const { userId, name, slug, latitude, longitude, address, description } = await req.json();

    if (!userId || !name || !latitude || !longitude || !address) {
      return formatResponse(false, null, "All fields are required", 400);
    }

    // ensure we have a slug (generate from name if not provided)
    const safeSlug =
      slug ||
      name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    // upsert by a non-unique field is not allowed; find existing by userId then update by id or create
    const existing = await prisma.location.findFirst({
      // where: { user: { id: userId } },
    });

    let location;
    if (existing) {
      location = await prisma.location.update({
        where: { id: existing.id },
        data: { name, slug: safeSlug, latitude, longitude, address, description },
      });
    } else {
      location = await prisma.location.create({
        data: {
          name,
          slug: safeSlug,
          latitude,
          longitude,
          address,
          description,
        },
      });
    }

    return formatResponse(true, location, "Location updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating location:", error);
    return formatResponse(false, null, "Server error updating location", 500);
  }
}

export const POST = withApiHandler(handler);
