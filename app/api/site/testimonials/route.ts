import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

async function GETHandler(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { companyId: id },
      // orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export const GET = withApiHandler(GETHandler, { requireAuth: false });