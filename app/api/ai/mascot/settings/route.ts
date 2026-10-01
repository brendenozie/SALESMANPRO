/**
 * app/api/ai/mascot/settings/route.ts
 *
 * Mascot Administration Settings API.
 * Allows Store Admins and Super Admins to configure mascot status,
 * appearance, voice, module access, role policies, and approval rules.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotSettingsService } from "@/lib/ai/mascot/settingsService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || undefined;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    const settings = await MascotSettingsService.getSettings(context.companyId);

    return NextResponse.json({
      success: true,
      settings,
      companyId: context.companyId,
      companyName: context.companyName,
    });
  } catch (error: any) {
    console.error("[MASCOT_SETTINGS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings." },
      { status: 400 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, companyId } = body;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    // Only Admin or SuperAdmin can modify mascot store settings
    if (!["ADMIN", "SUPER_ADMIN"].includes(context.userRole)) {
      return NextResponse.json(
        { success: false, error: "Only store administrators can update mascot configuration." },
        { status: 403 },
      );
    }

    const updated = await MascotSettingsService.updateSettings(
      context.companyId,
      settings || {},
    );

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Mascot settings updated successfully.",
    });
  } catch (error: any) {
    console.error("[MASCOT_SETTINGS_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings." },
      { status: 400 },
    );
  }
}
