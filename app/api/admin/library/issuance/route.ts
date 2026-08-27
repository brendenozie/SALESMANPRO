import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Missing Company ID", 400);

  const cacheKey = `admin:issuance:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const records = await prisma.libraryIssuance.findMany({
    where: { companyId },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  try {
    if (records) {
      await cacheSet(cacheKey, records, 60);
    }
  } catch (e) {}

  return formatResponse(true, records, "Issuance records retrieved", 200);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookId, memberId, dueDate, companyId } = body;

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Issuance (Converting dueDate string to Date object)
      const issuance = await tx.libraryIssuance.create({
        data: {
          bookId,
          libraryMemberId: memberId,
          companyId,
          dueDate: new Date(dueDate),
          status: 'ACTIVE',
        },
        include: { book: true }
      });

      // 2. Update Book Status (Assuming your model uses a status field)
      await tx.libraryBook.update({
        where: { id: bookId },
        data: { status: 'ISSUED' } 
      });

      return issuance;
    });

    // Invalidate relevant caches
    try { await cacheDel(`admin:issuance:${companyId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, transaction, "Issuance created successfully", 201);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}