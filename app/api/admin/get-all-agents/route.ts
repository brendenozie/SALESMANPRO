import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

export async function GET(req: NextRequest) {

     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const companyId = req.nextUrl.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  try {
    const agents = await prisma.salesAgent.findMany({
      where: { companyId },
      select: { id: true, name: true }
    });
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
