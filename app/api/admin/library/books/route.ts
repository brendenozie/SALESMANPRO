import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/library/books
// Fetches all library books filtered by companyId
const getBooksLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch books.", 400);
  }

  const books = await prisma.libraryBook.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, books, "Books retrieved successfully", 200);
};

export const GET = withApiHandler(getBooksLogic, { requireAuth: true, requireRateLimit: true });

// POST /api/admin/library/books
// Creates a new library book
const postBookLogic = async (request: Request) => {
  const body = await request.json();
  const { title, author, isbn, publisher, category, status, location, companyId } = body;

  if (!title || !author || !category || !companyId) {
    return formatResponse(
      false,
      null,
      "Title, author, category, and company ID are required.",
      400
    );
  }

  // Check if ISBN already exists (if provided)
  if (isbn) {
    const existingBook = await prisma.libraryBook.findUnique({
      where: { isbn },
    });
    if (existingBook) {
      return formatResponse(false, null, "A book with this ISBN already exists.", 409);
    }
  }

  const newBook = await prisma.libraryBook.create({
    data: {
      title,
      author,
      isbn: isbn || null,
      publisher: publisher || null,
      category,
      status: status || "AVAILABLE",
      location: location || null,
      companyId,
    },
  });

  return formatResponse(true, newBook, "Book created successfully", 201);
};

export const POST = withApiHandler(postBookLogic, { requireAuth: true, requireRateLimit: true });
