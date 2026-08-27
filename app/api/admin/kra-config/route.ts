import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { encryptKRA } from "@/lib/crypto/aes";

/**
 * GET: Fetch the eTIMS configuration for a specific company
 * Route: /api/kra-config?companyId=XYZ
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Company ID verification context is missing",
      400,
    );
  }

  const cacheKey = `admin:kra:${companyId}`;

  // 1. Attempt Cache Retrieval
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const response = formatResponse(
        true,
        cached,
        "Fetched eTIMS config (Cached)",
        200,
      );
      response.headers.set(
        "Cache-Control",
        "private, s-maxage=60, stale-while-revalidate=120",
      );
      return response;
    }
  } catch (e) {}

  // 2. Database Lookup
  try {
    const config = await prisma.kraConfiguration.findUnique({
      where: { companyId },
      select: {
        id: true,
        companyId: true,
        etimsEnabled: true,
        environment: true,
        kraPin: true,
        branchId: true,
        deviceId: true,
        cmcKey: true, // Internal key validation flag status
      },
    });

    // Structure data payload to match the expected client-side schema parsing check (.config)
    const payload = { config: config || null };

    try {
      await cacheSet(cacheKey, payload, 300); // Cache configuration state parameters safely
    } catch (e) {}

    const response = formatResponse(
      true,
      payload,
      "Fetched eTIMS config parameters successfully",
      200,
    );
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120",
    );
    return response;
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to fetch fiscal execution profile data",
      500,
    );
  }
}

/**
 * POST: Initialize or completely upsert a company's eTIMS config profile
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      etimsEnabled,
      environment,
      kraPin,
      branchId,
      deviceId,
      managerKey,
    } = body;

    if (!companyId || !kraPin || !branchId || !deviceId) {
      return formatResponse(
        false,
        null,
        "Missing required baseline payload fields",
        400,
      );
    }

    // Force strict database alignment validation checks
    const formattedPin = kraPin.toUpperCase().trim();
    
    // Encrypt the manager key if provided
    const encryptedManagerKey = managerKey ? encryptKRA(managerKey) : null;

    const updatedConfig = await prisma.kraConfiguration.upsert({
      where: { companyId },
      update: {
        etimsEnabled: Boolean(etimsEnabled),
        environment: environment || "sandbox",
        kraPin: formattedPin,
        branchId: branchId.trim(),
        deviceId: deviceId.trim(),
        ...(managerKey ? { managerKey: encryptedManagerKey } : {}),
      },
      create: {
        companyId,
        etimsEnabled: Boolean(etimsEnabled),
        environment: environment || "sandbox",
        kraPin: formattedPin,
        branchId: branchId.trim(),
        deviceId: deviceId.trim(),
        managerKey: encryptedManagerKey,
      },
    });

    // Evacuate localized configuration profile cache keys
    try {
      await cacheDel(`admin:kra:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      { config: updatedConfig },
      "eTIMS profile saved securely",
      201,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to persist structural tax registry profile",
      500,
    );
  }
}

/**
 * PATCH: Safely mutate fine-grained parameters without overriding execution access credentials
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { companyId, etimsEnabled, environment } = body;

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company context context parameters missing",
        400,
      );
    }

    const updatedConfig = await prisma.kraConfiguration.update({
      where: { companyId },
      data: {
        ...(etimsEnabled !== undefined
          ? { etimsEnabled: Boolean(etimsEnabled) }
          : {}),
        ...(environment ? { environment } : {}),
      },
    });

    try {
      await cacheDel(`admin:kra:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      { config: updatedConfig },
      "Fiscal settings patch applied cleanly",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Selective profile state mutation failed",
      500,
    );
  }
}

/**
 * DELETE: Wipe configuration details safely down to initial baseline registry conditions
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company verification identifier context is missing",
        400,
      );
    }

    const terminatedConfig = await prisma.kraConfiguration.delete({
      where: { companyId },
    });

    try {
      await cacheDel(`admin:kra:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      terminatedConfig,
      "Fiscal data mapping parameters purged successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Taxation profiling clear lifecycle process failed",
      500,
    );
  }
}
