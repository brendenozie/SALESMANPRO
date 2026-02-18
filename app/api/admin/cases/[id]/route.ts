import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define a reusable selection for performance and security
const CASE_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  createdAt: true,
  client: {
    select: {
      id: true,
      user: { select: { name: true, image: true, email: true } }
    }
  },
  assignedTo: {
    select: { id: true, name: true, image: true }
  }
};

// GET: Fetch a single case
const getCase = async (_req: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  const cacheKey = `admin:case:${id}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, null, 200);
  } catch (e) {}

  const singleCase = await prisma.case.findUnique({
    where: { id, companyId }, // Security: Must match user's company
    select: CASE_SELECT
  });

  if (!singleCase) {
    return formatResponse(false, null, "Case not found or access denied", 404);
  }

  // Cache the result for 1 minute
  try {
    await cacheSet(cacheKey, singleCase, 60);
  } catch (e) {}

  return formatResponse(true, singleCase, null, 200);
};

// PUT: Update a case
const updateCase = async (req: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;
  const body = await req.json();

  // Filter body to prevent accidental overwriting of sensitive fields like companyId
  const { clientId, assignedToId, title, description, status, priority } = body;

    const cacheKey = `admin:case:${id}`;
  try {
    const updatedCase = await prisma.case.update({
      where: { id, companyId },
      data: {
        title,
        description,
        status,
        priority,
        ...(clientId && { client: { connect: { id: clientId } } }),
        ...(assignedToId && { assignedTo: { connect: { id: assignedToId } } }),
      },
      select: CASE_SELECT
    });

    // Invalidate cache for this specific case
    try { await cacheDel(cacheKey); } catch (e) {}

    return formatResponse(true, updatedCase, "Case updated successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Case not found or unauthorized", 404);
    }
    throw error;
  }
};

// DELETE: Remove a case
const deleteCase = async (_req: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  try {
    await prisma.case.delete({
      where: { id, companyId },
    });

      // Invalidate cache for this specific case
    try { await cacheDel(`admin:case:${id}`); } catch (e) {}
    
    return formatResponse(true, { id }, "Case deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Case not found or unauthorized", 404);
    }
    throw error;
  }
};

export const GET = withApiHandler(getCase, { requireAuth: true, requireRateLimit: true });
export const PUT = withApiHandler(updateCase, { requireAuth: true, requireRateLimit: true });
export const DELETE = withApiHandler(deleteCase, { requireAuth: true, requireRateLimit: true });
// import { NextResponse } from "next/server";


//   if (!singleCase) {
//     return NextResponse.json({ error: "Case not found" }, { status: 404 });
//   }

//   return NextResponse.json(singleCase, { status: 200 });
// };

// // PUT: Update a case
// const updateCase = async (req: Request,  context: { params: { id: string } , user?: any} ) => {
//   const body = await req.json();

//   const updatedCase = await prisma.case.update({
//     where: { id: context.params.id },
//     data: body,
//     include: {
//       client: { include: { user: true } },
//       assignedTo: true,
//     },
//   });

//   return NextResponse.json(updatedCase, { status: 200 });
// };

// // DELETE: Remove a case
// const deleteCase = async (_req: Request, context: { params: { id: string } , user?: any}) => {
//   await prisma.case.delete({
//     where: { id: context.params.id },
//   });

//   return NextResponse.json({ message: "Case deleted successfully" }, { status: 200 });
// };

// // ✅ Export App Router handlers with wrappers
// export const GET = withApiHandler(getCase, { requireAuth: true, requireRateLimit: true });
// export const PUT = withApiHandler(updateCase, { requireAuth: true, requireRateLimit: true });
// export const DELETE = withApiHandler(deleteCase, { requireAuth: true, requireRateLimit: true });
