import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { EnrollmentStatus, StudentLevelStatus, ROLE } from "@prisma/client"; // Import StudentLevelStatus and ROLE

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

// GET /api/admin/students
// Fetches all student profiles, including their associated User data, calculated counts,
// and linked academic level(s) via the StudentAcademicLevel junction, and their specific StudentLevelStatus.
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
            role: true, // Include the general user role
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
        StudentAcademicLevel: {
          include: {
            academicLevel: {
              select: {
                id: true,
                name: true,
                sortOrder: true,
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

    const response = students.map((student) => {
      const academicLevels = student.StudentAcademicLevel.map(sal => ({
        id: sal.academicLevel.id,
        name: sal.academicLevel.name,
        sortOrder: sal.academicLevel.sortOrder || 0,
      })).sort((a, b) => a.sortOrder - b.sortOrder);

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
        firstName: student.firstName, 
        lastName: student.lastName, 
        admissionNumber:  student.admissionNumber,
        parentId: student.parentId,
        parentName: student.parent?.user.name,
        parentEmail: student.parent?.user.email,
        parentPhone: student.parent?.phone,
        academicLevels: academicLevels,
        userRole: student.user?.role, // Include the general user role
        levelStatus: student.levelStatus, // NEW: Include the specific student level status (Junior/Senior)
        totalCourses: student._count.enrolledCourses,
        completedCourses: 0,
        certificatesEarned: 0,
        averageProgress: 0.0,
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


// POST /api/admin/students
// Creates a new Student profile, linking to an existing User and optionally an existing Parent.
// It also creates an initial StudentAcademicLevel entry and enrolls the student in relevant courses.
// Now includes setting the student's specific level status (Junior/Senior).

// POST /api/admin/students
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, companyId, phone,firstName, lastName, admissionNumber, bio, address, profilePicture, parentId, academicLevelId, levelStatus } = body;

    if (!email || !name || !companyId) {
      return NextResponse.json({ message: "Email, Name, and Company ID are required to create a student." }, { status: 400 });
    }

    if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
      return NextResponse.json({ message: "Invalid levelStatus provided." }, { status: 400 });
    }

    let role = levelStatus.toString().toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name,
            image: profilePicture,
            role: role || ROLE.STUDENT,
          },
        });
      } else {
        const existingStudent = await tx.student.findUnique({
          where: { userId: user.id },
        });
        if (existingStudent) {
          throw new Error("A student profile already exists for this user.");
        }

        if (user.role !== ROLE.STUDENT) {
            user = await tx.user.update({
                where: { id: user.id },
                data: { role: role || ROLE.STUDENT }
            });
        }
      }

      // Validate parent existence if parentId is provided
      if (parentId) {
        const existingParent = await tx.parent.findUnique({
          where: { id: parentId },
        });
        if (!existingParent) {
          throw new Error("Provided parentId does not exist.");
        }
      }

      let existingAcademicLevel = null;
      if (academicLevelId) {
        existingAcademicLevel = await tx.academicLevel.findUnique({
          where: { id: academicLevelId },
        });
        if (!existingAcademicLevel) {
          throw new Error("Provided academicLevelId does not exist.");
        }
      }

      const loginCode = await generateUniqueLoginCode();

      // IMPORTANT: Include parent and user in the create operation if you need their data immediately
      const newStudent = await tx.student.create({
        data: {
          userId: user.id,
          loginCode,
          companyId,
          parentId,
          firstName, lastName, admissionNumber,
          phone,
          bio,
          address,
          profilePicture,
          levelStatus: levelStatus || null,
        },
        include: { 
          user: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          parent: {
            select: {
              id: true,
              phone: true,
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
          StudentAcademicLevel: {
            include: {
              academicLevel: true, // No need for specific select here, as it's included below.
            },
          },
        },
      });

      let createdStudentAcademicLevel = null;
      if (academicLevelId && existingAcademicLevel) {
        createdStudentAcademicLevel = await tx.studentAcademicLevel.create({
          data: {
            studentId: newStudent.id,
            academicLevelId: academicLevelId,
          },
          include: {
            academicLevel: {
              select: { id: true, name: true, sortOrder: true },
            },
          },
        });

        // Auto-enrollment logic remains the same
        try {
          const coursesInAcademicLevel = await tx.courseAcademicLevel.findMany({
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
              status: EnrollmentStatus.ENROLLED,
            }));

            await tx.courseEnrollment.createMany({
              data: enrollmentData,
            });
            console.log(`Student ${newStudent.id} auto-enrolled in ${enrollmentData.length} courses.`);
          } else {
            console.log(`No courses found for academic level ${academicLevelId} to auto-enroll student ${newStudent.id}.`);
          }
        } catch (enrollmentError: any) {
          console.error(`Error during auto-enrollment for student ${newStudent.id}:`, enrollmentError);
        }
      }

      // Re-fetch the student with all necessary includes if the initial create/update didn't fetch them all.
      // In this case, we added include to `newStudent` directly, so this might be redundant.
      // However, it ensures consistency if subsequent operations within the transaction add related data.
      const finalStudent = await tx.student.findUnique({
        where: { id: newStudent.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          parent: {
            select: {
              id: true,
              phone: true,
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
          StudentAcademicLevel: {
            include: {
              academicLevel: {
                select: { id: true, name: true, sortOrder: true },
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
      });

      return finalStudent; // Return the fully included student
    });

    const studentResponse = result; // Renamed for clarity

    if (!studentResponse) {
      throw new Error("Student Response does not exist.");
    }

    const academicLevels = studentResponse.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
      sortOrder: sal.academicLevel.sortOrder || 0,
    })).sort((a, b) => a.sortOrder - b.sortOrder);


    const responseData = {
      id: studentResponse.id,
      userId: studentResponse.userId,
      loginCode: studentResponse.loginCode,
      name: studentResponse.user?.name,
      email: studentResponse.user?.email,
      profilePicture: studentResponse.profilePicture || studentResponse.user?.image,
      phone: studentResponse.phone,
      bio: studentResponse.bio,
      address: studentResponse.address,
      companyId: studentResponse.companyId,
      parentId: studentResponse.parentId,
      firstName, 
      lastName, 
      admissionNumber,
      parentName: studentResponse.parent?.user.name,
      parentEmail: studentResponse.parent?.user.email,
      parentPhone: studentResponse.parent?.phone,
      academicLevels: academicLevels,
      userRole: studentResponse.user?.role,
      levelStatus: studentResponse.levelStatus,
      totalCourses: studentResponse._count.enrolledCourses,
      completedCourses: 0,
      certificatesEarned: 0,
      averageProgress: 0.0,
      totalAssignmentSubmissions: 0,
      totalAttendanceRecords: 0,
      totalExamSubmissions: 0,
      createdAt: studentResponse.createdAt,
      updatedAt: studentResponse.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    let statusCode = 500;
    let errorMessage = "Failed to create student";

    if (error.message.includes("A student profile already exists for this user.")) {
      statusCode = 409;
      errorMessage = error.message;
    } else if (error.message.includes("Provided parentId does not exist.")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("Provided academicLevelId does not exist.")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("Invalid levelStatus provided.")) {
        statusCode = 400;
        errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage, error: error.message }, { status: statusCode });
  }
}

