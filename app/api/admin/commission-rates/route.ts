import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
// Note: Removed unused imports: NextResponse, verifyAuth

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      companyId,
      productId,
      commissionType,
      rate,
      appliesTo,
      targetId,
      isActive,
    } = body;

    // Basic Validation
    if (!name || !companyId || !commissionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const rateData = {
      name,
      companyId,
      productId, // Note: Schema has @unique on productId
      commissionType, // COST or QUANTITY
      commissionRate: rate, // Mapping frontend 'rate' to schema 'commissionRate'
      rate: rate, // Mapping to the redundant schema 'rate' field
      appliesTo,
      targetId: targetId || null,
      isActive: isActive ?? true,
      startDate: new Date(),
    };

    let result;

    if (id) {
      // UPDATE existing rate
      result = await prisma.commissionRate.update({
        where: { id },
        data: rateData,
      });
    } else {
      // CREATE new rate
      // Check if a rate for this product already exists to avoid @unique violation
      if (productId) {
        const existing = await prisma.commissionRate.findUnique({
          where: { productId },
        });
        if (existing) {
          return NextResponse.json(
            { error: "A commission rate already exists for this product." },
            { status: 409 },
          );
        }
      }

      result = await prisma.commissionRate.create({
        data: rateData,
      });
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("CommissionRate API Error:", error);

    // Handle Prisma Unique Constraint Errors (P2002)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A rate with this name already exists for this company." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  try {
    const rates = await prisma.commissionRate.findMany({
      where: { companyId },
      include: {
        product: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: rates }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}