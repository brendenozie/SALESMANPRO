import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  try {
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        inventoryItems: true,
        // commissionRate: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
