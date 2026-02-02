import { NextResponse } from "next/server";

import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roleId, permissions } = body;

    if (!roleId || !permissions) {
      return NextResponse.json(
        { error: "Missing Role ID or Permissions data" },
        { status: 400 }
      );
    }

    // Update the dynamic Role record
    const updatedRole = await prisma.role.update({
      where: {
        id: roleId,
      },
      data: {
        permissions: permissions, // Stores the matrix array as JSON
      },
    });

    return NextResponse.json({
      success: true,
      message: "Hierarchy synchronized successfully",
      data: updatedRole,
    });
  } catch (error: any) {
    console.error("[ROLE_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}