// app/api/admin/[adminSlug]/pos/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const categoryFilter = searchParams.get("category");
  const searchKeyword = searchParams.get("search");

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      companyId: company.id,
      // Only show active/available listings
      status: "ACTIVE",
      isAvailable: true,
    };

    if (categoryFilter && categoryFilter !== 'All') {
      whereClause.category = categoryFilter; // Assuming 'category' field on marketplaceListings
    }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.marketplaceListings.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        category: true, // Assuming category is denormalized or can be selected
        quantity: true, // Current stock quantity
      },
      orderBy: { name: 'asc' },
    });

    // For POS, we might need to know exact stock from InventoryItem
    // This is a simplified approach, a real POS would check InventoryItem quantity
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.sellingPrice,
      category: product.category || 'Uncategorized', // Fallback if category is null
      stock: product.quantity, // Using marketplaceListing's quantity as stock for simplicity
    }));

    return NextResponse.json(formattedProducts, { status: 200 });

  } catch (error) {
    console.error("Error fetching POS products:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
