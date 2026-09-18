import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const search = searchParams.get("search");

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    const where: any = { companyId: targetCompanyId };
    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { contactPerson: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { category: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchaseOrders: true, bills: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return formatResponse(true, suppliers, "Suppliers fetched successfully", 200);
  } catch (error: any) {
    console.error("Fetch suppliers error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch suppliers", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      slug,
      name,
      contactPerson,
      email,
      phone,
      address,
      taxPin,
      category = "General",
      paymentTerms = "Net 30",
      notes,
    } = body;

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }
    if (!name?.trim()) {
      return formatResponse(false, null, "Supplier name is required", 400);
    }

    const supplier = await prisma.supplier.create({
      data: {
        companyId: targetCompanyId,
        name: name.trim(),
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxPin: taxPin || null,
        category: category || "General",
        paymentTerms: paymentTerms || "Net 30",
        notes: notes || null,
        status: "ACTIVE",
        rating: 5.0,
      },
    });

    return formatResponse(true, supplier, "Supplier created successfully", 201);
  } catch (error: any) {
    console.error("Create supplier error:", error);
    return formatResponse(false, null, error?.message || "Failed to create supplier", 500);
  }
}
