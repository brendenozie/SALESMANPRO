import { NextResponse } from "next/server";
import prisma from "../../../../../server/db/prismadb";

// GET /api/best-selling-products?agentId=&limit=&offset=&startDate=&endDate=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { error: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  if (startDateParam) {
    const d = new Date(startDateParam);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid startDate format." }, { status: 400 });
    }
    startDate = d;
  }
  if (endDateParam) {
    const d = new Date(endDateParam);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid endDate format." }, { status: 400 });
    }
    endDate = d;
  }

  try {
    // Aggregate total sold per product
    const sales = await prisma.order.groupBy({
      by: ["productId"],
      where: {
        ...(agentId && { salesAgentId: agentId }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
      skip: offset,
    });

    const productIds = sales.map((s) => s.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const result = sales.map((s) => {
      const p = products.find((prod) => prod.id === s.productId)!;
      return {
        id: p.id,
        name: p.name,
        totalSold: s._sum.quantity || 0,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching best-selling products:", error);
    return NextResponse.json(
      { error: "Failed to fetch best-selling products", detail: error.message },
      { status: 500 }
    );
  }
}
