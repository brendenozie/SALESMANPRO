// app/api/doctor/products-used/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      appointment: {
        doctorId: doctorId,
      },
    };

    if (startDateParam) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(endDateParam) };
    }

    // Fetch OrderItems associated with this doctor's appointments
    let orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            sellingPrice: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            user: { select: { name: true } }, // Patient
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate products used to show unique products and total quantity/revenue
    const productsUsed: { [key: string]: { id: string; name: string; category: string; totalQuantity: number; totalRevenue: number; lastUsedDate: string } } = {};

    orderItems.forEach(item => {
      if (item.product) {
        const productId = item.product.id;
        const revenue = item.quantity * item.price;
        const lastUsed = new Date(item.createdAt!).toISOString().split('T')[0];

        if (!productsUsed[productId]) {
          productsUsed[productId] = {
            id: productId,
            name: item.product.name,
            category: item.product.category || 'N/A',
            totalQuantity: 0,
            totalRevenue: 0,
            lastUsedDate: lastUsed,
          };
        }
        productsUsed[productId].totalQuantity += item.quantity;
        productsUsed[productId].totalRevenue += revenue;
        // Update lastUsedDate if more recent
        if (lastUsed > productsUsed[productId].lastUsedDate) {
          productsUsed[productId].lastUsedDate = lastUsed;
        }
      }
    });

    let formattedProducts = Object.values(productsUsed);

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      formattedProducts = formattedProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return NextResponse.json(formattedProducts);
  } catch (err: any) {
    console.error("GET /api/doctor/products-used error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
