import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET /api/subjects
// Fetches all subjects with aggregated counts of courses offered under them.
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const subjects = await prisma.subjects.findMany({
      include: {
        _count: {
          select: {
            courses: true, // Count of courses under this subject
          },
        },
      },
      orderBy: {
        name: 'asc', // Order subjects alphabetically by name
      },
    });

    // Transform the data to include counts directly in the main object
    const response = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      type: subject.type, // Assuming 'type' is a string field like 'Core', 'Elective'
      coursesCount: subject._count.courses,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ message: "Failed to fetch subjects", error: error.message }, { status: 500 });
  }
}

// POST /api/subjects
// Creates a new subject.
export async function POST(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { name, description, type } = body;

    // Basic validation (add more robust validation as needed)
    if (!name) {
      return NextResponse.json({ message: "Subject name is required." }, { status: 400 });
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        description,
        type, // 'Core', 'Elective', 'Other' etc.
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    // Handle unique constraint error for subject name
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ message: "A subject with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create subject", error: error.message }, { status: 500 });
  }
}
