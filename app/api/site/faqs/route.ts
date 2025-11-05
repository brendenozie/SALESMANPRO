import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const faqs = await prisma.fAQ.findMany({
      where: { companyId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ data: faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
