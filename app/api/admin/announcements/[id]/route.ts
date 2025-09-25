import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define valid Enum values (must match your Prisma enums)
const VALID_ANNOUNCEMENT_STATUSES = ["PENDING", "PUBLISHED", "ARCHIVED"];
const VALID_ANNOUNCEMENT_TYPES = ["GENERAL", "ACADEMIC", "EVENT", "HOLIDAY", "ALERT", "NEWS", "POLICY_UPDATE", "FEEDBACK", "SURVEY", "OTHER"];
const VALID_ANNOUNCEMENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];


// GET /api/announcements/[id]
// Fetches a single Announcement by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
             name: true, email: true 
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!announcement) {
      return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
    }

    // Transform response
    const responseData = {
      id: announcement.id,
      title: announcement.title,
      summary: announcement.summary,
      content: announcement.content,
      publishedAt: announcement.publishedAt.toISOString(),
      expiresAt: announcement.expiresAt?.toISOString() || null,
      authorId: announcement.authorId,
      authorName: announcement.author?.name || 'N/A',
      authorEmail: announcement.author?.email || 'N/A',
      companyId: announcement.companyId,
      companyName: announcement.company?.name || 'N/A',
      status: announcement.status,
      type: announcement.type,
      audience: announcement.audience,
      targetAcademicLevelIds: announcement.targetAcademicLevelIds,
      targetCourseIds: announcement.targetCourseIds,
      targetEducatorIds: announcement.targetEducatorIds,
      targetStudentIds: announcement.targetStudentIds,
      targetDepartmentIds: announcement.targetDepartmentIds,
      targetParentIds: announcement.targetParentIds,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching announcement with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch announcement", error: error.message }, { status: 500 });
  }
}

// PATCH /api/announcements/[id]
// Updates an existing Announcement by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    const body = await request.json();
    const {
      title,
      summary,
      content,
      publishedAt,
      expiresAt,
      authorId, // Typically not changed after creation
      status,
      type,
      audience,
      targetAcademicLevelIds,
      targetCourseIds,
      targetEducatorIds,
      targetStudentIds,
      targetDepartmentIds,
      targetParentIds,
      companyId, // companyId should not be changed after creation
      ...rest
    } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for announcement:", rest);
    }

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) updateData.content = content;

    // Validate and update status
    if (status !== undefined) {
      if (!VALID_ANNOUNCEMENT_STATUSES.includes(status)) {
        return NextResponse.json({ message: `Invalid status: ${status}. Must be one of ${VALID_ANNOUNCEMENT_STATUSES.join(', ')}.` }, { status: 400 });
      }
      updateData.status = status;
    }
    // Validate and update type
    if (type !== undefined) {
      if (!VALID_ANNOUNCEMENT_TYPES.includes(type)) {
        return NextResponse.json({ message: `Invalid type: ${type}. Must be one of ${VALID_ANNOUNCEMENT_TYPES.join(', ')}.` }, { status: 400 });
      }
      updateData.type = type;
    }
    // Validate and update audience
    if (audience !== undefined) {
      if (!VALID_ANNOUNCEMENT_AUDIENCES.includes(audience)) {
        return NextResponse.json({ message: `Invalid audience: ${audience}. Must be one of ${VALID_ANNOUNCEMENT_AUDIENCES.join(', ')}.` }, { status: 400 });
      }
      updateData.audience = audience;
    }

    // Parse and update date fields
    if (publishedAt !== undefined) {
      const parsedPublishedAt = new Date(publishedAt);
      if (isNaN(parsedPublishedAt.getTime())) {
        return NextResponse.json({ message: "Invalid publishedAt date format." }, { status: 400 });
      }
      updateData.publishedAt = parsedPublishedAt;
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null) { // Allow setting to null to remove expiry
        updateData.expiresAt = null;
      } else {
        const parsedExpiresAt = new Date(expiresAt);
        if (isNaN(parsedExpiresAt.getTime())) {
          return NextResponse.json({ message: "Invalid expiresAt date format." }, { status: 400 });
        }
        updateData.expiresAt = parsedExpiresAt;
      }
    }

    // Re-validate publish/expiry relationship if both are provided or one is updated
    const finalPublishedAt = updateData.publishedAt || existingAnnouncement.publishedAt;
    const finalExpiresAt = updateData.expiresAt || existingAnnouncement.expiresAt;

    if (finalPublishedAt && finalExpiresAt && finalExpiresAt <= finalPublishedAt) {
      return NextResponse.json({ message: "Expiry date must be after publish date." }, { status: 400 });
    }

    // Update target audience IDs (ensure they are arrays)
    if (targetAcademicLevelIds !== undefined) updateData.targetAcademicLevelIds = Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [];
    if (targetCourseIds !== undefined) updateData.targetCourseIds = Array.isArray(targetCourseIds) ? targetCourseIds : [];
    if (targetEducatorIds !== undefined) updateData.targetEducatorIds = Array.isArray(targetEducatorIds) ? targetEducatorIds : [];
    if (targetStudentIds !== undefined) updateData.targetStudentIds = Array.isArray(targetStudentIds) ? targetStudentIds : [];
    if (targetDepartmentIds !== undefined) updateData.targetDepartmentIds = Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [];
    if (targetParentIds !== undefined) updateData.targetParentIds = Array.isArray(targetParentIds) ? targetParentIds : [];


    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true  } },
        company: { select: { id: true, name: true } },
      },
    });

    // Transform response
    const responseData = {
      id: updatedAnnouncement.id,
      title: updatedAnnouncement.title,
      summary: updatedAnnouncement.summary,
      content: updatedAnnouncement.content,
      publishedAt: updatedAnnouncement.publishedAt.toISOString(),
      expiresAt: updatedAnnouncement.expiresAt?.toISOString() || null,
      authorId: updatedAnnouncement.authorId,
      authorName: updatedAnnouncement.author?.name || 'N/A',
      authorEmail: updatedAnnouncement.author?.email || 'N/A',
      companyId: updatedAnnouncement.companyId,
      companyName: updatedAnnouncement.company?.name || 'N/A',
      status: updatedAnnouncement.status,
      type: updatedAnnouncement.type,
      audience: updatedAnnouncement.audience,
      targetAcademicLevelIds: updatedAnnouncement.targetAcademicLevelIds,
      targetCourseIds: updatedAnnouncement.targetCourseIds,
      targetEducatorIds: updatedAnnouncement.targetEducatorIds,
      targetStudentIds: updatedAnnouncement.targetStudentIds,
      targetDepartmentIds: updatedAnnouncement.targetDepartmentIds,
      targetParentIds: updatedAnnouncement.targetParentIds,
      createdAt: updatedAnnouncement.createdAt.toISOString(),
      updatedAt: updatedAnnouncement.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating announcement with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: "Announcement not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update announcement", error: error.message }, { status: 500 });
  }
}

// DELETE /api/announcements/[id]
// Deletes an Announcement by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
    }

    const deletedAnnouncement = await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Announcement deleted successfully", deletedId: deletedAnnouncement.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting announcement with ID ${id}:`, error);
    if (error.code === 'P2003') { // Foreign key constraint failed
      return NextResponse.json({ message: "Cannot delete announcement: It has associated records that prevent deletion." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to delete announcement", error: error.message }, { status: 500 });
  }
}
