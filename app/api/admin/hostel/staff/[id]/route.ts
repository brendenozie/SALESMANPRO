import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { userId, companyId, ...updateData } = body;

    const existing = await prisma.hostelStaff.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Staff member not found", 404);
    }

    const updatedStaff = await prisma.hostelStaff.update({
      where: { id },
      data: {
        ...updateData,
        ...(userId && { user: { connect: { id: userId } } })
      }
    });

    try {
      await cacheDel(`admin:hostelStaff:*`);
      await cacheDel(`tenant:*:staff:*`);
    } catch (e) {}

    return formatResponse(true, updatedStaff, "Staff updated successfully", 200);
  } catch (error: any) {
    console.error("[HOSTEL_STAFF_PATCH_ERROR]", error);
    return formatResponse(false, null, error.message || "Update failed", 500);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.hostelStaff.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Staff member not found", 404);
    }

    await prisma.hostelStaff.delete({
      where: { id }
    });

    try {
      await cacheDel(`admin:hostelStaff:*`);
      await cacheDel(`tenant:*:staff:*`);
    } catch (e) {}

    return formatResponse(true, null, "Staff deleted successfully", 200);
  } catch (error: any) {
    console.error("[HOSTEL_STAFF_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Delete failed", 500);
  }
}