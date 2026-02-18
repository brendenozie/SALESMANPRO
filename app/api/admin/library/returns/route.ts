import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/library/books
const getBooksLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const books = await prisma.libraryBook.findMany({
    where: { companyId },
    include: {
      category: {
        select: { name: true, id: true } // Fetches category info
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, books, "Archive retrieved successfully", 200);
};

export const GET = withApiHandler(getBooksLogic, { requireAuth: true, requireRateLimit: true });

// POST /api/admin/library/books
const postBookLogic = async (request: Request) => {
  const body = await request.json();
  const { 
    title, 
    author, 
    isbn, 
    publisher, 
    categoryId, // Use categoryId from dropdown
    status, 
    location, 
    companyId 
  } = body;

  if (!title || !author || !categoryId || !companyId) {
    return formatResponse(false, null, "Missing required fields.", 400);
  }

  // ISBN Conflict Check
  if (isbn) {
    const existing = await prisma.libraryBook.findUnique({ where: { isbn } });
    if (existing) return formatResponse(false, null, "ISBN already exists.", 409);
  }

  const newBook = await prisma.libraryBook.create({
    data: {
      title,
      author,
      isbn: isbn || null,
      publisher: publisher || null,
      status: status || "AVAILABLE",
      location: location || null,
      company: {
        connect: { id: companyId }
      },
      category: {
        connect: { id: categoryId } // Connects to existing category
      }
    },
    include: { category: true } // Return with category for UI update
  });

  return formatResponse(true, newBook, "Volume acquired successfully", 201);
};

export const POST = withApiHandler(postBookLogic, { requireAuth: true, requireRateLimit: true });