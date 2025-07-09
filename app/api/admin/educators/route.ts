import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to generate a unique 6-digit login code
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, '0'); // Ensure it's 6 digits, e.g., '001234'

    const existingEducator = await prisma.educator.findUnique({
      where: { loginCode: code },
    });

    if (!existingEducator) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/educators
// Fetches all educator profiles, including their associated User data, department,
// academic level assignments, and dynamically calculated counts.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause: any = {};
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const educators = await prisma.educator.findMany({
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
        Department: { // Include department details
          select: {
            id: true,
            name: true,
          },
        },
        academicLevelAssignments: { // Include the junction table for academic levels
          include: {
            academicLevel: { // Include the actual AcademicLevel details
              select: {
                id: true,
                name: true,
                sortOrder: true,
              },
            },
          },
        },
        _count: { // Include counts of related records for calculated fields
          select: {
            classesScheduled: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
            assignmentSubmission: true,
            examSubmission: true,
            Grade: true,
            CourseEducatorAssignment: true, // Count of courses assigned via junction
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc', // Order by educator's name
        },
      },
    });

    // Transform the data to include flattened relations and dynamically calculated fields
    const response = await Promise.all(educators.map(async (educator) => {
      // Dynamically calculate totalStudents for each educator
      // This requires querying CourseEnrollment or Student directly if a student is linked to an educator
      // For now, setting to 0 as there's no direct relation from Educator to Student for this count.
      // If a student is "assigned" to an educator, a new junction table or direct relation would be needed.
      const totalStudents = 0; // Placeholder: Implement actual calculation if relation exists

      // Dynamically calculate totalCoursesTaught for each educator
      // This counts courses where this educator is assigned via CourseEducatorAssignment
      const totalCoursesTaught = educator._count.CourseEducatorAssignment;

      // Extract and sort assigned academic levels
      const assignedAcademicLevels = educator.academicLevelAssignments
        .map(assignment => assignment.academicLevel)
        .filter(Boolean) // Remove any nulls if academicLevel somehow wasn't found
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0)) // Sort by sortOrder
        .map(level => ({ id: level!.id, name: level!.name })); // Just id and name

      return {
        id: educator.id,
        userId: educator.userId,
        loginCode: educator.loginCode,
        name: educator.user?.name,
        email: educator.user?.email,
        profilePicture: educator.profilePicture || educator.user?.image,
        phone: educator.phone,
        bio: educator.bio,
        address: educator.address,
        companyId: educator.companyId,
        departmentId: educator.departmentId,
        departmentName: educator.Department?.name || 'N/A',
        academicLevels: assignedAcademicLevels, // Array of assigned academic levels
        totalStudents: totalStudents, // Calculated
        totalCoursesTaught: totalCoursesTaught, // Calculated from CourseEducatorAssignment
        totalClassesScheduled: educator._count.classesScheduled,
        totalExamsCreated: educator._count.Exam,
        totalMaterialsUploaded: educator._count.CourseMaterial, // Renamed from totalCourseMaterials
        totalAttendanceRecords: educator._count.AttendanceRecord,
        totalDiscussionTopics: educator._count.createdDiscussionTopics,
        totalUploadedMaterials: educator._count.uploadedMaterials,
        totalAssignmentSubmissions: educator._count.assignmentSubmission,
        totalExamSubmissions: educator._count.examSubmission,
        totalGradesRecorded: educator._count.Grade,
        createdAt: educator.createdAt,
        updatedAt: educator.updatedAt,
      };
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching educators:", error);
    return NextResponse.json({ message: "Failed to fetch educators", error: error.message }, { status: 500 });
  }
}

