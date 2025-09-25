// app/api/admin/[adminSlug]/programs/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path if your prisma client is elsewhere
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// IMPORTANT: Ensure your Course model in schema.prisma has these fields:
// model Course {
//   // ... other existing fields
//   price   Float? // Add this field
//   duration String? // Add this field
//   status  CourseStatus @default(DRAFT) // Add this enum and field
// }
//
// And define the CourseStatus enum:
// enum CourseStatus {
//   DRAFT
//   PUBLISHED
//   ARCHIVED
//   INACTIVE
//   ACTIVE
// }

// GET /api/admin/[adminSlug]/programs
// Fetches all programs/classes for a specific company.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  // const { id } = params; // Get the adminSlug from the dynamic route segment
// const { id } = request.query;
 const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("id") || "";
  try {
    // 1. Find the company ID based on the adminSlug
    const company = await prisma.company.findUnique({
      where: { id:companyId },
      select: { id: true }, // Only need the ID
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // 2. Fetch courses (programs) for this company
    const courses = await prisma.course.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        CourseEducatorAssignment: {
          include: {
            educator: {
              include: {
                user: {
                  select: {
                    name: true, // Select only the user's name
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });

    // 3. Map Prisma Course model to the frontend Program interface
    const programs = courses.map(course => {
      const instructorName = course.CourseEducatorAssignment.length > 0
        ? course.CourseEducatorAssignment[0].educator.user?.name || 'N/A'
        : 'N/A';

      // Ensure status is lowercase for frontend enum matching
      const status = course.status ? course.status.toLowerCase() : 'draft';

      return {
        id: course.id,
        name: course.title,
        description: course.description || '',
        status: status,
        type: 'class', // Hardcoded 'class' for now, as all are Courses
        instructor: instructorName,
        duration: course.duration || 'N/A',
        price: course.price || 0,
      };
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ message: 'Failed to fetch programs', error: "error.message" }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/programs
// Creates a new program/class for a specific company.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  // const { id } = params; // Get the adminSlug from the dynamic route segment
  
 const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("id") || "";

  try {
    const body = await request.json();
    const { name, description, instructorId, duration, price } = body;

    // 1. Find the company ID based on the adminSlug
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // 2. Basic validation for required fields
    if (!name || !description || !instructorId || !duration || price === undefined) {
      return NextResponse.json({ message: 'Missing required fields for new program.' }, { status: 400 });
    }

    // 3. Find the educator to link (ensure the educator exists)
    const educator = await prisma.educator.findUnique({
      where: { id: instructorId },
      select: { id: true, userId: true }, // Also get userId to fetch user name
    });

    if (!educator) {
      return NextResponse.json({ message: 'Instructor not found.' }, { status: 404 });
    }

    // 4. Create the new Course record
    const newCourse = await prisma.course.create({
      data: {
        title: name,
        description: description,
        duration: duration,
        price: parseFloat(price),
        company: {
          connect: { id: companyId }, // Link to the current company
        },
        credits: 0, // Default value, adjust as needed
        code: `COURSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // Generate a unique code
        status: 'DRAFT', // Default status for a new course, adjust if different
        CourseEducatorAssignment: {
          create: {
            educator: {
              connect: { id: educator.id },
            },
            company: {
              connect: { id: companyId },
            },
            roleInCourse: 'Lead Educator', // Default role for the assigned educator
          },
        },
      },
    });

    // 5. Fetch the instructor's name for the response (for immediate frontend update)
    const instructorUser = await prisma.user.findUnique({
      where: { id: educator.userId },
      select: { name: true },
    });

    // 6. Map the newly created course to the frontend Program interface
    const createdProgram = {
      id: newCourse.id,
      name: newCourse.title,
      description: newCourse.description || '',
      status: newCourse.status.toLowerCase(),
      type: 'class',
      instructor: instructorUser?.name || 'N/A',
      duration: newCourse.duration || 'N/A',
      price: newCourse.price || 0,
    };

    return NextResponse.json(createdProgram, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    // if (error.code === 'P2002') { // Prisma unique constraint violation
    //   return NextResponse.json({ message: 'A program with this code already exists.', error: error.message }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Failed to create program', error: "error.message" }, { status: 500 });
  }
}
