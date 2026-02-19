import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// PATCH: Update role name or permissions matrix
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, permissions } = body;

  const updatedRole = await prisma.role.update({
    where: { id: params.id },
    data: { name, permissions },
  });
  
  try {
    await cacheDel(`admin:roles:${params.id}`);
  } catch (e) {}
  return NextResponse.json(updatedRole);
}

// DELETE: Remove a role
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.role.delete({ where: { id: params.id } });
  try {
    await cacheDel(`admin:roles:${params.id}`);
  } catch (e) {}
  return NextResponse.json({ message: "Role deleted" });
}