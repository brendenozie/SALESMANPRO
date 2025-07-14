// app/api/admin/[adminSlug]/events/[eventId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; eventId: string } }
) {
  const { adminSlug, eventId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId, companyId: company.id },
      // Select all fields relevant for detailed view
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; eventId: string } }
) {
  const { adminSlug, eventId } = params;
  const body = await request.json();

  // Extract fields to update. Only include fields that are allowed to be updated.
  const {
    title, summary, description, startDateTime, endDateTime,
    location, onlineMeetingLink, imageUrl, videoUrl, eventType,
    eventStatus, isRegistrationRequired, maxCapacity,
    isPaid, price, contactPerson, contactEmail, contactPhone, audience,
    targetAcademicLevelIds, targetCourseIds, targetEducatorIds,
    targetStudentIds, targetDepartmentIds, targetParentIds
  } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId, companyId: company.id },
      data: {
        title,
        summary,
        description,
        startDateTime: startDateTime ? new Date(startDateTime) : undefined,
        endDateTime: endDateTime ? new Date(endDateTime) : undefined,
        location,
        onlineMeetingLink,
        imageUrl,
        videoUrl,
        eventType,
        eventStatus,
        isRegistrationRequired,
        maxCapacity,
        isPaid,
        price,
        contactPerson,
        contactEmail,
        contactPhone,
        audience,
        targetAcademicLevelIds,
        targetCourseIds,
        targetEducatorIds,
        targetStudentIds,
        targetDepartmentIds,
        targetParentIds,
      },
    });

    return NextResponse.json(
      { message: "Event updated successfully", event: updatedEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; eventId: string } }
) {
  const { adminSlug, eventId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Perform the delete operation
    await prisma.event.delete({
      where: { id: eventId, companyId: company.id },
    });

    return new NextResponse(null, { status: 204 }); // No content on successful deletion
  } catch (error) {
    console.error("Error deleting event:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}