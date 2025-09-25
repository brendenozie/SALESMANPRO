import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export async function GET(req: NextRequest) {

     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
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
