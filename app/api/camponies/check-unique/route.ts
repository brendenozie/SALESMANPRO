// File: app/api/companies/check-unique/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const domain = searchParams.get('domain');

  const where: any = {};
  if (slug) where.slug = slug;
  if (domain) where.domain = domain;

  if (!Object.keys(where).length) {
    return NextResponse.json({ error: 'Missing slug or domain' }, { status: 400 });
  }

  const existing = await prisma.company.findFirst({ where, select: { id: true } });

  return NextResponse.json({ isUnique: !existing });
}
