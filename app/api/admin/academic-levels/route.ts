import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/academic-levels
// Fetches all AcademicLevel entries for a given company.
export async function GET(request: Request) {
  try {
    
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch academic levels." }, { status: 400 });
    }

    const academicLevels = await prisma.academicLevel.findMany({
      where: { companyId },
      orderBy: {
        sortOrder: 'asc', // Order by the custom sortOrder
      },
    });

    return NextResponse.json(academicLevels, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching academic levels:", error);
    return NextResponse.json({ message: "Failed to fetch academic levels", error: error.message }, { status: 500 });
  }
}

// POST /api/academic-levels
// Creates a new AcademicLevel entry.
export async function POST(request: Request) {
  try {

    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const body = await request.json();
    const { name, description, sortOrder, companyId } = body;

    // Basic validation
    if (!name || !companyId) {
      return NextResponse.json({ message: "Name and Company ID are required to create an academic level." }, { status: 400 });
    }

    // Check for uniqueness within the company
    const existingAcademicLevel = await prisma.academicLevel.findUnique({
      where: {
        companyId_name: { // Use the @@unique compound index
          companyId: companyId,
          name: name,
        },
      },
    });

    if (existingAcademicLevel) {
      return NextResponse.json({ message: `An academic level named '${name}' already exists for this company.` }, { status: 409 });
    }

    const newAcademicLevel = await prisma.academicLevel.create({
      data: {
        name,
        description,
        sortOrder: sortOrder !== undefined ? sortOrder : 0, // Default to 0 if not provided
        companyId,
      },
    });

    return NextResponse.json(newAcademicLevel, { status: 201 });
  } catch (error: any) {
    console.error("Error creating academic level:", error);
    if (error.code === 'P2002') { // Prisma unique constraint violation
      return NextResponse.json({ message: "An academic level with this name already exists for this company." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create academic level", error: error.message }, { status: 500 });
  }
}
