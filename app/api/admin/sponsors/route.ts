// app/api/sponsors/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

/**
 * @route GET /api/sponsors
 * @description Fetches all sponsors.
 * @returns {Response} A JSON response containing an array of sponsors.
 */
export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sponsors, { status: 200 });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

/**
 * @route POST /api/sponsors
 * @description Creates a new sponsor.
 * @returns {Response} A JSON response with the created sponsor.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactName, contactEmail, contactPhone, websiteUrl, logoUrl, status } = body;

    if (!companyName || !contactEmail || !websiteUrl) {
      return NextResponse.json({ error: 'Company Name, Contact Email, and Website URL are required' }, { status: 400 });
    }

    const newSponsor = await prisma.sponsor.create({
      data: {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        websiteUrl,
        logoUrl,
        status,
      },
    });

    return NextResponse.json(newSponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 });
  }
}