// POST /api/educators
// Creates a new Educator profile, linking to an existing User or creating a new basic User.
// Handles academic level assignments.
export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, name, companyId, phone, bio, address, profilePicture, departmentId, academicLevelIds } = body;

    if (!email || !name || !companyId) {
      return NextResponse.json({ message: "Email, Name, and Company ID are required to create an educator." }, { status: 400 });
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
      const existingEducator = await prisma.educator.findUnique({
        where: { userId: user.id },
      });
      if (existingEducator) {
        return NextResponse.json({ message: "An educator profile already exists for this user." }, { status: 409 });
      }
    }

    // Validate departmentId if provided
    if (departmentId) {
      const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!existingDepartment) {
        return NextResponse.json({ message: "Provided departmentId does not exist." }, { status: 400 });
      }
    }

    // Validate academicLevelIds if provided
    if (academicLevelIds && academicLevelIds.length > 0) {
      const existingAcademicLevels = await prisma.academicLevel.findMany({
        where: {
          id: { in: academicLevelIds },
          companyId: companyId, // Ensure academic levels belong to the same company
        },
        select: { id: true },
      });
      if (existingAcademicLevels.length !== academicLevelIds.length) {
        const foundIds = new Set(existingAcademicLevels.map(al => al.id));
        const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
        return NextResponse.json({ message: `One or more provided academicLevelIds are invalid or do not belong to this company: ${notFoundIds.join(', ')}` }, { status: 400 });
      }
    }

    const loginCode = await generateUniqueLoginCode();

    // Use a transaction for atomicity
    const newEducator = await prisma.$transaction(async (tx) => {
      const educator = await tx.educator.create({
        data: {
          userId: user.id,
          loginCode,
          companyId,
          phone,
          bio,
          address,
          profilePicture,
          departmentId,
          // Removed totalStudents and totalCoursesTaught from here
        },
      });

      // Create EducatorAcademicLevelAssignment entries
      if (academicLevelIds && academicLevelIds.length > 0) {
        const assignmentsData = academicLevelIds.map((academicLevelId: string) => ({
          educatorId: educator.id,
          academicLevelId: academicLevelId,
          // roleInLevel: "Lead Educator", // Optional: set a default role or pass from frontend
        }));
        await tx.educatorAcademicLevelAssignment.createMany({
          data: assignmentsData,
        });
      }
      return educator;
    });

    // Fetch the newly created educator with all its relations for a complete response
    const createdEducatorWithRelations = await prisma.educator.findUnique({
      where: { id: newEducator.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        Department: { select: { id: true, name: true } },
        academicLevelAssignments: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: {
          select: {
            classesScheduled: true,
            Exam: true,
            CourseMaterial: true,
            AttendanceRecord: true,
            createdDiscussionTopics: true,
            uploadedMaterials: true,
            assignmentSubmission: true,
            examSubmission: true,
            Grade: true,
            CourseEducatorAssignment: true,
          },
        },
      },
    });

    if (!createdEducatorWithRelations) {
      throw new Error("Failed to retrieve created educator with relations.");
    }

    const assignedAcademicLevelsResponse = createdEducatorWithRelations.academicLevelAssignments
      .map(assignment => assignment.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(level => ({ id: level!.id, name: level!.name }));

    const responseData = {
      id: createdEducatorWithRelations.id,
      userId: createdEducatorWithRelations.userId,
      loginCode: createdEducatorWithRelations.loginCode,
      name: createdEducatorWithRelations.user?.name,
      email: createdEducatorWithRelations.user?.email,
      profilePicture: createdEducatorWithRelations.profilePicture || createdEducatorWithRelations.user?.image,
      phone: createdEducatorWithRelations.phone,
      bio: createdEducatorWithRelations.bio,
      address: createdEducatorWithRelations.address,
      companyId: createdEducatorWithRelations.companyId,
      departmentId: createdEducatorWithRelations.departmentId,
      departmentName: createdEducatorWithRelations.Department?.name || 'N/A',
      academicLevels: assignedAcademicLevelsResponse,
      totalStudents: 0, // Calculated
      totalCoursesTaught: 0, // Calculated
      totalClassesScheduled: createdEducatorWithRelations._count.classesScheduled,
      totalExamsCreated: createdEducatorWithRelations._count.Exam,
      totalMaterialsUploaded: createdEducatorWithRelations._count.CourseMaterial,
      totalAttendanceRecords: createdEducatorWithRelations._count.AttendanceRecord,
      totalDiscussionTopics: createdEducatorWithRelations._count.createdDiscussionTopics,
      totalUploadedMaterials: createdEducatorWithRelations._count.uploadedMaterials,
      totalAssignmentSubmissions: createdEducatorWithRelations._count.assignmentSubmission,
      totalExamSubmissions: createdEducatorWithRelations._count.examSubmission,
      totalGradesRecorded: createdEducatorWithRelations._count.Grade,
      createdAt: createdEducatorWithRelations.createdAt,
      updatedAt: createdEducatorWithRelations.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating educator:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
      return NextResponse.json({ message: "A teacher profile already exists for this user." }, { status: 409 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('loginCode')) {
      return NextResponse.json({ message: "Generated login code is not unique, please try again." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create educator", error: error.message }, { status: 500 });
  }
}
