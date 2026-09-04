/**
 * app/api/ai/workforce/agents/route.ts
 *
 * List, retrieve, and configure AI Workforce Agents.
 * - Store Admins see Level 1 (Store Workforce) with store-specific activations.
 * - Super Admins can see all 3 levels (Store, Platform SaaS, Ghuba Marketplace).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { WorkforceAgentRegistry } from "@/lib/ai/workforce/agentRegistry";
import { AgentWorkforceLevel, AgentPermissionLevel } from "@/lib/ai/workforce/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const requestedLevel = searchParams.get("level") as AgentWorkforceLevel | null;

    const isSuperAdmin = auth.role === "SUPER_ADMIN";

    // 1. Fetch existing DB records for this company (or platform)
    const existingDbAgents = await prisma.aIAgent.findMany({
      where: isSuperAdmin && !requestedLevel
        ? {}
        : {
            OR: [
              { companyId: auth.companyId },
              { level: { in: [AgentWorkforceLevel.PLATFORM, AgentWorkforceLevel.MARKETPLACE] } },
            ],
          },
    });

    const dbMap = new Map(existingDbAgents.map((a) => [a.key, a]));

    // 2. Query Agent Registry definitions
    let catalog = WorkforceAgentRegistry.listAllAgents();
    if (!isSuperAdmin) {
      catalog = catalog.filter((a) => a.level === AgentWorkforceLevel.STORE);
    } else if (requestedLevel) {
      catalog = catalog.filter((a) => a.level === requestedLevel);
    }

    // 3. Merge catalog metadata with persistent settings
    const merged = catalog.map((def) => {
      const db = dbMap.get(def.key);
      return {
        key: def.key,
        name: def.name,
        level: def.level,
        roleDescription: def.roleDescription,
        systemPrompt: def.systemPrompt,
        defaultPermission: def.defaultPermission,
        currentPermission: db?.permissionLevel || def.defaultPermission,
        enabled: db ? db.enabled : true,
        allowedTools: db?.allowedTools?.length ? db.allowedTools : def.allowedTools,
        allowedChannels: def.allowedChannels,
        defaultDailyCreditLimit: def.defaultDailyCreditLimit,
        currentDailyCreditLimit: db?.dailyCreditLimit ?? def.defaultDailyCreditLimit,
        icon: def.icon,
        badge: def.badge,
        exampleQueries: def.exampleQueries,
        dbId: db?.id || null,
        totalTasksExecuted: db?.totalTasksRun || 0,
        totalCreditsConsumed: db?.totalCreditsUsed || 0,
      };
    });

    return NextResponse.json({
      success: true,
      companyId: auth.companyId,
      isSuperAdmin,
      agents: merged,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_AGENTS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve agents" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();
    const { key, enabled, permissionLevel, allowedTools, dailyCreditLimit } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: "Agent key is required" }, { status: 400 });
    }

    const def = WorkforceAgentRegistry.getAgent(key);
    if (!def) {
      return NextResponse.json({ success: false, error: `Unknown agent key: ${key}` }, { status: 404 });
    }

    const isPlatformScope = def.level !== AgentWorkforceLevel.STORE;
    if (isPlatformScope && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Super Admin privileges required for platform agents." }, { status: 403 });
    }

    const targetCompanyId = isPlatformScope ? null : auth.companyId;

    // Find existing
    const existing = await prisma.aIAgent.findFirst({
      where: {
        key,
        companyId: targetCompanyId,
      },
    });

    let updated;
    if (existing) {
      updated = await prisma.aIAgent.update({
        where: { id: existing.id },
        data: {
          enabled: enabled !== undefined ? Boolean(enabled) : undefined,
          permissionLevel: (permissionLevel as AgentPermissionLevel) || undefined,
          allowedTools: Array.isArray(allowedTools) ? allowedTools : undefined,
          dailyCreditLimit: dailyCreditLimit !== undefined ? Number(dailyCreditLimit) : undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      updated = await prisma.aIAgent.create({
        data: {
          key,
          name: def.name,
          level: def.level,
          companyId: targetCompanyId || undefined,
          enabled: enabled !== undefined ? Boolean(enabled) : true,
          permissionLevel: (permissionLevel as AgentPermissionLevel) || def.defaultPermission,
          allowedTools: Array.isArray(allowedTools) ? allowedTools : def.allowedTools,
          dailyCreditLimit: dailyCreditLimit !== undefined ? Number(dailyCreditLimit) : def.defaultDailyCreditLimit,
        },
      });
    }

    return NextResponse.json({
      success: true,
      agent: updated,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_AGENTS_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to configure agent" },
      { status: error.statusCode || 500 },
    );
  }
}
