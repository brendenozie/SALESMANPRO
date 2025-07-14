// app/api/admin/[adminSlug]/doctors/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const doctor = await prisma.educator.findUnique({
      where: {
        id: id,
        companyId: company.id, // Ensure doctor belongs to this company
      },
      select: {
        id: true,
        name: true,
        phone: true,
        profilePicture: true,
        bio: true,
        email: true, // Assuming email is directly on Educator or through user relation
        department: { select: { name: true } },
        user: { select: { email: true } }, // Fetch user email if not direct on Educator
        createdAt: true,
        updatedAt: true,
        // If you add a 'status' field to Educator, select it here
      },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found or not associated with this company" }, { status: 404 });
    }

    const formattedDoctor = {
      ...doctor,
      specialty: doctor.department?.name || 'General Practice', // Mocking specialty
      contact: doctor.phone || doctor.user?.email || 'N/A',
      status: 'Active', // Mocking status, replace with actual field if added
      imageUrl: doctor.profilePicture || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
    };

    return NextResponse.json(formattedDoctor, { status: 200 });

  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { name, email, phone, specialty, imageUrl, bio, status, departmentId } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const doctorToUpdate = await prisma.educator.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true, userId: true }
    });

    if (!doctorToUpdate) {
        return NextResponse.json({ message: "Doctor not found or not associated with this company" }, { status: 404 });
    }

    // Update the User record first (for common fields like name, email, phone, image)
    if (doctorToUpdate.userId) {
        await prisma.user.update({
            where: { id: doctorToUpdate.userId },
            data: {
                name,
                email,
                phone,
                profilePicture: imageUrl,
                updatedAt: new Date(),
            }
        });
    }


    const updatedDoctor = await prisma.educator.update({
      where: { id: id },
      data: {
        name,
        email, // Assuming email is directly on Educator
        phone,
        profilePicture: imageUrl,
        bio,
        departmentId,
        // If you add a 'status' field to Educator, update it here
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Doctor updated successfully", doctor: updatedDoctor },
      { status: 200 }
    );

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const doctorToDelete = await prisma.educator.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true, userId: true }
    });

    if (!doctorToDelete) {
        return NextResponse.json({ message: "Doctor not found or not associated with this company" }, { status: 404 });
    }

    // Delete related Educator profile first
    await prisma.educator.delete({
      where: { id: id },
    });

    // Optionally delete the associated User if they have no other roles/data
    if (doctorToDelete.userId) {
        const otherEducatorProfiles = await prisma.educator.count({ where: { userId: doctorToDelete.userId, NOT: { id: id } } });
        const otherUserRelations = await prisma.user.findUnique({
            where: { id: doctorToDelete.userId },
            select: {
                Client: { count: true },
                Consumer: { count: true },
                Student: { count: true },
                Parent: { count: true },
                // Add other relations that would prevent user deletion
            }
        });

        const hasOtherProfiles = otherEducatorProfiles > 0 ||
                                 (otherUserRelations?.Client?.count || 0) > 0 ||
                                 (otherUserRelations?.Consumer?.count || 0) > 0 ||
                                 (otherUserRelations?.Student?.count || 0) > 0 ||
                                 (otherUserRelations?.Parent?.count || 0) > 0;

        if (!hasOtherProfiles) {
            await prisma.user.delete({ where: { id: doctorToDelete.userId } });
        }
    }


    return NextResponse.json({ message: "Doctor deleted successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
