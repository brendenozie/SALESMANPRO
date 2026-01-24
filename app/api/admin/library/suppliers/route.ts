import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Retrieve all suppliers for a school
 */
const getSuppliers = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const suppliers = await prisma.librarySupplier.findMany({
    where: { companyId },
    orderBy: { name: 'asc' }
  });

  return formatResponse(true, suppliers, "Suppliers retrieved", 200);
};

/**
 * POST: Onboard a new vendor
 */
const postSupplier = async (request: Request) => {
  const body = await request.json();
  const { name, category, contactEmail, companyId } = body;

  const supplier = await prisma.librarySupplier.create({
    data: {
      name,
      category,
      contactEmail,
      companyId,
      status: "Active",
      reliability: 100
    }
  });

  return formatResponse(true, supplier, "Supplier onboarded successfully", 201);
};

export const GET = withApiHandler(getSuppliers, { requireAuth: true });
export const POST = withApiHandler(postSupplier, { requireAuth: true });