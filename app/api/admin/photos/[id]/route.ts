import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/photos/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/photos/:id - Fetch a single photo by ID
export const GET = withApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;

    const cacheKey = buildTenantCacheKey(id, "photos", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const photo = await prisma.photo.findUnique({ where: { id } });

  try {
    if (photo) {
      await cacheSet(cacheKey, photo, 60);
    }
  } catch (e) {}
    if (!photo) {
      return formatResponse(false, null, "Photo not found", 404);
    }

    return formatResponse(true, photo, null, 200);
  }
);

// PUT /api/photos/:id - Update an existing photo by ID
export const PUT = withApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;
    const body = await request.json();
    const { title, description, imageUrl, tags } = body;

    try {
      const updatedPhoto = await prisma.photo.update({
        where: { id },
        data: {
          title,
          description,
          imageUrl,
          tags,
          updatedAt: new Date(),
        },
      });

    try {
      await cacheDel(`tenant:${id}:photos:*`);
      await cacheDel(`admin:photos:*`);
    } catch (e) {}
    return formatResponse(true, updatedPhoto, null, 200);
    } catch (err: any) {
      if (err.code === "P2025") {
        return formatResponse(false, null, "Photo not found", 404);
      }
      throw err; // will be caught by withApiHandler
    }
  }
);

// DELETE /api/photos/:id - Delete a photo by ID
export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;

    try {
      await prisma.photo.delete({ where: { id } });
      
    try {
      await cacheDel(`tenant:${id}:photos:*`);
      await cacheDel(`admin:photos:*`);
    } catch (e) {}
    return formatResponse(true, null, null, 204);
    } catch (err: any) {
      if (err.code === "P2025") {
        return formatResponse(false, null, "Photo not found", 404);
      }
      throw err;
    }
  }
);
