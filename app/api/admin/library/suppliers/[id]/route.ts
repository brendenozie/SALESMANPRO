import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const getSupplierById = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const { id } = params;

  if (!companyId || !id) {
    return NextResponse.json(
      { success: false, message: "Missing parameters" },
      { status: 400 }
    );
  }

  const supplier = await prisma.librarySupplier.findFirst({
    where: {
      id,
      companyId,
    },
    // include: {
    //   suppliedBooks: true, // optional if relation exists
    //   _count: {
    //     select: { suppliedBooks: true },
    //   },
    // },
  });

  if (!supplier) {
    return NextResponse.json(
      { success: false, message: "Supplier not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: supplier });
};

export const GET = withApiHandler(getSupplierById, { requireAuth: true });
