// app/api/courses/route.ts
// This file handles API requests for:
// - GET /api/courses: Fetches all courses, with optional filtering by companyId and academicLevelId.
// - POST /api/courses: Creates a new course.

import { NextRequest, NextResponse } from 'next/server';

import prisma from "@/server/db/prismadb";  // Adjust path if your prisma.ts is elsewhere

/**
 * GET /api/courses
 * Fetches all courses.
 *
 * Query Parameters:
 * - companyId (optional): Filters courses by a specific company.
 * - academicLevelId (optional): Filters courses by a specific academic level (e.g., 'playgroup').
 *
 * Example Usage:
 * - Fetch all courses: GET /api/courses
 * - Fetch courses for a specific company: GET /api/courses?companyId=your_company_id
 * - Fetch playgroup courses: GET /api/courses?academicLevelId=playgroup_level_id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const academicLevelId = searchParams.get('academicLevelId');

    let courses;

    if (academicLevelId) {
      // If academicLevelId is provided, find courses linked to that specific academic level
      const courseAcademicLevels = await prisma.courseAcademicLevel.findMany({
        where: {
          academicLevelId: academicLevelId,
          // Optionally filter by companyId if both are provided
          ...(companyId && { companyId: companyId }),
        },
        include: {
          // Include the actual course details
          course: {
            include: {
              // Include the academic levels linked to the course
              academicLevels: {
                include: {
                  academicLevel: true, // Include details of the academic level
                },
              },
              // Include course materials associated with the course
              CourseMaterial: true,
            },
          },
        },
      });
      // Extract the course objects from the junction table results
      courses = courseAcademicLevels.map(cal => cal.course);
    } else {
      // If no academicLevelId, fetch all courses, optionally filtered by companyId
      courses = await prisma.course.findMany({
        where: {
          ...(companyId && { companyId: companyId }),
        },
        include: {
          academicLevels: {
            include: {
              academicLevel: true,
            },
          },
          CourseMaterial: true,
        },
      });
    }

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

/**
 * POST /api/courses
 * Creates a new course.
 *
 * Request Body:
 * {
 * "title": "string",
 * "description": "string" (optional),
 * "imageUrl": "string" (optional),
 * "credits": number (optional),
 * "code": "string" (unique),
 * "companyId": "string" (required),
 * "academicLevelIds": ["string"] (array of academic level IDs, optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, credits, code, companyId, academicLevelIds } = body;

    // Validate required fields
    if (!title || !companyId || !code) {
      return NextResponse.json({ error: 'Missing required fields: title, code, companyId' }, { status: 400 });
    }

    // Create the new course
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        credits,
        code,
        // Connect the course to an existing company
        company: { connect: { id: companyId } },
        // Create entries in the CourseAcademicLevel junction table
        // for each academicLevelId provided in the request
        academicLevels: {
          create: academicLevelIds?.map((levelId: string) => ({
            academicLevel: { connect: { id: levelId } },
            // Also link the junction table entry to the company
            company: { connect: { id: companyId } },
          })) || [], // If no academicLevelIds, create an empty array
        },
      },
      include: {
        academicLevels: {
          include: {
            academicLevel: true, // Include details of the connected academic levels
          },
        },
        CourseMaterial: true, // Include any associated course materials
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    // Handle unique constraint violation for 'code'
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ error: 'Course with this code already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create course', details: error.message }, { status: 500 });
  }
}
