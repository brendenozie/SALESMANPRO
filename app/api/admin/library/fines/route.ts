import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


const getFinesLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status"); // Optional filter: PENDING or PAID

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "libraryFines", { status });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const fines = await prisma.libraryFine.findMany({
    where: {
      issuance: { companyId },
      status: status ? (status as any) : undefined,
    },
    include: {
      issuance: {
        include: {
          book: { select: { title: true, isbn: true } },
          libraryMember: {
            include: {
              student: { select: { firstName: true, lastName: true } },
              educator: { include: { user: { select: { name: true } } } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    if (fines) {
      await cacheSet(cacheKey, fines, 60);
    }
  } catch (e) {}

  return formatResponse(true, fines, "Fine ledger retrieved", 200);
};


const patchFineLogic = async (request: Request) => {
  const body = await request.json();
  const { fineId } = body;

  if (!fineId) {
    return formatResponse(false, null, "Fine ID is required.", 400);
  }

  const updatedFine = await prisma.libraryFine.update({
    where: { id: fineId },
    data: {
      status: "PAID",
      paidDate: new Date(),
    },
  });

  // Invalidate relevant caches
  try {
    await cacheDel(`tenant:${updatedFine.companyId}:libraryFines:*`);
    await cacheDel(`admin:libraryFines:*`);
  } catch (e) {}

  return formatResponse(true, updatedFine, "Fine settled successfully", 200);
};

export const GET = withApiHandler(getFinesLogic, { requireAuth: true });
export const PATCH = withApiHandler(patchFineLogic, { requireAuth: true });