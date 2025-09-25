// app/api/courses/[id]/route.ts
// This file handles API requests for:
// - GET /api/courses/[id]: Fetches a single course by its ID.
// - PUT /api/courses/[id]: Updates an existing course by its ID.
// - DELETE /api/courses/[id]: Deletes a course by its ID.

import { NextRequest, NextResponse } from 'next/server';

import prisma from "@/server/db/prismadb";  // Adjust path if your prisma.ts is elsewhere
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

/**
 * GET /api/courses/[id]
 * Fetches a single course by its ID.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params; // Get the course ID from the URL parameters

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        academicLevels: {
          include: {
            academicLevel: true, // Include details of associated academic levels
          },
        },
        CourseMaterial: true, // Include course materials
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

/**
 * PUT /api/courses/[id]
 * Updates an existing course by its ID.
 *
 * Request Body:
 * {
 * "title": "string" (optional),
 * "description": "string" (optional),
 * "imageUrl": "string" (optional),
 * "credits": number (optional),
 * "code": "string" (optional, must be unique if provided),
 * "academicLevelIds": ["string"] (array of academic level IDs, optional - replaces existing links)
 * // Other course fields can be updated as well
 * }
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;
    const body = await request.json();
    // Destructure academicLevelIds separately, as it requires special handling for many-to-many
    const { academicLevelIds, ...dataToUpdate } = body;

    // First, update the direct fields of the course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: dataToUpdate,
      // We don't include relations here yet, as they might be modified separately
    });

    // Handle academic level updates (many-to-many relationship with CourseAcademicLevel)
    if (academicLevelIds !== undefined) {
      // Get current academic levels linked to this course
      const existingAcademicLevels = await prisma.courseAcademicLevel.findMany({
        where: { courseId: id },
        select: { academicLevelId: true }, // Select only the IDs for comparison
      });

      const existingLevelIds = new Set(existingAcademicLevels.map(al => al.academicLevelId));
      const newLevelIds = new Set(academicLevelIds);

      // Determine which academic levels to remove (present in DB but not in new request)
      const levelsToRemove = Array.from(existingLevelIds).filter(
        (levelId) => !newLevelIds.has(levelId)
      );

      if (levelsToRemove.length > 0) {
        await prisma.courseAcademicLevel.deleteMany({
          where: {
            courseId: id,
            academicLevelId: {
              in: levelsToRemove,
            },
          },
        });
      }

      // Determine which academic levels to add (present in new request but not in DB)
      const levelsToAdd = Array.from(newLevelIds).filter(
        (levelId: any) => !existingLevelIds.has(levelId)
      );

      if (levelsToAdd.length > 0) {
        // To create new CourseAcademicLevel entries, we need the companyId of the course
        const courseCompany = await prisma.course.findUnique({
          where: { id },
          select: { companyId: true },
        });

        if (courseCompany?.companyId) {
          await prisma.courseAcademicLevel.createMany({
            data: levelsToAdd.map((levelId: any) => ({
              courseId: id,
              academicLevelId: levelId,
              companyId: courseCompany.companyId, // Link junction table to company
            })), // Prevents errors if a level somehow already exists due to race condition
          });
        } else {
          console.warn(`Company ID not found for course ${id}. Cannot link new academic levels to company.`);
        }
      }
    }

    // Re-fetch the course to return the most up-to-date data, including all relations
    const finalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        academicLevels: {
          include: {
            academicLevel: true,
          },
        },
        CourseMaterial: true,
      },
    });

    return NextResponse.json(finalCourse, { status: 200 });
  } catch (error: any) {
    console.error('Error updating course:', error);
    // Handle unique constraint violation for 'code'
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ error: 'Course with this code already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update course', details: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/courses/[id]
 * Deletes a course by its ID.
 *
 * Note: Prisma's `onDelete: Cascade` in your schema will automatically handle
 * deletion of related `CourseAcademicLevel` and `CourseMaterial` entries
 * if they are configured to cascade. If not, explicit deletions are needed
 * before deleting the main course.
 *
 * Based on your schema:
 * - `CourseAcademicLevel` has `onDelete: Cascade` for `courseId`.
 * - `CourseMaterial` has `onDelete: Cascade` for `courseId`.
 * So, explicit deletion of these related records before deleting the course
 * is technically not strictly necessary due to cascading, but included for clarity/robustness.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;

    // Explicitly delete related CourseAcademicLevel entries.
    // This is good practice even with cascade, or if cascade rules change.
    await prisma.courseAcademicLevel.deleteMany({
      where: { courseId: id },
    });

    // Explicitly delete related CourseMaterial entries.
    await prisma.courseMaterial.deleteMany({
      where: { courseId: id },
    });

    // Delete the course itself
    const deletedCourse = await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Course deleted successfully', course: deletedCourse }, { status: 200 });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
