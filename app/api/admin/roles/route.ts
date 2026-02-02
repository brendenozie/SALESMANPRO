import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { companyId, roleName, department, baseTemplate } = await req.json();

    // Set default matrix based on template
    const defaultPermissions = [
      { category: 'Staff Records', actions: ['View', 'Edit', 'Delete'], status: [true, false, false] },
      { category: 'Financials', actions: ['View', 'Manage'], status: [false, false] },
    ];

    const newRole = await prisma.role.create({
      data: {
        name: roleName,
        companyId: companyId,
        permissions: defaultPermissions,
      },
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    return NextResponse.json({ error: "Role already exists" }, { status: 400 });
  }
}