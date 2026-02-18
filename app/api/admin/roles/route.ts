import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// GET: Fetch all roles for a specific company
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) return NextResponse.json({ error: "Missing Company ID" }, { status: 400 });

  
    const cacheKey = `admin:roles:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const roles = await prisma.role.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  });

  try {
    if (roles) {
      await cacheSet(cacheKey, roles, 60);
    }
  } catch (e) {}
  return NextResponse.json(roles);
}

// POST: Create a new role
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, companyId, permissions } = body;

    const role = await prisma.role.create({
      data: {
        name,
        companyId,
        permissions: permissions || [],
      },
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: "Role name must be unique within the company" }, { status: 400 });
  }
}