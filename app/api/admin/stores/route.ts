// app/api/admin/staff/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization
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

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'ACTIVE', 'ON_LEAVE', 'TERMINATED', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      companyId: companyId,
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.employmentStatus = filterStatus;
    }

    let staffMembers = await prisma.staffProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Client-side filtering for search term across name, email, phone, jobTitle, and department
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      staffMembers = staffMembers.filter(member =>
        member.user?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.user?.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.user?.phone?.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.jobTitle?.toLowerCase().includes(lowerCaseSearchTerm) ||
        member.department?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const enrichedStaff = await Promise.all(
      staffMembers.map(async (staffMember) => formatStaffData(staffMember))
    );

    return NextResponse.json(enrichedStaff);
  } catch (err: any) {
    console.error("GET /api/admin/staff error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

const body = await request.json();
  const { name, email, phone, profilePicture, jobTitle, department, employmentStatus, startDate, companyId } = body;

  if (!name || !email || !jobTitle || !department || !companyId) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, jobTitle, department, companyId" },
      { status: 400 }
    );
  }

  try {
    // First, check if a User with this email already exists
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    // If user does not exist, create a new User record
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          phone: phone,
          profilePicture: profilePicture,
          role: 'STAFF', // Assign the new STAFF role
        },
      });
    } else {
      // If user exists, update their role to STAFF if it's not already
      if (user.role !== 'STAFF' && user.role !== 'ADMIN') { // Allow ADMIN to also be staff
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'STAFF' },
        });
      }
    }

    // Check if a StaffProfile already exists for this user
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
    });

    if (staffProfile) {
      return NextResponse.json({ error: "Staff profile already exists for this user" }, { status: 409 });
    }

    // Create the StaffProfile linked to the User
    const newStaff = await prisma.staffProfile.create({
      data: {
        userId: user.id,
        companyId: companyId,
        jobTitle: jobTitle,
        department: department,
        employmentStatus: employmentStatus,
        startDate: startDate ? new Date(startDate) : undefined,
      },
      include: {
        user: { select: { name: true, email: true, phone: true, profilePicture: true } },
      },
    });

    const formattedNewStaff = await formatStaffData(newStaff);

    return NextResponse.json(formattedNewStaff, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/staff error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
