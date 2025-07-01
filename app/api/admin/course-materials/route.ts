import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define the CourseMaterialType enum for validation
enum CourseMaterialType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  OTHER = "OTHER", // Added 'OTHER' for flexibility
}

// GET /api/course-materials
// Fetches all course materials, optionally filtered by courseId.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const companyId = searchParams.get('companyId'); // Also allow filtering by company (indirectly via course)

    const whereClause: any = {};

    if (courseId) {
      whereClause.courseId = courseId;
    } else if (companyId) {
      // If filtering by company, we need to find courses belonging to that company first
      const coursesInCompany = await prisma.course.findMany({
        where: { companyId: companyId },
        select: { id: true },
      });
      const courseIdsInCompany = coursesInCompany.map(c => c.id);
      whereClause.courseId = { in: courseIdsInCompany };
    } else {
      // If no filters, return a bad request or all materials (depending on desired behavior)
      // For a multi-tenant app, it's safer to require companyId or courseId.
      return NextResponse.json({ message: "Either courseId or companyId is required to fetch course materials." }, { status: 400 });
    }


    const courseMaterials = await prisma.courseMaterial.findMany({
      where: whereClause,
      include: {
        course: {
          select: { id: true, title: true },
        },
        uploadedBy: {
          select: { id: true, user: { select: { name: true, email: true } } },
        },
      },
      orderBy: {
        createdAt: 'asc', // Order by creation date, or add a 'sortOrder' field to model
      },
    });

    // Transform the data to flatten relations
    const response = courseMaterials.map((material) => ({
      id: material.id,
      courseId: material.courseId,
      courseTitle: material.course?.title || 'N/A',
      title: material.title,
      description: material.description,
      fileUrl: material.fileUrl,
      linkUrl: material.linkUrl,
      type: material.type,
      uploadedById: material.uploadedById,
      uploadedByName: material.uploadedBy?.user?.name || 'N/A',
      uploadedByEmail: material.uploadedBy?.user?.email || 'N/A',
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching course materials:", error);
    return NextResponse.json({ message: "Failed to fetch course materials", error: error.message }, { status: 500 });
  }
}

// POST /api/course-materials
// Creates a new CourseMaterial entry.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, title, description, fileUrl, linkUrl, type, uploadedById } = body;

    // Basic validation
    if (!courseId || !title || !type || !uploadedById) {
      return NextResponse.json({ message: "Course ID, Title, Type, and Uploader ID are required to create course material." }, { status: 400 });
    }

    // Validate type against enum
    if (!Object.values(CourseMaterialType).includes(type)) {
      return NextResponse.json({ message: `Invalid material type: ${type}. Must be one of ${Object.values(CourseMaterialType).join(', ')}.` }, { status: 400 });
    }

    // Validate courseId exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!existingCourse) {
      return NextResponse.json({ message: "Provided courseId does not exist." }, { status: 400 });
    }

    // Validate uploadedById exists and is an Educator
    const existingEducator = await prisma.educator.findUnique({
      where: { id: uploadedById },
    });
    if (!existingEducator) {
      return NextResponse.json({ message: "Provided uploadedById does not correspond to an existing educator." }, { status: 400 });
    }

    // Ensure only one of fileUrl or linkUrl is provided, or neither
    if (fileUrl && linkUrl) {
      return NextResponse.json({ message: "Cannot provide both fileUrl and linkUrl. Choose one or neither." }, { status: 400 });
    }

    const newCourseMaterial = await prisma.courseMaterial.create({
      data: {
        courseId,
        title,
        description,
        fileUrl,
        linkUrl,
        type,
        uploadedById,
      },
      include: {
        course: { select: { id: true, title: true } },
        uploadedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
      },
    });

    // Transform response
    const responseData = {
      id: newCourseMaterial.id,
      courseId: newCourseMaterial.courseId,
      courseTitle: newCourseMaterial.course?.title || 'N/A',
      title: newCourseMaterial.title,
      description: newCourseMaterial.description,
      fileUrl: newCourseMaterial.fileUrl,
      linkUrl: newCourseMaterial.linkUrl,
      type: newCourseMaterial.type,
      uploadedById: newCourseMaterial.uploadedById,
      uploadedByName: newCourseMaterial.uploadedBy?.user?.name || 'N/A',
      uploadedByEmail: newCourseMaterial.uploadedBy?.user?.email || 'N/A',
      createdAt: newCourseMaterial.createdAt,
      updatedAt: newCourseMaterial.updatedAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course material:", error);
    return NextResponse.json({ message: "Failed to create course material", error: error.message }, { status: 500 });
  }
}
