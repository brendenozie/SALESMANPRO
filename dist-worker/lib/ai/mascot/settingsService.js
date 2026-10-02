"use strict";
/**
 * lib/ai/mascot/settingsService.ts
 *
 * Store-Specific Mascot Configuration Management.
 * Controls enable/disable, appearance, voice, module toggles, role restrictions,
 * and approval policies per store/company tenant.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MascotSettingsService = exports.DEFAULT_MASCOT_SETTINGS = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
exports.DEFAULT_MASCOT_SETTINGS = {
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
class MascotSettingsService {
    /**
     * Retrieves active mascot settings for a company tenant.
     */
    static async getSettings(companyId) {
        if (!companyId)
            return exports.DEFAULT_MASCOT_SETTINGS;
        try {
            const company = await prismadb_1.default.company.findUnique({
                where: { id: companyId },
                select: { themeSettings: true },
            });
            const themeSettings = company?.themeSettings || {};
            const storedMascot = themeSettings.mascotConfig;
            if (!storedMascot) {
                return exports.DEFAULT_MASCOT_SETTINGS;
            }
            return {
                ...exports.DEFAULT_MASCOT_SETTINGS,
                ...storedMascot,
                moduleToggles: {
                    ...exports.DEFAULT_MASCOT_SETTINGS.moduleToggles,
                    ...(storedMascot.moduleToggles || {}),
                },
                roleRestrictions: {
                    ...exports.DEFAULT_MASCOT_SETTINGS.roleRestrictions,
                    ...(storedMascot.roleRestrictions || {}),
                },
                approvalOverrides: {
                    ...exports.DEFAULT_MASCOT_SETTINGS.approvalOverrides,
                    ...(storedMascot.approvalOverrides || {}),
                },
            };
        }
        catch (err) {
            console.error("[MASCOT_SETTINGS_GET_ERROR]", err);
            return exports.DEFAULT_MASCOT_SETTINGS;
        }
    }
    /**
     * Updates mascot settings for a company tenant.
     * Only Company Admin or Super Admin can invoke.
     */
    static async updateSettings(companyId, updates) {
        if (!companyId) {
            throw new Error("Company ID is required to update mascot settings");
        }
        const current = await this.getSettings(companyId);
        const updated = {
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
        const company = await prismadb_1.default.company.findUnique({
            where: { id: companyId },
            select: { themeSettings: true },
        });
        const currentTheme = company?.themeSettings || {};
        const newTheme = {
            ...currentTheme,
            mascotConfig: updated,
        };
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: {
                themeSettings: newTheme,
            },
        });
        return updated;
    }
}
exports.MascotSettingsService = MascotSettingsService;
