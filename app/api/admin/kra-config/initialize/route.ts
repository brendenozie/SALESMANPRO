import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";
import { encryptCredential } from "@/lib/etims/crypto";
import { OSCUAdapter } from "@/lib/etims/oscuAdapter";
import { VSCUAdapter } from "@/lib/etims/vscuAdapter";

/**
 * POST /api/admin/kra-config/initialize
 * Initiates an authoritative KRA eTIMS device handshake.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId } = body;

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required.", 400);
    }

    const config = await prisma.kraConfiguration.findUnique({
      where: { companyId },
    });

    if (!config) {
      return formatResponse(false, null, "eTIMS configuration not found for this company.", 404);
    }

    if (!config.kraPin) {
      return formatResponse(false, null, "KRA PIN is required before initiating device handshake.", 400);
    }

    // Resolve provider
    const provider = config.integrationMode === "VSCU" ? new VSCUAdapter() : new OSCUAdapter();
    const handshakeResult = await provider.initializeDevice(config);

    if (!handshakeResult.success || !handshakeResult.cmcKey) {
      return formatResponse(
        false,
        null,
        handshakeResult.errorMessage || "KRA rejected device handshake.",
        400
      );
    }

    // Encrypt communication key at rest
    const encryptedKey = encryptCredential(handshakeResult.cmcKey);
    const now = new Date();

    const updatedConfig = await prisma.kraConfiguration.update({
      where: { companyId },
      data: {
        cmcKey: encryptedKey,
        lastInitAt: now,
        status: "ACTIVE",
        deviceId: handshakeResult.deviceId || config.deviceId,
        businessName: handshakeResult.taxpayerName || config.businessName,
        branchName: handshakeResult.branchName || config.branchName,
      },
      select: {
        id: true,
        companyId: true,
        kraPin: true,
        branchId: true,
        branchName: true,
        deviceId: true,
        status: true,
        lastInitAt: true,
        integrationMode: true,
        invoicingRequirement: true,
        environment: true,
      },
    });

    // Invalidate cache
    try {
      await cacheDel(`admin:kra:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      {
        message: "eTIMS device handshake completed successfully.",
        config: updatedConfig,
      },
      "Handshake verified",
      200
    );
  } catch (error: any) {
    console.error("[KRA_INIT_ERROR]", error);
    return formatResponse(false, null, error?.message || "Internal handshake error", 500);
  }
}
