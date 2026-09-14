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

    if (!userId || !latitude || !longitude || !address) {
      return formatResponse(false, null, "User ID, coordinates, and address are required", 400);
    }

    const safeName = name || "Primary Delivery Address";

    // ensure we have a slug (generate from name if not provided)
    const safeSlug =
      slug ||
      safeName
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    // upsert by a non-unique field is not allowed; find existing by userId then update by id or create
    const existing = await prisma.address.findFirst({
      where: { user: { id: userId } },
    });

    let location;
    if (existing) {
      location = await prisma.address.update({
        where: { id: existing.id },
        data: { name: safeName, slug: safeSlug, latitude, longitude, address, description: description || address },
      });
    } else {
      location = await prisma.address.create({
        data: {
          name: safeName,
          slug: safeSlug,
          latitude,
          longitude,
          address,
          description: description || address,
          user: { connect: { id: userId } },
        },
      });
    }

    // Sync address string with User model
    await prisma.user.update({
      where: { id: userId },
      data: { address },
    }).catch(() => null);

    return formatResponse(true, location, "Location updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating location:", error);
    return formatResponse(false, null, "Server error updating location", 500);
  }
}

export const POST = withApiHandler(handler);
