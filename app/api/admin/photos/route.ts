// app/api/photos/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/photos - Fetch all photos
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const photos = await prisma.photo.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, photos, null, 200);
});

// POST /api/photos - Create a new photo
export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { title, description, imageUrl, tags, companyId, userId } = body;

  if (!title || !imageUrl) {
    return formatResponse(false, null, "Title and imageUrl are required", 400);
  }

  const newPhoto = await prisma.photo.create({
    data: {
      title,
      description,
      imageUrl,
      tags: tags || [],
      date: new Date(),
      companyId,
      userId,
    },
  });

  return formatResponse(true, newPhoto, null, 201);
});
