// app/api/donors/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET all Donor profiles
export async function GET(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const donors = await prisma.donor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            // Include other user fields if necessary, but keep it minimal
          },
        },
        company: true, // Include company details if linked
        Donation: {
          select: {
            id: true,
            amount: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });
    return NextResponse.json(donors, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching donor profiles:', error);
    return NextResponse.json(
      { message: 'Failed to fetch donor profiles', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new Donor profile
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body = await request.json();
    const { userId, phoneNumber, companyId } = body;

    // Basic validation
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required to create a donor profile.' }, { status: 400 });
    }

    // Check if a donor profile already exists for this user
    const existingDonor = await prisma.donor.findUnique({
      where: { userId },
    });
    if (existingDonor) {
      return NextResponse.json({ message: 'A donor profile already exists for this user.' }, { status: 409 }); // Conflict
    }

    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Create the new Donor profile
    const newDonor = await prisma.donor.create({
      data: {
        user: { connect: { id: userId } },
        phoneNumber: phoneNumber || null,
        company: companyId ? { connect: { id: companyId } } : undefined,
      },
      include: { user: true, company: true }, // Include relations in the response
    });

    return NextResponse.json(newDonor, { status: 201 });
  } catch (error: any) {
    console.error('Error creating donor profile:', error);
    if (error.code === 'P2025') { // Prisma error for record not found (e.g., if user or company ID is invalid)
      return NextResponse.json({ message: 'Referenced user or company not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to create donor profile', error: error.message },
      { status: 500 }
    );
  }
}