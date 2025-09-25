// app/api/admin/[adminSlug]/staff/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


// Helper function to format staff data for the frontend
async function formatStaffData(staffMember: any) {
  const userName = staffMember.user?.name || 'N/A';
  const userEmail = staffMember.user?.email || 'N/A';
  const userPhone = staffMember.user?.phone || 'N/A';
  const userProfilePicture = staffMember.user?.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${userName ? userName.charAt(0) : '?'}${userName ? userName.charAt(1) : ''}`;

  return {
    id: staffMember.id, // StaffProfile model's ID
    userId: staffMember.userId, // Corresponding User ID
    name: userName,
    email: userEmail,
    phone: userPhone,
    profilePicture: userProfilePicture,
    jobTitle: staffMember.jobTitle || 'N/A',
    department: staffMember.department || 'N/A',
    employmentStatus: staffMember.employmentStatus,
    startDate: staffMember.startDate ? new Date(staffMember.startDate).toLocaleDateString() : 'N/A',
    createdAt: staffMember.createdAt ? new Date(staffMember.createdAt).toLocaleDateString() : 'N/A',
  };
}


// app/api/admin/staff/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific staff member by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    const staffMember = await prisma.staffProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    if (!staffMember) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const formattedStaff = await formatStaffData(staffMember);
    return NextResponse.json(formattedStaff);
  } catch (err: any) {
    console.error(`GET /api/admin/staff/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  const body = await request.json();
  const { name, email, phone, profilePicture, jobTitle, department, employmentStatus, startDate } = body;

  try {
    // Find the staff profile to get their associated userId
    const existingStaff = await prisma.staffProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingStaff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Update the associated User record
    if (existingStaff.userId) {
      await prisma.user.update({
        where: { id: existingStaff.userId },
        data: {
          name: name,
          email: email,
          phone: phone,
          profilePicture: profilePicture,
        },
      });
    }

    // Update the StaffProfile record
    const updatedStaff = await prisma.staffProfile.update({
      where: { id },
      data: {
        jobTitle: jobTitle,
        department: department,
        employmentStatus: employmentStatus,
        startDate: startDate ? new Date(startDate) : undefined,
        // phone and profilePicture are managed via the User model primarily,
        // but if you want to allow staff-specific overrides, keep them here.
        // phone: phone,
        // profilePicture: profilePicture,
      },
      include: {
        user: { select: { name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    const formattedUpdatedStaff = await formatStaffData(updatedStaff);

    return NextResponse.json(formattedUpdatedStaff);
  } catch (err: any) {
    console.error(`PUT /api/admin/staff/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    // Find the staff profile to get their associated userId
    const existingStaff = await prisma.staffProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingStaff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Delete the StaffProfile record
    await prisma.staffProfile.delete({
      where: { id },
    });

    // Optional: Consider logic to update the user's role or delete the user
    // if they are no longer associated with any other roles.
    // For now, we'll just delete the StaffProfile.

    return NextResponse.json({ message: "Staff member deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/staff/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
