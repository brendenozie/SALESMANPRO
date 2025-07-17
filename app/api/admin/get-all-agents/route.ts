import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 

export async function GET(req: NextRequest) {
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
