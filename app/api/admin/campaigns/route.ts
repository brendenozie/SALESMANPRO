import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust this path if 'lib/prisma' is still your source

// GET all campaigns
export async function GET(request: Request) {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        donations: true, // Include related donations
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // It's good practice to avoid exposing raw error messages in production
    // You might want a more generic message here or log the detailed error elsewhere
    return NextResponse.json(
      { message: 'Failed to fetch campaigns', error: 'error.message An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// POST a new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, goalAmount, currentAmount, status } = body;

    // Basic validation: Ensure required fields are present
    if (!name || !description || typeof goalAmount !== 'number' || goalAmount <= 0 || !status) {
      return NextResponse.json(
        { message: 'Missing required fields (name, description, goalAmount, status) or invalid data.' },
        { status: 400 }
      );
    }

    // Parse dates ensuring they are valid Date objects or null/undefined
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    // Optional: Add more robust date validation if necessary (e.g., endDate after startDate)
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return NextResponse.json(
        { message: 'End date cannot be before start date.' },
        { status: 400 }
      );
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        goalAmount,
        currentAmount: currentAmount || 0, // Ensure default to 0 if not provided
        status,
      },
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { message: 'Failed to create campaign', error: 'error.message || An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
