import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

/**
 * GET /api/admin/suppliers?companyId=...
 * Fetch all active suppliers for a company with linked product count
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ success: false, error: "companyId is required" }, { status: 400 });
    }

    // Resolve company
    const company = await prisma.company.findFirst({
      where: { OR: [{ id: companyId }, { slug: companyId }] },
      select: { id: true },
    });

    const targetCompanyId = company?.id || companyId;

    const suppliers = await (prisma as any).supplier.findMany({
      where: {
        companyId: targetCompanyId,
        isActive: true,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: suppliers.map((s: any) => ({
        id: s.id,
        name: s.name,
        contactName: s.contactName,
        email: s.email,
        phone: s.phone,
        address: s.address,
        notes: s.notes,
        productCount: s._count?.products || 0,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("[SUPPLIERS_GET_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/suppliers
 * Create or update a supplier
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, companyId, name, contactName, email, phone, address, notes } = body;

    if (!companyId || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "companyId and supplier name are required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst({
      where: { OR: [{ id: companyId }, { slug: companyId }] },
      select: { id: true },
    });

    const targetCompanyId = company?.id || companyId;

    if (id) {
      // Update existing supplier
      const updated = await (prisma as any).supplier.update({
        where: { id },
        data: {
          name: name.trim(),
          contactName: contactName?.trim() || null,
          contactPerson: contactName?.trim() || null,
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          notes: notes?.trim() || null,
          status: "ACTIVE",
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Supplier updated successfully",
        data: updated,
      });
    }

    // Create new supplier
    const created = await (prisma as any).supplier.create({
      data: {
        company: { connect: { id: targetCompanyId } },
        name: name.trim(),
        contactName: contactName?.trim() || null,
        contactPerson: contactName?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        status: "ACTIVE",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier created successfully",
      data: created,
    });
  } catch (err: any) {
    console.error("[SUPPLIERS_POST_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/suppliers?id=...&companyId=...
 * Soft delete supplier
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    await (prisma as any).supplier.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier removed successfully",
    });
  } catch (err: any) {
    console.error("[SUPPLIERS_DELETE_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
