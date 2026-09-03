import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/subscription-payments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');

    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;

    const cacheKey = buildTenantCacheKey(companyId, "subscriptions-payments", { status });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true });
  } catch (e) {}

  const subscriptions = await prisma.subscriptionCompany.findMany({
      where: status ? { status: status as any } : {},
      include: {
        user: { 
          select: { name: true, email: true } 
        },
        company: { 
          select: { id: true, name: true } 
        },
        plan: { 
          // FIX: Use select only, and fetch the company relation inside it
          select: { 
            name: true,
            company: {
              select: { name: true } // The company that owns/provides the plan
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });

  // try {
  //   if (subscriptions) {
  //     await cacheSet(cacheKey, subscriptions, 60);
  //   }
  // } catch (e) {}

    try{ await cacheSet(cacheKey, subscriptions, 60); } catch (e) {}

    return NextResponse.json({ success: true, data: subscriptions, cached: false });
  } catch (error: any) {
    console.error("Prisma Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}