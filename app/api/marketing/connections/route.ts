/**
 * app/api/marketing/connections/route.ts
 *
 * Multi-tenant API for managing external marketing connections (Meta Ads, Google Ads, GA4, Social).
 * Enforces companyId isolation and role validation.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { MarketingProviderType, MarketingConnectionStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const queryCompanyId = searchParams.get("companyId");

    let effectiveCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN" && queryCompanyId) {
      effectiveCompanyId = queryCompanyId;
    }

    if (!effectiveCompanyId && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Store tenant context required." },
        { status: 403 }
      );
    }

    const connections = await prisma.marketingConnection.findMany({
      where: effectiveCompanyId ? { companyId: effectiveCompanyId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    // Mask encrypted credentials for security
    const sanitized = connections.map((conn) => ({
      id: conn.id,
      companyId: conn.companyId,
      provider: conn.provider,
      accountId: conn.accountId,
      accountName: conn.accountName,
      status: conn.status,
      syncStatus: conn.syncStatus,
      lastSyncAt: conn.lastSyncAt,
      syncError: conn.syncError,
      hasAccessToken: !!conn.accessTokenEncrypted,
      hasRefreshToken: !!conn.refreshTokenEncrypted,
      metadata: conn.metadata,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      connections: sanitized,
      count: sanitized.length,
    });
  } catch (error: any) {
    console.error("[MARKETING_CONNECTIONS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch marketing connections" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();
    const {
      provider,
      accountId,
      accountName,
      accessToken,
      refreshToken,
      metadata = {},
    } = body;

    if (!provider || !accountId) {
      return NextResponse.json(
        { success: false, error: "provider and accountId are required." },
        { status: 400 }
      );
    }

    let targetCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN" && body.companyId) {
      targetCompanyId = body.companyId;
    }

    if (!targetCompanyId && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Store tenant context required." },
        { status: 403 }
      );
    }

    // Upsert connection for this provider and accountId within the tenant
    const connection = await prisma.marketingConnection.upsert({
      where: {
        provider_accountId: {
          provider: provider as MarketingProviderType,
          accountId,
        },
      },
      create: {
        companyId: targetCompanyId || null,
        provider: provider as MarketingProviderType,
        accountId,
        accountName: accountName || `${provider} Account (${accountId})`,
        status: MarketingConnectionStatus.CONNECTED,
        accessTokenEncrypted: accessToken || null,
        refreshTokenEncrypted: refreshToken || null,
        metadata,
        syncStatus: "PENDING",
      },
      update: {
        accountName: accountName || undefined,
        status: MarketingConnectionStatus.CONNECTED,
        accessTokenEncrypted: accessToken || undefined,
        refreshTokenEncrypted: refreshToken || undefined,
        metadata: metadata || undefined,
        syncStatus: "PENDING",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        companyId: connection.companyId,
        provider: connection.provider,
        accountId: connection.accountId,
        accountName: connection.accountName,
        status: connection.status,
        syncStatus: connection.syncStatus,
      },
      message: `Marketing account ${connection.accountName} connected successfully.`,
    });
  } catch (error: any) {
    console.error("[MARKETING_CONNECTIONS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save marketing connection" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: "connectionId query parameter is required." },
        { status: 400 }
      );
    }

    const connection = await prisma.marketingConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: "Marketing connection not found." },
        { status: 404 }
      );
    }

    // Tenant check
    if (auth.role !== "SUPER_ADMIN" && connection.companyId !== auth.companyId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this marketing connection." },
        { status: 403 }
      );
    }

    await prisma.marketingConnection.update({
      where: { id: connectionId },
      data: {
        status: MarketingConnectionStatus.DISCONNECTED,
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        syncStatus: "IDLE",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Marketing connection ${connection.accountName || connection.id} disconnected.`,
    });
  } catch (error: any) {
    console.error("[MARKETING_CONNECTIONS_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to disconnect marketing account" },
      { status: error.statusCode || 500 }
    );
  }
}
