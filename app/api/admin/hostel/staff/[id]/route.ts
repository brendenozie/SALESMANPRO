import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

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
    try {      const cacheKey = `admin:hostelStaff:${companyId || 'global'}:*`;
      await cacheDel(cacheKey);
    } catch (e) {
      console.error("Error invalidating cache:", e);
    }
    return formatResponse(true, updatedStaff, "Staff updated successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}

export async function DELETE( req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    await prisma.hostelStaff.delete({
      where: { id }
    });

    try {
      const cacheKey = `admin:hostelStaff:${id || 'global'}:*`;
      await cacheDel(cacheKey);
    } catch (e) {
      console.error("Error invalidating cache:", e);
    }
    return formatResponse(true, null, "Staff deleted successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Delete failed", 500);
  }
}