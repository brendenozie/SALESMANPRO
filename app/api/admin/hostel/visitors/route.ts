import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const cacheKey = buildTenantCacheKey(companyId, "visitors", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}
    
    const visitors = await prisma.hostelVisitor.findMany({
      where: { companyId: companyId || undefined },
      include: { 
        student: { select: { firstName: true, lastName: true } },  
        educator: { include: { user: { select: { name: true } } } } 
      },
      orderBy: { checkIn: 'desc' }
    });

    try {
      if (visitors) {
        await cacheSet(cacheKey, visitors, 60);
      }
    } catch (e) {}
    
    return formatResponse(true, visitors, "Visitors fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch visitors", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, relation, studentId, educatorId, idType, idNumber, companyId } = body;

    if (!name || !relation || !companyId) {
      return formatResponse(false, null, "Name, relation, and companyId are required", 400);
    }

    const visitor = await prisma.hostelVisitor.create({
      data: {
        name,
        relation,
        studentId: studentId || null,
        educatorId: educatorId || null,
        idType: idType || "National ID",
        idNumber: idNumber || null,
        companyId,
        status: "ACTIVE",
        checkIn: new Date(),
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        educator: { include: { user: { select: { name: true } } } }
      }
    });

    try {
      await cacheDel(`tenant:${companyId}:visitors:*`);
      await cacheDel(`admin:visitors:*`);
    } catch (e) {}

    return formatResponse(true, visitor, "Visitor registered successfully", 201);
  } catch (error: any) {
    console.error("[VISITOR_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to register visitor", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return formatResponse(false, null, "Visitor ID required", 400);

    const visitor = await prisma.hostelVisitor.update({
      where: { id },
      data: { 
        status: "CHECKED_OUT",
        checkOut: new Date(),
      },
      include: { 
        student: { select: { firstName: true, lastName: true } }, 
        educator: { include: { user: { select: { name: true } } } } 
      }
    });

    try {
      await cacheDel(`tenant:*:visitors:*`);
      await cacheDel(`admin:visitors:*`);
    } catch (e) {}

    return formatResponse(true, visitor, "Visitor checked out successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Check-out failed", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return formatResponse(false, null, "Visitor ID required", 400);

    await prisma.hostelVisitor.delete({
      where: { id }
    });

    try {
      await cacheDel(`tenant:*:visitors:*`);
      await cacheDel(`admin:visitors:*`);
    } catch (e) {}

    return formatResponse(true, null, "Visitor log deleted successfully", 200);
  } catch (error: any) {
    console.error("[VISITOR_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete visitor log", 500);
  }
}