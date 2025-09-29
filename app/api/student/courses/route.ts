ts
// app/api/courses/route.ts
// Handles API requests for Courses:
// - GET /api/courses: Fetches all courses for the authenticated student.
// - POST /api/courses: Creates a new course.

import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --------------------
// GET /api/courses
// --------------------
const getCourses = async (request: NextRequest) => {
  const session = await getAuthSession();

  if (
    !session ||
    !["STUDENT", "JUNIOR", "SENIOR"].includes(
      session.user?.role?.toUpperCase() ?? ""
    )
  ) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  // Fetch the student and their academic level
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      companyId: true,
      user: { select: { name: true, email: true } },
      StudentAcademicLevel: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          academicLevel: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!student) {
    return formatResponse(
      false,
      null,
      "Student not found or not associated with this company",
      404
    );
  }

  const academicLevelId =
    student.StudentAcademicLevel[0]?.academicLevel?.id ?? null;

  let courses = [];
  if (academicLevelId) {
    const courseAcademicLevels = await prisma.courseAcademicLevel.findMany({
      where: { academicLevelId },
      include: {
        course: {
          include: {
            academicLevels: { include: { academicLevel: true } },
            CourseMaterial: true,
          },
        },
      },
    });

    courses = courseAcademicLevels.map((cal) => cal.course);
  }

  return formatResponse(true, courses, "Courses fetched successfully");
};

// --------------------
// POST /api/courses
// --------------------
const createCourse = async (request: NextRequest) => {
  const body = await request.json();
  const { title, description, imageUrl, credits, code, companyId, academicLevelIds } = body;

  if (!title || !companyId || !code) {
    return formatResponse(
      false,
      null,
      "Missing required fields: title, code, companyId",
      400
    );
  }

  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        credits,
        code,
        company: { connect: { id: companyId } },
        academicLevels: {
          create:
            academicLevelIds?.map((levelId: string) => ({
              academicLevel: { connect: { id: levelId } },
              company: { connect: { id: companyId } },
            })) || [],
        },
      },
      include: {
        academicLevels: { include: { academicLevel: true } },
        CourseMaterial: true,
      },
    });

    return formatResponse(true, newCourse, "Course created successfully", 201);
  } catch (error: any) {
    console.error("Error creating course:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("code")) {
      return formatResponse(false, null, "Course with this code already exists.", 409);
    }

    return formatResponse(false, null, "Failed to create course", 500, error.message);
  }
};

// --------------------
// Exported handlers
// --------------------
export const GET = withApiHandler(getCourses);
export const POST = withApiHandler(createCourse);

