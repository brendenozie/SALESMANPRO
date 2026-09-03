import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { encryptCredential, maskSensitive } from "@/lib/etims/crypto";

/**
 * GET /api/admin/etims/config?companyId=XYZ
 * Fetch store eTIMS configuration with masked credentials.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const cacheKey = `admin:etims:config:${companyId}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched from cache", 200);
  } catch (e) {}

  try {
    const config = await prisma.kraConfiguration.findUnique({
      where: { companyId },
    });

    if (!config) {
      return formatResponse(
        true,
        {
          config: null,
          status: "NOT_CONFIGURED",
          invoicingRequirement: "NOT_CONFIGURED",
        },
        "No configuration found",
        200
      );
    }

    // Mask secret keys before returning to UI
    const safeConfig = {
      ...config,
      managerKey: config.managerKey ? maskSensitive("MANAGED-KEY", 3) : null,
      cmcKey: config.cmcKey ? maskSensitive("CMC-KEY-ENCRYPTED", 4) : null,
      hasCmcKey: Boolean(config.cmcKey),
    };

    try {
      await cacheSet(cacheKey, { config: safeConfig }, 180);
    } catch (e) {}

    return formatResponse(true, { config: safeConfig }, "Config fetched successfully", 200);
  } catch (error: any) {
    console.error("[ETIMS_CONFIG_GET_ERROR]", error);
    return formatResponse(false, null, error?.message || "Failed to fetch eTIMS config", 500);
  }
}

/**
 * POST /api/admin/etims/config
 * Create or update store eTIMS configuration.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      invoicingRequirement,
      integrationMode,
      environment,
      kraPin,
      branchId,
      branchName,
      branches,
      terminals,
      deviceId,
      managerKey,
      businessName,
      taxpayerName,
      defaultTaxCode,
      autoPrintReceipt,
      offlineAllowed,
      etimsEnabled,
    } = body;

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required.", 400);
    }

    const formattedPin = kraPin ? kraPin.toUpperCase().trim() : "";
    const encryptedManagerKey = managerKey && !managerKey.includes("•••") ? encryptCredential(managerKey) : undefined;

    const data: any = {
      invoicingRequirement: invoicingRequirement || "NOT_CONFIGURED",
      integrationMode: integrationMode || "OSCU",
      environment: environment || "sandbox",
      kraPin: formattedPin,
      branchId: branchId ? branchId.trim() : "00",
      branchName: branchName || "Head Office",
      deviceId: deviceId ? deviceId.trim() : `OSCU${formattedPin.slice(-6)}`,
      businessName: businessName || null,
      taxpayerName: taxpayerName || null,
      defaultTaxCode: defaultTaxCode || "A",
      autoPrintReceipt: autoPrintReceipt ?? true,
      offlineAllowed: offlineAllowed ?? false,
      etimsEnabled: etimsEnabled ?? (invoicingRequirement === "REQUIRED" || invoicingRequirement === "ENABLED"),
      status: formattedPin ? "PENDING_SETUP" : "NOT_CONFIGURED",
      ...(branches ? { branches } : {}),
      ...(terminals ? { terminals } : {}),
    };

    if (encryptedManagerKey) {
      data.managerKey = encryptedManagerKey;
    }

    const updated = await prisma.kraConfiguration.upsert({
      where: { companyId },
      create: {
        companyId,
        ...data,
      },
      update: {
        ...data,
      },
    });

    try {
      await cacheDel(`admin:etims:config:${companyId}`);
      await cacheDel(`admin:kra:${companyId}`);
    } catch (e) {}

    return formatResponse(true, { config: updated }, "eTIMS configuration saved successfully", 200);
  } catch (error: any) {
    console.error("[ETIMS_CONFIG_POST_ERROR]", error);
    return formatResponse(false, null, error?.message || "Failed to persist configuration", 500);
  }
}
