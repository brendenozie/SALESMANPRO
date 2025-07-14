// app/api/admin/[adminSlug]/staff/[id]/route.ts
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

    const staffMember = await prisma.user.findUnique({
      where: {
        id: id,
        Company: { some: { id: company.id } }, // Ensure staff belongs to this company
        role: { in: ["ADMIN", "AGENT", "EDUCATOR", "HEADTEACHER"] } // Only staff roles
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        SalesAgentProfile: { select: { id: true, phoneNumber: true } },
        Educator: { select: { id: true, department: { select: { name: true } } } },
        HeadTeacher: { select: { id: true } },
      },
    });

    if (!staffMember) {
      return NextResponse.json({ message: "Staff member not found or not associated with this company" }, { status: 404 });
    }

    let department = 'N/A';
    if (staffMember.Educator && staffMember.Educator.length > 0 && staffMember.Educator[0].department) {
      department = staffMember.Educator[0].department.name;
    } else if (staffMember.role === 'ADMIN') {
      department = 'Administration';
    } else if (staffMember.role === 'AGENT') {
      department = 'Sales';
    } else if (staffMember.role === 'HEADTEACHER') {
      department = 'Academic Leadership';
    }

    const formattedStaff = {
      ...staffMember,
      department,
      imageUrl: staffMember.profilePicture || `https://placehold.co/100x100/D1FAE5/065F46?text=${staffMember.name ? staffMember.name[0] : 'U'}`,
    };

    return NextResponse.json(formattedStaff, { status: 200 });

  } catch (error) {
    console.error("Error fetching staff member details:", error);
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

  const { name, email, phone, address, profilePicture, role, departmentId, bio } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Ensure the user exists and is a staff member of this company
    const staffToUpdate = await prisma.user.findUnique({
        where: {
            id: id,
            Company: { some: { id: company.id } },
            role: { in: ["ADMIN", "AGENT", "EDUCATOR", "HEADTEACHER"] }
        },
        select: { id: true, role: true, SalesAgentProfile: { select: { id: true } }, Educator: { select: { id: true } }, HeadTeacher: { select: { id: true } } }
    });

    if (!staffToUpdate) {
        return NextResponse.json({ message: "Staff member not found or not associated with this company" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name,
        email,
        phone,
        address,
        profilePicture,
        role, // Allow role updates, but handle profile model changes carefully
        bio,
        updatedAt: new Date(),
      },
    });

    // Handle updates to specific staff profiles based on their role
    if (updatedUser.role === "AGENT" && staffToUpdate.SalesAgentProfile?.id) {
        await prisma.salesAgent.update({
            where: { id: staffToUpdate.SalesAgentProfile.id },
            data: {
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phone,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
            }
        });
    } else if (updatedUser.role === "EDUCATOR" && staffToUpdate.Educator?.id) {
        await prisma.educator.update({
            where: { id: staffToUpdate.Educator.id },
            data: {
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
                departmentId: departmentId,
            }
        });
    } else if (updatedUser.role === "HEADTEACHER" && staffToUpdate.HeadTeacher?.id) {
        await prisma.headTeacher.update({
            where: { id: staffToUpdate.HeadTeacher.id },
            data: {
                name: updatedUser.name,
                phone: updatedUser.phone,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
            }
        });
    }
    // If role changes, you might need to create/delete profile entries. This is complex.

    return NextResponse.json(
      { message: "Staff member updated successfully", staff: updatedUser },
      { status: 200 }
    );

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("Error updating staff member:", error);
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

    const staffToDelete = await prisma.user.findUnique({
        where: {
            id: id,
            Company: { some: { id: company.id } },
            role: { in: ["ADMIN", "AGENT", "EDUCATOR", "HEADTEACHER"] }
        },
        select: { id: true, role: true }
    });

    if (!staffToDelete) {
        return NextResponse.json({ message: "Staff member not found or not associated with this company" }, { status: 404 });
    }

    // Delete associated staff profiles first
    if (staffToDelete.role === "AGENT") {
        await prisma.salesAgent.deleteMany({ where: { userId: id } });
    } else if (staffToDelete.role === "EDUCATOR") {
        await prisma.educator.deleteMany({ where: { userId: id } });
    } else if (staffToDelete.role === "HEADTEACHER") {
        await prisma.headTeacher.deleteMany({ where: { userId: id } });
    }

    // Then delete the User record
    // Consider checking if user has other critical data (e.g., appointments, orders)
    // before hard deleting. A soft delete is generally safer.
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Staff member deleted successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting staff member:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
