import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const categories = await prisma.storeCategory.findMany({
    where: { companyId },
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true },
  });

  return NextResponse.json(categories);
}
