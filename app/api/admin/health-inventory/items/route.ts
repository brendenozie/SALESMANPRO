// app/api/admin/[adminSlug]/inventory/items/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const filterCategory = searchParams.get("category");
  const lowStockFilter = searchParams.get("lowStock"); // 'true' or 'false'
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "quantity", "lastUpdated"]; // Assuming 'name' is product.name
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

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
    };

    if (filterCategory && filterCategory !== 'All') {
      whereClause.product = {
        productCategory: {
          name: filterCategory // Filter by product category name
        }
      };
    }

    if (lowStockFilter === 'true') {
      whereClause.quantity = {
        lte: prisma.inventoryItem.fields.reorderThreshold // Filter where quantity is less than or equal to reorderThreshold
      };
    }

    if (searchKeyword) {
      whereClause.product = {
        OR: [
          { name: { contains: searchKeyword, mode: 'insensitive' } },
          { description: { contains: searchKeyword, mode: 'insensitive' } },
        ]
      };
    }

    const [inventoryItems, totalItems] = await prisma.$transaction([
      prisma.inventoryItem.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder }, // Sort by product name or quantity
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          quantity: true,
          reorderThreshold: true,
          updatedAt: true, // Use updatedAt as lastUpdated
          product: {
            select: {
              name: true,
              productCategory: { select: { name: true } }
            }
          }
        },
      }),
      prisma.inventoryItem.count({ where: whereClause }),
    ]);

    const formattedInventory = inventoryItems.map(item => ({
      id: item.id,
      name: item.product?.name || 'N/A Product',
      category: item.product?.productCategory?.name || 'Uncategorized',
      stock: item.quantity,
      minStock: item.reorderThreshold || 0,
      lastUpdated: new Date(item.updatedAt || '').toISOString().split('T')[0],
    }));

    return NextResponse.json({
      inventory: formattedInventory,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { productId, quantity, reorderThreshold } = body;

  if (!productId || quantity === undefined) {
    return NextResponse.json({ message: "Missing required fields: productId, quantity" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Verify product exists and belongs to the company
    const product = await prisma.product.findUnique({
      where: { id: productId, companyId: company.id },
      select: { id: true, name: true }
    });
    if (!product) {
      return NextResponse.json({ message: "Product not found or not associated with this company" }, { status: 404 });
    }

    // Check if an InventoryItem for this product already exists for the company
    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: { productId: product.id, companyId: company.id },
    });

    if (inventoryItem) {
      // If exists, update quantity
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: { increment: parseInt(quantity) },
          reorderThreshold: reorderThreshold !== undefined ? parseInt(reorderThreshold) : inventoryItem.reorderThreshold,
          updatedAt: new Date(),
        },
      });
      // Create an inventory log for the restock
      await prisma.inventoryLog.create({
        data: {
          inventoryId: inventoryItem.id,
          action: "RESTOCK",
          quantity: parseInt(quantity),
          // Add userId if you have an admin user context
        }
      });

    } else {
      // If not, create new InventoryItem
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          companyId: company.id,
          quantity: parseInt(quantity),
          reorderThreshold: reorderThreshold !== undefined ? parseInt(reorderThreshold) : 0,
        },
      });
      // Create an initial inventory log
      await prisma.inventoryLog.create({
        data: {
          inventoryId: inventoryItem.id,
          action: "INITIAL_ADD",
          quantity: parseInt(quantity),
        }
      });
    }


    return NextResponse.json(
      { message: "Inventory item added/updated successfully", item: inventoryItem },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding/updating inventory item:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}