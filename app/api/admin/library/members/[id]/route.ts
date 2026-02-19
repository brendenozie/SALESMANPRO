import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/books/[id]
const updateBookLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const updatedBook = await prisma.libraryBook.update({
    where: { id, companyId },
    data: {
      title: body.title,
      author: body.author,
      isbn: body.isbn,
      publisher: body.publisher,
      status: body.status,
      location: body.location,
      // Re-connect to a different category if changed
      categoryId: body.categoryId 
    },
    include: { category: true }
  });

    // Invalidate relevant caches
    try { await cacheDel(`admin:libraryBooks:${companyId || 'global'}:*`); } catch (e) {}

  return formatResponse(true, updatedBook, "Archive record updated", 200);
};

export const PUT = withApiHandler(updateBookLogic, { requireAuth: true });

// DELETE /api/admin/library/books/[id]
const deleteBookLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  await prisma.libraryBook.delete({
    where: { id, companyId },
  });

    // Invalidate relevant caches
    try { await cacheDel(`admin:libraryBooks:${companyId || 'global'}:*`); } catch (e) {}
    
  return formatResponse(true, null, "Volume removed from archive", 200);
};

export const DELETE = withApiHandler(deleteBookLogic, { requireAuth: true });