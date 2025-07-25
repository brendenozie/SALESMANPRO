import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Ensure this path is correct based on your project structure

// GET all donations
export async function GET(request: Request) {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        donor: true, // Include donor (User) details
        project: true, // Include project details
        campaign: true, // Include campaign details
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });
    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch donations', error: "error.message" },
      { status: 500 }
    );
  }
}

// POST a new donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorId, amount, currency, paymentMethod, notes, status, projectId, campaignId, transactionId } = body;

    // Basic validation (you might want a more robust validation library like Zod)
    if (!donorId || typeof amount !== 'number' || amount <= 0 || !currency || !status) {
      return NextResponse.json({ message: 'Missing required fields or invalid data.' }, { status: 400 });
    }

    const newDonation = await prisma.donation.create({
      data: {
        donor: { connect: { id: donorId } },
        amount,
        currency,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        status,
        projectId: projectId || null, // Ensure `null` for optional relations if not provided
        campaignId: campaignId || null, // Ensure `null` for optional relations if not provided
        transactionId: transactionId || null,
      },
    });

    // Optionally update campaign's currentAmount if status is SUCCESS
    if (campaignId && status === 'SUCCESS') {
      try {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            currentAmount: {
              increment: amount,
            },
          },
        });
      } catch (campaignError) {
        console.warn(`Warning: Could not update campaign ${campaignId} currentAmount.`, campaignError);
        // Do not block donation creation if campaign update fails
      }
    }

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { message: 'Failed to create donation', error: "error.message" },
      { status: 500 }
    );
  }
}
