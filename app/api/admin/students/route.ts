import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { EnrollmentStatus } from "@prisma/client";

// Helper function to generate a unique 6-digit login code (admission number)
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, '0');

    const existingStudent = await prisma.student.findUnique({
      where: { loginCode: code },
    });

    if (!existingStudent) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/students
// Fetches all student profiles, including their associated User data, calculated counts,
// and linked academic level(s) via the StudentAcademicLevel junction.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
        parent: {
          select: {
            id: true,
            phone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        // Include StudentAcademicLevel to get academic level details
        StudentAcademicLevel: {
          include: {
            academicLevel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrolledCourses: true,
            assignmentSubmission: true,
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Transform the data to include calculated counts and flattened user/parent/academic level info
    const response = students.map((student) => {
      // Extract academic levels from the junction table
      const academicLevels = student.StudentAcademicLevel.map(sal => ({
        id: sal.academicLevel.id,
        name: sal.academicLevel.name,
      }));

      return {
        id: student.id,
        userId: student.userId,
        loginCode: student.loginCode,
        name: student.user?.name,
        email: student.user?.email,
        profilePicture: student.profilePicture || student.user?.image,
        phone: student.phone,
        bio: student.bio,
        address: student.address,
        companyId: student.companyId,
        parentId: student.parentId,
        parentName: student.parent?.user.name,
        parentEmail: student.parent?.user.email,
        parentPhone: student.parent?.phone,
        academicLevels: academicLevels,
        // Calculated fields are derived or set to 0/0.0 as they are no longer stored directly
        totalCourses: student._count.enrolledCourses,
        completedCourses: 0, // This would need a more complex aggregation on CourseEnrollment
        certificatesEarned: 0, // This would need a separate Certificate model or aggregation
        averageProgress: 0.0, // This would need aggregation on CourseEnrollment
        totalAssignmentSubmissions: student._count.assignmentSubmission,
        totalAttendanceRecords: student._count.AttendanceRecord,
        totalExamSubmissions: student._count.ExamSubmission,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ message: "Failed to fetch students", error: error.message }, { status: 500 });
  }
}

// POST /api/students
// Creates a new Student profile, linking to an existing User and optionally an existing Parent.
// It also creates an initial StudentAcademicLevel entry and enrolls the student in relevant courses.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, parentId, academicLevelId } = body;

    if (!email || !name) {
      return NextResponse.json({ message: "Email and Name are required to create a student." }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: profilePicture,
        },
      });
    } else {
      const existingStudent = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (existingStudent) {
        return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
      }
    }

    if (parentId) {
      const existingParent = await prisma.parent.findUnique({
        where: { id: parentId },
      });
      if (!existingParent) {
        return NextResponse.json({ message: "Provided parentId does not exist." }, { status: 400 });
      }
    }

    // Validate academicLevelId if provided, as it will be used to create a StudentAcademicLevel entry
    let existingAcademicLevel = null;
    if (academicLevelId) {
      existingAcademicLevel = await prisma.academicLevel.findUnique({
        where: { id: academicLevelId },
      });
      if (!existingAcademicLevel) {
        return NextResponse.json({ message: "Provided academicLevelId does not exist." }, { status: 400 });
      }
    }

    const loginCode = await generateUniqueLoginCode();

    const newStudent = await prisma.student.create({
      data: {
        userId: user.id,
        loginCode,
        companyId,
        parentId,
        phone,
        bio,
        address,
        profilePicture,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        parent: {
          select: {
            id: true,
            phone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    let createdStudentAcademicLevel = null;
    if (academicLevelId && existingAcademicLevel) {
      createdStudentAcademicLevel = await prisma.studentAcademicLevel.create({
        data: {
          studentId: newStudent.id,
          academicLevelId: academicLevelId,
        },
        include: {
          academicLevel: {
            select: { id: true, name: true },
          },
        },
      });

      // NEW LOGIC: Auto-enroll student into courses for the joined academic level
      try {
        const coursesInAcademicLevel = await prisma.courseAcademicLevel.findMany({
          where: {
            academicLevelId: academicLevelId,
          },
          select: {
            courseId: true,
          },
        });

        if (coursesInAcademicLevel.length > 0) {

          const enrollmentData = coursesInAcademicLevel.map((cal) => ({
            studentId: newStudent.id,
            courseId: cal.courseId,
            status: EnrollmentStatus.ENROLLED, // Default status
          }));

          await prisma.courseEnrollment.createMany({
            data: enrollmentData,
          });
          console.log(`Student ${newStudent.id} auto-enrolled in ${enrollmentData.length} courses.`);
        } else {
          console.log(`No courses found for academic level ${academicLevelId} to auto-enroll student ${newStudent.id}.`);
        }
        
      } catch (enrollmentError: any) {
        console.error(`Error during auto-enrollment for student ${newStudent.id}:`, enrollmentError);
        // Decide how to handle this error:
        // 1. Rollback student creation (requires Prisma transactions, more complex)
        // 2. Log and continue (student created, but enrollment failed - might need manual fix)
        // For now, it logs and continues, ensuring student creation isn't blocked by enrollment issues.
      }
    }

    const responseData = {
      id: newStudent.id,
      userId: newStudent.userId,
      loginCode: newStudent.loginCode,
      name: newStudent.user?.name,
      email: newStudent.user?.email,
      profilePicture: newStudent.profilePicture || newStudent.user?.image,
      phone: newStudent.phone,
      bio: newStudent.bio,
      address: newStudent.address,
      companyId: newStudent.companyId,
      parentId: newStudent.parentId,
      parentName: newStudent.parent?.user.name,
      parentEmail: newStudent.parent?.user.email,
      parentPhone: newStudent.parent?.phone,
      academicLevels: createdStudentAcademicLevel ? [{
        id: createdStudentAcademicLevel.academicLevel.id,
        name: createdStudentAcademicLevel.academicLevel.name
      }] : [],
      // Calculated fields are initialized to 0 or 0.0
      totalCourses: 0, // This will be updated by a subsequent GET request's _count
      completedCourses: 0,
      certificatesEarned: 0,
      averageProgress: 0.0,
      totalAssignmentSubmissions: 0,
      totalAttendanceRecords: 0,
      totalExamSubmissions: 0,
      createdAt: newStudent.createdAt,
      updatedAt: newStudent.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A student profile already exists for this user." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create student", error: error.message }, { status: 500 });
  }
}
