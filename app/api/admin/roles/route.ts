import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

// GET: Fetch all roles for a specific company
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) return formatResponse(false, null, "Missing Company ID", 400);

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
  return formatResponse(true, roles, "Fetched roles successfully", 200);
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

    try {
      await cacheDel(`admin:roles:${companyId || 'global'}:*`);
    } catch (e) {}
    
    return formatResponse(true, role, "Role created successfully", 201);
  } catch (error) {
    return formatResponse(false, null, "Role name must be unique within the company", 400);
  }
}