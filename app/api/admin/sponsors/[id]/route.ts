// app/api/sponsors/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

/**
 * @route GET /api/sponsors/:id
 * @description Fetches a single sponsor by ID.
 * @returns {Response} A JSON response containing the sponsor.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json(sponsor, { status: 200 });
  } catch (error) {
    console.error(`Error fetching sponsor with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch sponsor' }, { status: 500 });
  }
}

/**
 * @route PUT /api/sponsors/:id
 * @description Updates an existing sponsor.
 * @returns {Response} A JSON response with the updated sponsor.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { companyName, contactName, contactEmail, contactPhone, websiteUrl, logoUrl, status } = body;

    const updatedSponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        websiteUrl,
        logoUrl,
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSponsor, { status: 200 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    // }
    console.error(`Error updating sponsor with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 });
  }
}

/**
 * @route DELETE /api/sponsors/:id
 * @description Deletes a sponsor.
 * @returns {Response} A 204 No Content response.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.sponsor.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    // }
    console.error(`Error deleting sponsor with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 });
  }
}
