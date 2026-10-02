/**
 * lib/ai/mascot/settingsService.ts
 *
 * Store-Specific Mascot Configuration Management.
 * Controls enable/disable, appearance, voice, module toggles, role restrictions,
 * and approval policies per store/company tenant.
 */

import prisma from "@/server/db/prismadb";
import { MascotSettings, MascotModule } from "./types";

export const DEFAULT_MASCOT_SETTINGS: MascotSettings = {
  enabled: true,
  character: "alex",
  size: "normal",
  defaultPosition: "bottom-right",
  animationLevel: "dynamic",
  voiceEnabled: true,
  voiceType: "friendly",
  voiceSpeed: 1.0,
  autoSpeak: false,
  moduleToggles: {
    products: true,
    inventory: true,
    orders: true,
    pricing: true,
    finance: true,
    marketing: true,
    messaging: true,
    marketplace: true,
    staff: true,
    education: true,
    property: true,
    restaurant: true,
    service: true,
    website: true,
    integrations: true,
    system: true,
  },
  roleRestrictions: {},
  approvalOverrides: {
    "pricing:bulk_price_adjustment": true,
    "pricing:update_single_price": true,
    "messaging:send_whatsapp_message": true,
    "messaging:send_email_broadcast": true,
    "marketing:launch_ad_campaign": true,
    "marketplace:publish_listings": true,
    "education:send_parent_report": true,
    "finance:record_expense": true,
    "products:delete_product": true,
  },
};

export class MascotSettingsService {
  /**
   * Retrieves active mascot settings for a company tenant.
   */
  public static async getSettings(companyId: string): Promise<MascotSettings> {
    if (!companyId) return DEFAULT_MASCOT_SETTINGS;

    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { themeSettings: true },
      });

      const themeSettings = (company?.themeSettings as any) || {};
      const storedMascot = themeSettings.mascotConfig;

      if (!storedMascot) {
        return DEFAULT_MASCOT_SETTINGS;
      }

      return {
        ...DEFAULT_MASCOT_SETTINGS,
        ...storedMascot,
        moduleToggles: {
          ...DEFAULT_MASCOT_SETTINGS.moduleToggles,
          ...(storedMascot.moduleToggles || {}),
        },
        roleRestrictions: {
          ...DEFAULT_MASCOT_SETTINGS.roleRestrictions,
          ...(storedMascot.roleRestrictions || {}),
        },
        approvalOverrides: {
          ...DEFAULT_MASCOT_SETTINGS.approvalOverrides,
          ...(storedMascot.approvalOverrides || {}),
        },
      };
    } catch (err) {
      console.error("[MASCOT_SETTINGS_GET_ERROR]", err);
      return DEFAULT_MASCOT_SETTINGS;
    }
  }

  /**
   * Updates mascot settings for a company tenant.
   * Only Company Admin or Super Admin can invoke.
   */
  public static async updateSettings(
    companyId: string,
    updates: Partial<MascotSettings>,
  ): Promise<MascotSettings> {
    if (!companyId) {
      throw new Error("Company ID is required to update mascot settings");
    }

    const current = await this.getSettings(companyId);
    const updated: MascotSettings = {
      ...current,
      ...updates,
      moduleToggles: {
        ...current.moduleToggles,
        ...(updates.moduleToggles || {}),
      },
      roleRestrictions: {
        ...current.roleRestrictions,
        ...(updates.roleRestrictions || {}),
      },
      approvalOverrides: {
        ...current.approvalOverrides,
        ...(updates.approvalOverrides || {}),
      },
    };

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { themeSettings: true },
    });

    const currentTheme = (company?.themeSettings as any) || {};
    const newTheme = {
      ...currentTheme,
      mascotConfig: updated,
    };

    await prisma.company.update({
      where: { id: companyId },
      data: {
        themeSettings: newTheme,
      },
    });

    return updated;
  }
}
