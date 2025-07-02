import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid Enum values (must match your Prisma enums)
const VALID_ANNOUNCEMENT_STATUSES = ["PENDING", "PUBLISHED", "ARCHIVED"];
const VALID_ANNOUNCEMENT_TYPES = ["GENERAL", "ACADEMIC", "EVENT", "HOLIDAY", "ALERT", "NEWS", "POLICY_UPDATE", "FEEDBACK", "SURVEY", "OTHER"];
const VALID_ANNOUNCEMENT_AUDIENCES = ["ALL", "ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT", "STAFF", "PARENT"];

// GET /api/announcements
// Fetches announcements, filtered by companyId (required) and various optional criteria.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status'); // Filter by AnnouncementStatus
    const type = searchParams.get('type');     // Filter by AnnouncementType
    const audience = searchParams.get('audience'); // Filter by AnnouncementAudience
    const authorId = searchParams.get('authorId'); // Filter by author
    const publishedAfter = searchParams.get('publishedAfter'); // ISO date string
    const publishedBefore = searchParams.get('publishedBefore'); // ISO date string
    const expiresAfter = searchParams.get('expiresAfter'); // ISO date string (e.g., for active announcements)
    const expiresBefore = searchParams.get('expiresBefore'); // ISO date string

    const whereClause: any = {};

    if (!companyId) {
      return NextResponse.json({ message: "Company ID is required to fetch announcements." }, { status: 400 });
    }
    whereClause.companyId = companyId;

    if (status) {
      if (!VALID_ANNOUNCEMENT_STATUSES.includes(status.toUpperCase())) {
        return NextResponse.json({ message: `Invalid announcement status: ${status}. Must be one of ${VALID_ANNOUNCEMENT_STATUSES.join(', ')}.` }, { status: 400 });
      }
      whereClause.status = status.toUpperCase();
    }
    if (type) {
      if (!VALID_ANNOUNCEMENT_TYPES.includes(type.toUpperCase())) {
        return NextResponse.json({ message: `Invalid announcement type: ${type}. Must be one of ${VALID_ANNOUNCEMENT_TYPES.join(', ')}.` }, { status: 400 });
      }
      whereClause.type = type.toUpperCase();
    }
    if (audience) {
      if (!VALID_ANNOUNCEMENT_AUDIENCES.includes(audience.toUpperCase())) {
        return NextResponse.json({ message: `Invalid announcement audience: ${audience}. Must be one of ${VALID_ANNOUNCEMENT_AUDIENCES.join(', ')}.` }, { status: 400 });
      }
      whereClause.audience = audience.toUpperCase();
    }
    if (authorId) {
      whereClause.authorId = authorId;
    }

    // Date range filtering for publishedAt
    if (publishedAfter || publishedBefore) {
      whereClause.publishedAt = {};
      if (publishedAfter) {
        const date = new Date(publishedAfter);
        if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid publishedAfter date format." }, { status: 400 });
        whereClause.publishedAt.gte = date;
      }
      if (publishedBefore) {
        const date = new Date(publishedBefore);
        if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid publishedBefore date format." }, { status: 400 });
        whereClause.publishedAt.lte = date;
      }
    }

    // Date range filtering for expiresAt
    if (expiresAfter || expiresBefore) {
      whereClause.expiresAt = {};
      if (expiresAfter) {
        const date = new Date(expiresAfter);
        if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid expiresAfter date format." }, { status: 400 });
        whereClause.expiresAt.gte = date;
      }
      if (expiresBefore) {
        const date = new Date(expiresBefore);
        if (isNaN(date.getTime())) return NextResponse.json({ message: "Invalid expiresBefore date format." }, { status: 400 });
        whereClause.expiresAt.lte = date;
      }
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        author: { // Include author details
          select: {
            id: true,
             name: true,
              email: true 
          },
        },
        company: { // Include company details (optional, but good for context)
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc', // Order by most recent publication date
      },
    });

    // Transform the data to flatten relations and ensure correct types
    const response = announcements.map((announcement) => ({
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
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ message: "Failed to fetch announcements", error: error.message }, { status: 500 });
  }
}

