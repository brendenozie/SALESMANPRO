/**
 * app/api/super-admin/observability/alerts/route.ts
 *
 * Alert Rules & Notification Configuration Management API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { ensureDefaultAlertRules } from "@/lib/observability/alertEngine";

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
    await ensureDefaultAlertRules();
    const alerts = await prisma.monitoringAlert.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        alerts: alerts.map((a) => ({
          ...a,
          lastTriggeredAt: a.lastTriggeredAt?.toISOString() || null,
          lastResolvedAt: a.lastResolvedAt?.toISOString() || null,
          acknowledgedAt: a.acknowledgedAt?.toISOString() || null,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch alert definitions" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
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
    const { id, action, threshold, enabled } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Alert id is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof enabled === "boolean") updateData.enabled = enabled;
    if (typeof threshold === "number") updateData.threshold = threshold;

    if (action === "acknowledge") {
      updateData.state = "ACKNOWLEDGED";
      updateData.acknowledgedAt = new Date();
      updateData.acknowledgedBy = admin.email;
    } else if (action === "resolve") {
      updateData.state = "RESOLVED";
      updateData.lastResolvedAt = new Date();
    }

    const updated = await prisma.monitoringAlert.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        lastTriggeredAt: updated.lastTriggeredAt?.toISOString() || null,
        lastResolvedAt: updated.lastResolvedAt?.toISOString() || null,
        acknowledgedAt: updated.acknowledgedAt?.toISOString() || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update alert" },
      { status: 500 },
    );
  }
}
