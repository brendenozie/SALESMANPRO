// app/api/admin/parents/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/admin/parents?teacherId=...
async function getParents(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return formatResponse(false, null, 'Missing teacherId', 400);
    }

    // Derive companyId from the educator (teacherId)
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return formatResponse(false, null, 'Educator not found or not associated with a company', 404);
    }

    const parents = await prisma.parent.findMany({
      where: { companyId: educator.companyId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const parentOptions = parents.map(parent => ({
      id: parent.id,
      name: parent.user?.name || 'N/A',
      email: parent.user?.email || 'N/A',
    }));

    return formatResponse(true, parentOptions, 'Parents fetched successfully', 200);
  } catch (error: any) {
    console.error('Error fetching parents:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch parents', 500);
  }
}

// Export GET handler wrapped with withApiHandler
export const GET = withApiHandler(getParents, { requireAuth: true });
