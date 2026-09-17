/**
 * app/api/super-admin/observability/incidents/route.ts
 *
 * Technical Incident Management & Post-Mortem Timeline API.
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
    const incidents = await prisma.monitoringIncident.findMany({
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        incidents: incidents.map((i) => ({
          ...i,
          startedAt: i.startedAt.toISOString(),
          resolvedAt: i.resolvedAt?.toISOString() || null,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch incident records" },
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
    const { id, title, description, severity, status, affectedServices, timelineMessage } = body;

    if (id) {
      // Update existing incident
      const existing = await prisma.monitoringIncident.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
      }

      const timeline = (existing.timeline as any[]) || [];
      if (timelineMessage) {
        timeline.push({
          time: new Date().toISOString(),
          message: timelineMessage,
          author: admin.name || admin.email,
        });
      }

      const isResolving = status === "RESOLVED" && existing.status !== "RESOLVED";

      const updated = await prisma.monitoringIncident.update({
        where: { id },
        data: {
          title: title || existing.title,
          description: description || existing.description,
          severity: severity || existing.severity,
          status: status || existing.status,
          affectedServices: affectedServices || existing.affectedServices,
          resolvedAt: isResolving ? new Date() : existing.resolvedAt,
          timeline,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } else {
      // Create new incident
      if (!title || !description) {
        return NextResponse.json(
          { success: false, error: "Title and description are required" },
          { status: 400 },
        );
      }

      const timeline = [
        {
          time: new Date().toISOString(),
          message: timelineMessage || "Incident reported and investigation started.",
          author: admin.name || admin.email,
        },
      ];

      const created = await prisma.monitoringIncident.create({
        data: {
          title,
          description,
          severity: severity || "WARNING",
          status: status || "INVESTIGATING",
          affectedServices: affectedServices || [],
          timeline,
        },
      });

      return NextResponse.json({ success: true, data: created });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save incident record" },
      { status: 500 },
    );
  }
}