// POST /api/announcements
// Creates a new Announcement.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      title,
      summary,
      content,
      publishedAt, // ISO date string
      expiresAt,   // ISO date string (optional)
      authorId,
      status,      // AnnouncementStatus enum string
      type,        // AnnouncementType enum string
      audience,    // AnnouncementAudience enum string
      targetAcademicLevelIds = [],
      targetCourseIds = [],
      targetEducatorIds = [],
      targetStudentIds = [],
      targetDepartmentIds = [],
      targetParentIds = [],
    } = body;

    // Basic validation
    if (!companyId || !title || !publishedAt || !authorId || !status || !type || !audience) {
      return NextResponse.json({ message: "Company ID, Title, Published At, Author ID, Status, Type, and Audience are required to create an announcement." }, { status: 400 });
    }

    // Validate Enums
    if (!VALID_ANNOUNCEMENT_STATUSES.includes(status)) {
      return NextResponse.json({ message: `Invalid status: ${status}. Must be one of ${VALID_ANNOUNCEMENT_STATUSES.join(', ')}.` }, { status: 400 });
    }
    if (!VALID_ANNOUNCEMENT_TYPES.includes(type)) {
      return NextResponse.json({ message: `Invalid type: ${type}. Must be one of ${VALID_ANNOUNCEMENT_TYPES.join(', ')}.` }, { status: 400 });
    }
    if (!VALID_ANNOUNCEMENT_AUDIENCES.includes(audience)) {
      return NextResponse.json({ message: `Invalid audience: ${audience}. Must be one of ${VALID_ANNOUNCEMENT_AUDIENCES.join(', ')}.` }, { status: 400 });
    }

    // Validate authorId exists
    const existingAuthor = await prisma.user.findUnique({
      where: { id: authorId },
    });
    if (!existingAuthor) {
      return NextResponse.json({ message: "Provided authorId does not exist." }, { status: 400 });
    }

    // Validate companyId exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!existingCompany) {
      return NextResponse.json({ message: "Provided companyId does not exist." }, { status: 400 });
    }

    // Parse date fields
    const parsedPublishedAt = new Date(publishedAt);
    if (isNaN(parsedPublishedAt.getTime())) {
      return NextResponse.json({ message: "Invalid publishedAt date format." }, { status: 400 });
    }

    let parsedExpiresAt: Date | undefined = undefined;
    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);
      if (isNaN(parsedExpiresAt.getTime())) {
        return NextResponse.json({ message: "Invalid expiresAt date format." }, { status: 400 });
      }
      if (parsedExpiresAt <= parsedPublishedAt) {
        return NextResponse.json({ message: "Expiry date must be after publish date." }, { status: 400 });
      }
    }

    // Ensure audience-specific target IDs are arrays
    const data: any = {
      companyId,
      title,
      summary,
      content,
      publishedAt: parsedPublishedAt,
      expiresAt: parsedExpiresAt,
      authorId,
      status,
      type,
      audience,
      targetAcademicLevelIds: Array.isArray(targetAcademicLevelIds) ? targetAcademicLevelIds : [],
      targetCourseIds: Array.isArray(targetCourseIds) ? targetCourseIds : [],
      targetEducatorIds: Array.isArray(targetEducatorIds) ? targetEducatorIds : [],
      targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
      targetDepartmentIds: Array.isArray(targetDepartmentIds) ? targetDepartmentIds : [],
      targetParentIds: Array.isArray(targetParentIds) ? targetParentIds : [],
    };

    const newAnnouncement = await prisma.announcement.create({
      data,
      include: {
        author: { select: { id: true, name: true, email: true  } },
        company: { select: { id: true, name: true } },
      },
    });

    // Transform response
    const responseData = {
      id: newAnnouncement.id,
      title: newAnnouncement.title,
      summary: newAnnouncement.summary,
      content: newAnnouncement.content,
      publishedAt: newAnnouncement.publishedAt.toISOString(),
      expiresAt: newAnnouncement.expiresAt?.toISOString() || null,
      authorId: newAnnouncement.authorId,
      authorName: newAnnouncement.author?.name || 'N/A',
      authorEmail: newAnnouncement.author?.email || 'N/A',
      companyId: newAnnouncement.companyId,
      companyName: newAnnouncement.company?.name || 'N/A',
      status: newAnnouncement.status,
      type: newAnnouncement.type,
      audience: newAnnouncement.audience,
      targetAcademicLevelIds: newAnnouncement.targetAcademicLevelIds,
      targetCourseIds: newAnnouncement.targetCourseIds,
      targetEducatorIds: newAnnouncement.targetEducatorIds,
      targetStudentIds: newAnnouncement.targetStudentIds,
      targetDepartmentIds: newAnnouncement.targetDepartmentIds,
      targetParentIds: newAnnouncement.targetParentIds,
      createdAt: newAnnouncement.createdAt.toISOString(),
      updatedAt: newAnnouncement.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ message: "Failed to create announcement", error: error.message }, { status: 500 });
  }
}
