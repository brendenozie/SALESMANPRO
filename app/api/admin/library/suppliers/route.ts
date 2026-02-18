import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import bcrypt from "bcryptjs";


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



const postSupplier = async (request: Request) => {
  const body = await request.json();
  const { name, categoryId, contactEmail, companyId, phone } = body;

  if (!name || !categoryId || !contactEmail || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  // Prevent duplicate user
  const existingUser = await prisma.user.findUnique({
    where: { email: contactEmail },
  });

  if (existingUser) {
    return formatResponse(false, null, "User with this email already exists", 409);
  }

  // Auto password
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(tempPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create User
    const user = await tx.user.create({
      data: {
        name,
        email: contactEmail,
        password: hashed,
        role: "SUPPLIER",
        companyId,
        isActive: true,
      },
    });

    // 2. Create Supplier Profile
    const supplier = await tx.librarySupplier.create({
      data: {
        name,
        categoryId,
        contactEmail,
        phone,
        companyId,
        userId: user.id,
        status: "Active",
        reliability: 100,
        leadTime: "7 Days",
      },
      include: { user: true },
    });

    return { supplier, tempPassword };
  });

  return formatResponse(true, result, "Supplier onboarded with login access", 201);
};


export const GET = withApiHandler(getSuppliers, { requireAuth: true });
export const POST = withApiHandler(postSupplier, { requireAuth: true });