// app/api/admin/fees/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- GET all cases
const getCases = async (_req: Request, context: { user?: any }) => {
  const cases = await prisma.case.findMany({
    include: {
      client: {
        include: { user: true },
      },
      assignedTo: true,
    },
  });

  return NextResponse.json(cases, { status: 200 });
};

// --- POST new case
const createCase = async (req: Request, context: { user?: any }) => {
  const body = await req.json();
  const {
    title,
    description,
    clientId,
    assignedToUserId,
    caseType,
    status,
    companyId,
  } = body;

  const newCase = await prisma.case.create({
    data: {
      title,
      description,
      clientId,
      assignedToUserId,
      caseType,
      status,
      companyId,
    },
    include: {
      client: {
        include: { user: true },
      },
      assignedTo: true,
    },
  });

  return NextResponse.json(newCase, { status: 201 });
};

// ✅ Export wrapped handlers
export const GET = withApiHandler(getCases, {
  requireAuth: true,
  requireRateLimit: true,
});

export const POST = withApiHandler(createCase, {
  requireAuth: true,
  requireRateLimit: true,
});
