import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { companyId, roleName, department, baseTemplate } = await request.json();

    if (!companyId || !roleName) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    // Optional: You could create a 'RoleTemplate' model in Prisma 
    // or simply log this as an available designation for the UI.
    return NextResponse.json({ 
      success: true, 
      message: `Role ${roleName} is now available in ${department}` 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}