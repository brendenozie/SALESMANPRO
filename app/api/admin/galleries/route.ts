import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID required", 400);
  }

  const cacheKey = `admin:galleries:${companyId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch {}

  const galleries = await prisma.gallery.findMany({
    where: { companyId },
    include: {
      items: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    await cacheSet(cacheKey, galleries, 60);
  } catch {}

  return formatResponse(true, galleries, "Fetched", 200);
});

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { title, description, type, companyId } = body;

  if (!title || !companyId) {
    return formatResponse(false, null, "Required fields missing", 400);
  }

  const gallery = await prisma.gallery.create({
    data: {
      title,
      description,
      type,
      companyId,
    },
  });

  try {
    await cacheDel(`admin:galleries:${companyId}`);
  } catch {}

  return formatResponse(true, gallery, "Created", 201);
});
