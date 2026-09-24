import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
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

  const existing = await prisma.libraryBook.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Book not found in this company.", 404);
  }

  const updatedBook = await prisma.libraryBook.update({
    where: { id },
    data: {
      title: body.title,
      author: body.author,
      isbn: body.isbn,
      publisher: body.publisher,
      status: body.status,
      location: body.location,
      ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      ...(body.shelfLocation ? { shelfLocation: body.shelfLocation } : {}),
      ...(body.condition ? { condition: body.condition } : {}),
      ...(body.integrity !== undefined ? { integrity: Number(body.integrity) } : {}),
    },
    include: { category: true },
  });

  try {
    await cacheDel(`tenant:${companyId}:libraryBooks:*`);
    await cacheDel(`admin:libraryBooks:*`);
  } catch (e) {}

  return formatResponse(true, updatedBook, "Archive record updated", 200);
};

export const PUT = withApiHandler(updateBookLogic, { requireAuth: true });

// DELETE /api/admin/library/books/[id]
const deleteBookLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryBook.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Book not found in this company.", 404);
  }

  // Clean dependent reservations and issuances safely
  await prisma.libraryReservation.deleteMany({ where: { bookId: id } });
  await prisma.libraryIssuance.deleteMany({ where: { bookId: id } });

  await prisma.libraryBook.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${companyId}:libraryBooks:*`);
    await cacheDel(`admin:libraryBooks:*`);
  } catch (e) {}

  return formatResponse(true, null, "Volume removed from archive", 200);
};

export const DELETE = withApiHandler(deleteBookLogic, { requireAuth: true });
