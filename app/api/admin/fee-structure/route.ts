import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/fee-structure
// Fetches all fee structures filtered by companyId
const getFeeStructuresLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch fee structures.", 400);
  }

  const feeStructures = await prisma.feeStructure.findMany({
    where: { companyId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, feeStructures, "Fee structures retrieved successfully", 200);
};

export const GET = withApiHandler(getFeeStructuresLogic, { requireAuth: true, requireRateLimit: true });

// POST /api/admin/fee-structure
// Creates a new fee structure
const postFeeStructureLogic = async (request: Request) => {
  const body = await request.json();
  const { name, year, term, amount, companyId, items } = body;

  if (!name || !year || !amount || !companyId) {
    return formatResponse(
      false,
      null,
      "Name, year, amount, and company ID are required.",
      400
    );
  }

  // Check for unique constraint (companyId, name, year, term)
  const existingStructure = await prisma.feeStructure.findFirst({
    where: {
      companyId,
      name,
      year,
      term: term || null,
    },
  });

  if (existingStructure) {
    return formatResponse(
      false,
      null,
      "A fee structure with this name, year, and term already exists for this company.",
      409
    );
  }

  const newFeeStructure = await prisma.feeStructure.create({
    data: {
      companyId,
      name,
      year,
      term: term || null,
      amount: parseFloat(amount),
      items: items
        ? {
            create: items.map((item: any) => ({
              name: item.name,
              amount: parseFloat(item.amount),
              isOptional: item.isOptional || false,
            })),
          }
        : undefined,
    },
    include: {
      items: true,
    },
  });

  return formatResponse(true, newFeeStructure, "Fee structure created successfully", 201);
};

export const POST = withApiHandler(postFeeStructureLogic, { requireAuth: true, requireRateLimit: true });
