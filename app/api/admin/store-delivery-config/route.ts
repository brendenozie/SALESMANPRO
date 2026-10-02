import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/admin/store-delivery-config: Get current company's delivery settings
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || (session.user as any).companyId;

    if (!companyId) {
      return json({ success: false, message: "Company ID is required" }, 400);
    }

    let config = await prisma.storeDeliveryConfig.findUnique({
      where: { companyId },
    });

    if (!config) {
      // Create sensible defaults
      config = await prisma.storeDeliveryConfig.create({
        data: {
          companyId,
          onDemandDeliveryEnabled: true,
          autoDispatchEnabled: false,
          biddingAllowed: true,
          defaultOfferedFee: 250.0,
          minRiderFee: 100.0,
          maxRiderFee: 3000.0,
          maxDeliveryRadiusKm: 25.0,
          allowedVehicleTypes: ["MOTORBIKE", "BICYCLE", "CAR", "VAN"],
          preferredDispatchMode: "SEQUENTIAL",
          responseTimeoutSeconds: 60,
        },
      });
    }

    return json({ success: true, config });
  } catch (error: any) {
    console.error("[STORE_DELIVERY_CONFIG_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load delivery configuration" }, 500);
  }
}

// POST /api/admin/store-delivery-config: Update delivery settings
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const {
      companyId = (session.user as any).companyId,
      onDemandDeliveryEnabled,
      autoDispatchEnabled,
      biddingAllowed,
      defaultOfferedFee,
      minRiderFee,
      maxRiderFee,
      maxDeliveryRadiusKm,
      allowedVehicleTypes,
      preferredDispatchMode,
      responseTimeoutSeconds,
    } = body;

    if (!companyId) {
      return json({ success: false, message: "Company ID is required" }, 400);
    }

    const updated = await prisma.storeDeliveryConfig.upsert({
      where: { companyId },
      create: {
        companyId,
        onDemandDeliveryEnabled: onDemandDeliveryEnabled ?? true,
        autoDispatchEnabled: autoDispatchEnabled ?? false,
        biddingAllowed: biddingAllowed ?? true,
        defaultOfferedFee: defaultOfferedFee ? Number(defaultOfferedFee) : 250.0,
        minRiderFee: minRiderFee ? Number(minRiderFee) : 100.0,
        maxRiderFee: maxRiderFee ? Number(maxRiderFee) : 3000.0,
        maxDeliveryRadiusKm: maxDeliveryRadiusKm ? Number(maxDeliveryRadiusKm) : 25.0,
        allowedVehicleTypes: Array.isArray(allowedVehicleTypes) ? allowedVehicleTypes : ["MOTORBIKE", "BICYCLE", "CAR", "VAN"],
        preferredDispatchMode: preferredDispatchMode || "SEQUENTIAL",
        responseTimeoutSeconds: responseTimeoutSeconds ? Number(responseTimeoutSeconds) : 60,
      },
      update: {
        onDemandDeliveryEnabled: typeof onDemandDeliveryEnabled === "boolean" ? onDemandDeliveryEnabled : undefined,
        autoDispatchEnabled: typeof autoDispatchEnabled === "boolean" ? autoDispatchEnabled : undefined,
        biddingAllowed: typeof biddingAllowed === "boolean" ? biddingAllowed : undefined,
        defaultOfferedFee: defaultOfferedFee ? Number(defaultOfferedFee) : undefined,
        minRiderFee: minRiderFee ? Number(minRiderFee) : undefined,
        maxRiderFee: maxRiderFee ? Number(maxRiderFee) : undefined,
        maxDeliveryRadiusKm: maxDeliveryRadiusKm ? Number(maxDeliveryRadiusKm) : undefined,
        allowedVehicleTypes: Array.isArray(allowedVehicleTypes) ? allowedVehicleTypes : undefined,
        preferredDispatchMode: preferredDispatchMode || undefined,
        responseTimeoutSeconds: responseTimeoutSeconds ? Number(responseTimeoutSeconds) : undefined,
      },
    });

    return json({
      success: true,
      message: "Delivery settings updated successfully.",
      config: updated,
    });
  } catch (error: any) {
    console.error("[STORE_DELIVERY_CONFIG_POST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to save delivery configuration" }, 500);
  }
}
