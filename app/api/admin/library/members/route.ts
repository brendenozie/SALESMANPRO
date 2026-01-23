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
// api/admin/library/members/route.ts
const postMemberLogic = async (request: Request) => {
  const body = await request.json();
  const { profileId, type, memberId, companyId } = body; 
  // type is either 'STUDENT' or 'EDUCATOR'

  const data: any = {
    memberId,
    companyId,
    status: "ACTIVE"
  };

  if (type === 'STUDENT') data.studentId = profileId;
  else data.educatorId = profileId;

  const newMember = await prisma.libraryMember.create({
    data,
    include: {
      student: true,
      educator: { include: { user: true } }
    }
  });

  return formatResponse(true, newMember, "Member onboarded", 201);
};


export const POST = withApiHandler(postMemberLogic, { requireAuth: true, requireRateLimit: true });