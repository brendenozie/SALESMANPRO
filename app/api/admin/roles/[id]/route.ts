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
    const { name, permissions } = body;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Role not found", 404);
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(permissions && { permissions })
      },
    });
    
    try {
      await cacheDel(`tenant:${existing.companyId}:roles:*`);
      await cacheDel(`admin:roles:*`);
    } catch (e) {}

    return formatResponse(true, updatedRole, "Role updated successfully", 200);
  } catch (error: any) {
    console.error("[ROLE_PATCH_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update role", 500);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Role not found", 404);
    }

    await prisma.role.delete({ where: { id } });

    try {
      await cacheDel(`tenant:${existing.companyId}:roles:*`);
      await cacheDel(`admin:roles:*`);
    } catch (e) {}

    return formatResponse(true, null, "Role deleted successfully", 200);
  } catch (error: any) {
    console.error("[ROLE_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete role", 500);
  }
}