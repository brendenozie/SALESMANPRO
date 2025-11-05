import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: { companyId: id },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
