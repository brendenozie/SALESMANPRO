import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET: Fetch a single case
const getCase = async (_req: Request, context: { params: { id: string } , user?: any} ) => {

  const singleCase = await prisma.case.findUnique({
    where: { id: context.params.id },
    include: {
      client: { include: { user: true } },
      assignedTo: true,
    },
  });

  if (!singleCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json(singleCase, { status: 200 });
};

// PUT: Update a case
const updateCase = async (req: Request,  context: { params: { id: string } , user?: any} ) => {
  const body = await req.json();

  const updatedCase = await prisma.case.update({
    where: { id: context.params.id },
    data: body,
    include: {
      client: { include: { user: true } },
      assignedTo: true,
    },
  });

  return NextResponse.json(updatedCase, { status: 200 });
};

// DELETE: Remove a case
const deleteCase = async (_req: Request, context: { params: { id: string } , user?: any}) => {
  await prisma.case.delete({
    where: { id: context.params.id },
  });

  return NextResponse.json({ message: "Case deleted successfully" }, { status: 200 });
};

// ✅ Export App Router handlers with wrappers
export const GET = withApiHandler(getCase, { requireAuth: true, requireRateLimit: true });
export const PUT = withApiHandler(updateCase, { requireAuth: true, requireRateLimit: true });
export const DELETE = withApiHandler(deleteCase, { requireAuth: true, requireRateLimit: true });
