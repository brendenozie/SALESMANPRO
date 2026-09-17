/**
 * app/api/super-admin/observability/errors/route.ts
 *
 * Centralized Application Error & Exception Monitoring API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const errors = await prisma.monitoringError.findMany({
      where,
      orderBy: { lastSeenAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        errors: errors.map((e) => ({
          ...e,
          firstSeenAt: e.firstSeenAt.toISOString(),
          lastSeenAt: e.lastSeenAt.toISOString(),
          resolvedAt: e.resolvedAt?.toISOString() || null,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch error records" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  let admin: any;
  try {
    admin = await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const body = await req.json();
    const { fingerprint, status, notes } = body;

    if (!fingerprint || !status) {
      return NextResponse.json(
        { success: false, error: "fingerprint and status are required" },
        { status: 400 },
      );
    }

    const updated = await prisma.monitoringError.update({
      where: { fingerprint },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
        resolvedBy: status === "RESOLVED" ? admin.email : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        firstSeenAt: updated.firstSeenAt.toISOString(),
        lastSeenAt: updated.lastSeenAt.toISOString(),
        resolvedAt: updated.resolvedAt?.toISOString() || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update error status" },
      { status: 500 },
    );
  }
}
