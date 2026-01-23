import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch all library members with profile details and pending fines
 */
const getMembersLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const members = await prisma.libraryMember.findMany({
    where: { companyId },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          contactEmail: true,
          admissionNumber: true,
          profilePicture: true,
        },
      },
      educator: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      // Include issuances and their pending fines for the Member Card debt alert
      libraryIssuances: {
        include: {
          fines: {
            where: { status: "PENDING" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, members, "Library directory retrieved", 200);
};

/**
 * POST: Onboard a Student or Educator as a Library Member
 */
const postMemberLogic = async (request: Request) => {
  const body = await request.json();
  const { profileId, type, memberId, companyId } = body;

  if (!profileId || !type || !memberId || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  // Check if this profile is already onboarded to prevent duplicates
  const existingMember = await prisma.libraryMember.findFirst({
    where: {
      OR: [
        { studentId: type === "STUDENT" ? profileId : undefined },
        { educatorId: type === "EDUCATOR" ? profileId : undefined },
      ],
    },
  });

  if (existingMember) {
    return formatResponse(false, null, "This profile is already a library member", 400);
  }

  // Check if the Library Member ID is already taken
  const duplicateId = await prisma.libraryMember.findUnique({
    where: { memberId },
  });

  if (duplicateId) {
    return formatResponse(false, null, "Library ID already assigned to another member", 400);
  }

  const data: any = {
    memberId,
    companyId,
    status: "ACTIVE",
  };

  if (type === "STUDENT") {
    data.studentId = profileId;
  } else {
    data.educatorId = profileId;
  }

  const newMember = await prisma.libraryMember.create({
    data,
    include: {
      student: true,
      educator: { include: { user: true } },
      libraryIssuances: { include: { fines: true } } // Return empty arrays to match frontend structure
    },
  });

  return formatResponse(true, newMember, "Member successfully onboarded", 201);
};

export const GET = withApiHandler(getMembersLogic, { requireAuth: true });
export const POST = withApiHandler(postMemberLogic, { requireAuth: true, requireRateLimit: true });
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // GET /api/admin/library/books
// const getBooksLogic = async (request: Request) => {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");

//   if (!companyId) {
//     return formatResponse(false, null, "Company ID is required.", 400);
//   }

//   const books = await prisma.libraryBook.findMany({
//     where: { companyId },
//     include: {
//       category: {
//         select: { name: true, id: true } // Fetches category info
//       }
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return formatResponse(true, books, "Archive retrieved successfully", 200);
// };

// export const GET = withApiHandler(getBooksLogic, { requireAuth: true, requireRateLimit: true });

// // POST /api/admin/library/books
// // api/admin/library/members/route.ts
// const postMemberLogic = async (request: Request) => {
//   const body = await request.json();
//   const { profileId, type, memberId, companyId } = body; 
//   // type is either 'STUDENT' or 'EDUCATOR'

//   const data: any = {
//     memberId,
//     companyId,
//     status: "ACTIVE"
//   };

//   if (type === 'STUDENT') data.studentId = profileId;
//   else data.educatorId = profileId;

//   const newMember = await prisma.libraryMember.create({
//     data,
//     include: {
//       student: true,
//       educator: { include: { user: true } }
//     }
//   });

//   return formatResponse(true, newMember, "Member onboarded", 201);
// };


// export const POST = withApiHandler(postMemberLogic, { requireAuth: true, requireRateLimit: true });