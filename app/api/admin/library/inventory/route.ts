import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch Master Inventory
 */
const getInventory = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const books = await prisma.libraryBook.findMany({
    where: { companyId },
    select: {
      id: true,
      title: true,
      category: true,
      shelfLocation: true,
      condition: true,
      integrity: true,
      lastAudit: true,
      status: true,
    }
  });

  return formatResponse(true, books, "Inventory data synced", 200);
};

/**
 * PATCH: Perform Audit / Verification
 */
export const PATCH = withApiHandler(async (request: Request) => {
  const { bookId, integrity, condition } = await request.json();

  const updatedBook = await prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      lastAudit: new Date(),
      integrity: integrity ?? undefined,
      condition: condition ?? undefined,
    }
  });

  return formatResponse(true, updatedBook, "Audit log updated", 200);
}, { requireAuth: true });

export const GET = withApiHandler(getInventory, { requireAuth: true });