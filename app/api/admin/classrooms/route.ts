import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Optimized selection for list views
const CLASSROOM_LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  capacity: true,
  academicLevel: {
    select: {
      id: true,
      name: true,
    },
  },
};

// GET /api/classrooms
export const GET = withApiHandler(async (request, context) => {
  // OPTIMIZATION: Get companyId from verified user context, not searchParams
  const companyId = context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Unauthorized: No company context found", 401);
  }

  const classrooms = await prisma.classroom.findMany({
    where: { companyId },
    select: CLASSROOM_LIST_SELECT,
    orderBy: { name: "asc" },
  });

  return formatResponse(true, classrooms, "Classrooms fetched successfully", 200);
}, { requireAuth: true });

// POST /api/classrooms
export const POST = withApiHandler(async (request, context) => {
  const body = await request.json();
  const { name, description, academicLevelId, capacity } = body;
  
  // OPTIMIZATION: Securely inject companyId from auth context
  const companyId = context.user?.companyId;

  if (!name || !companyId) {
    return formatResponse(false, null, "Classroom name is required", 400);
  }

  const newClassroom = await prisma.classroom.create({
    data: {
      name,
      description,
      academicLevelId,
      companyId,
      capacity: capacity ? parseInt(capacity, 10) : null,
    },
    select: CLASSROOM_LIST_SELECT // Return formatted object immediately
  });

  return formatResponse(true, newClassroom, "Classroom created successfully", 201);
}, { requireAuth: true });
// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // GET /api/classrooms?companyId=XYZ
// export const GET = withApiHandler(async (request) => {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");

//   if (!companyId) {
//     return formatResponse(false, null, "Company ID is required", 400);
//   }

//   const classrooms = await prisma.classroom.findMany({
//     where: { companyId },
//     include: { academicLevel: true }, // Optional: includes level details
//     orderBy: { name: "asc" },
//   });

//   return formatResponse(true, classrooms, "Classrooms fetched successfully", 200);
// });

// // POST /api/classrooms
// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const { name, description, academicLevelId, companyId,capacity } = body;

//   if (!name || !companyId) {
//     return formatResponse(false, null, "Name and Company ID are required", 400);
//   }

//   const newClassroom = await prisma.classroom.create({
//     data: {
//       name,
//       description,
//       academicLevelId,
//       companyId,
//       capacity
//     },
//   });

//   return formatResponse(true, newClassroom, "Classroom created successfully", 201);
// });