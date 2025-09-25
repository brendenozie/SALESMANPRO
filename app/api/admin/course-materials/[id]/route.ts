import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define the CourseMaterialType enum for validation
enum CourseMaterialType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

// GET /api/course-materials/[id]
// Fetches a single CourseMaterial by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const courseMaterial = await prisma.courseMaterial.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true },
        },
        uploadedBy: {
          select: { id: true, user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!courseMaterial) {
      return NextResponse.json({ message: "Course material not found" }, { status: 404 });
    }

    // Transform response
    const responseData = {
      id: courseMaterial.id,
      courseId: courseMaterial.courseId,
      courseTitle: courseMaterial.course?.title || 'N/A',
      title: courseMaterial.title,
      description: courseMaterial.description,
      fileUrl: courseMaterial.fileUrl,
      linkUrl: courseMaterial.linkUrl,
      type: courseMaterial.type,
      uploadedById: courseMaterial.uploadedById,
      uploadedByName: courseMaterial.uploadedBy?.user?.name || 'N/A',
      uploadedByEmail: courseMaterial.uploadedBy?.user?.email || 'N/A',
      createdAt: courseMaterial.createdAt,
      updatedAt: courseMaterial.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching course material with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch course material", error: error.message }, { status: 500 });
  }
}

// PATCH /api/course-materials/[id]
// Updates an existing CourseMaterial by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const body = await request.json();
    const { title, description, fileUrl, linkUrl, type, uploadedById, courseId, ...rest } = body; // courseId is typically not changed

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for course material:", rest);
    }

    const existingMaterial = await prisma.courseMaterial.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json({ message: "Course material not found" }, { status: 404 });
    }

    // Validate type if provided
    if (type !== undefined && !Object.values(CourseMaterialType).includes(type)) {
      return NextResponse.json({ message: `Invalid material type: ${type}. Must be one of ${Object.values(CourseMaterialType).join(', ')}.` }, { status: 400 });
    }

    // Validate uploadedById if provided
    if (uploadedById !== undefined && uploadedById !== existingMaterial.uploadedById) {
      if (uploadedById !== null) { // Allow setting to null if your schema permits
        const existingEducator = await prisma.educator.findUnique({
          where: { id: uploadedById },
        });
        if (!existingEducator) {
          return NextResponse.json({ message: "Provided uploadedById does not correspond to an existing educator." }, { status: 400 });
        }
      }
    }

    // Validate fileUrl/linkUrl combination if either is provided
    if ((fileUrl !== undefined && fileUrl !== existingMaterial.fileUrl) || (linkUrl !== undefined && linkUrl !== existingMaterial.linkUrl)) {
      const newFileUrl = fileUrl !== undefined ? fileUrl : existingMaterial.fileUrl;
      const newLinkUrl = linkUrl !== undefined ? linkUrl : existingMaterial.linkUrl;
      if (newFileUrl && newLinkUrl) {
        return NextResponse.json({ message: "Cannot have both fileUrl and linkUrl. Choose one or neither." }, { status: 400 });
      }
    }

    const updatedCourseMaterial = await prisma.courseMaterial.update({
      where: { id },
      data: {
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
      id: updatedCourseMaterial.id,
      courseId: updatedCourseMaterial.courseId,
      courseTitle: updatedCourseMaterial.course?.title || 'N/A',
      title: updatedCourseMaterial.title,
      description: updatedCourseMaterial.description,
      fileUrl: updatedCourseMaterial.fileUrl,
      linkUrl: updatedCourseMaterial.linkUrl,
      type: updatedCourseMaterial.type,
      uploadedById: updatedCourseMaterial.uploadedById,
      uploadedByName: updatedCourseMaterial.uploadedBy?.user?.name || 'N/A',
      uploadedByEmail: updatedCourseMaterial.uploadedBy?.user?.email || 'N/A',
      createdAt: updatedCourseMaterial.createdAt,
      updatedAt: updatedCourseMaterial.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating course material with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to update course material", error: error.message }, { status: 500 });
  }
}

// DELETE /api/course-materials/[id]
// Deletes a CourseMaterial by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const existingMaterial = await prisma.courseMaterial.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json({ message: "Course material not found" }, { status: 404 });
    }

    const deletedCourseMaterial = await prisma.courseMaterial.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Course material deleted successfully", deletedId: deletedCourseMaterial.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting course material with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to delete course material", error: error.message }, { status: 500 });
  }
}
