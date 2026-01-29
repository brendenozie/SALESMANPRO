import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    
    // We exclude sensitive fields from the spread to prevent accidental overwrites
    const { userId, companyId, ...updateData } = body;

    const updatedStaff = await prisma.hostelStaff.update({
      where: { id },
      data: {
        ...updateData,
        // Optional: Allow changing the linked user
        ...(userId && { user: { connect: { id: userId } } })
      }
    });

    return NextResponse.json(updatedStaff);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE( req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    await prisma.hostelStaff.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Staff deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}