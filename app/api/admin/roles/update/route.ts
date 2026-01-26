// app/api/admin/roles/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, roleName, permissions } = body;

    if (!companyId || !roleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update all staff profiles that match this role/job title in the company
    const updated = await prisma.staffProfile.updateMany({
      where: {
        companyId: companyId,
        // Assuming jobTitle is used as the display name for roles in your UI
        jobTitle: roleName, 
      },
      data: {
        permissions: permissions, // Saving the array/object of permissions
      },
    });

    return NextResponse.json({ 
      success: true, 
      count: updated.count 
    });
  } catch (error) {
    console.error("API_ROLES_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}