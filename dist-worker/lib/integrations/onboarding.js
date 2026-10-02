"use strict";
/**
 * lib/integrations/onboarding.ts
 *
 * Mascot-Led Integration Onboarding Engine for SalesmanPro.
 * Translates complex OAuth handshakes and API requirements into human-friendly,
 * role-aware conversational steps for store owners and staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MascotIntegrationOnboardingService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const registry_1 = require("./registry");
const oauth_1 = require("./oauth");
class MascotIntegrationOnboardingService {
    /**
     * Generates a step-by-step onboarding guide for any supported provider.
     */
    static async getOnboardingGuide(params) {
        const { providerId, companyId, userRole, userId, storeSlug, origin } = params;
        const def = registry_1.IntegrationRegistry.getDefinition(providerId);
        if (!def) {
            throw new Error(`Unsupported integration provider: '${providerId}'`);
        }
        // Role check: Only authorized roles can connect integrations
        const canConnect = def.requiredPermissions.includes(userRole);
        if (!canConnect) {
            return {
                providerId: def.id,
                providerName: def.name,
                status: "ACTION_REQUIRED",
                summary: `Only store administrators (${def.requiredPermissions.join(", ")}) can connect ${def.name}.`,
                whatItEnables: def.whatItEnables,
                prerequisites: [],
                steps: [],
                currentStepIndex: 0,
                canConnect: false,
                blockReason: "Insufficient role permissions. Please ask a store administrator to complete this setup.",
            };
        }
        // Check platform readiness (Super Admin OAuth app)
        const isPlatformReady = await registry_1.IntegrationRegistry.isPlatformConfigured(providerId);
        // Check current connection status in database
        const existingConnection = await this.findExistingConnection(providerId, companyId);
        const status = existingConnection ? existingConnection.status : "NOT_CONNECTED";
        const prerequisites = def.prerequisites.map((p, idx) => ({
            name: p,
            satisfied: idx === 1 ? isPlatformReady : true,
            instructions: !isPlatformReady && idx === 1
                ? "Super Admin needs to configure platform OAuth credentials under Super Admin → Integrations."
                : undefined,
        }));
        if (!isPlatformReady && def.oauthSupported) {
            return {
                providerId: def.id,
                providerName: def.name,
                status: "SETUP_REQUIRED",
                summary: `Platform OAuth setup is required before connecting ${def.name}.`,
                whatItEnables: def.whatItEnables,
                prerequisites,
                steps: [
                    {
                        stepNumber: 1,
                        title: "Platform Configuration Needed",
                        description: `A platform administrator must register the ${def.name} OAuth application under the Super Admin Integrations Console.`,
                        status: "ACTION_REQUIRED",
                    },
                ],
                currentStepIndex: 0,
                canConnect: false,
                blockReason: "Super Admin has not yet configured the platform API credentials for this provider.",
            };
        }
        // If already connected
        if (existingConnection && ["ACTIVE", "CONNECTED"].includes(existingConnection.status)) {
            const steps = [
                {
                    stepNumber: 1,
                    title: "Account Connected",
                    description: `Successfully linked as ${existingConnection.accountName}.`,
                    status: "COMPLETED",
                    resultSummary: `Verified asset: ${existingConnection.accountName}`,
                },
                {
                    stepNumber: 2,
                    title: "Active Features",
                    description: "Mascot is enabled to coordinate marketing drafts and catalog promotions.",
                    status: "COMPLETED",
                },
            ];
            return {
                providerId: def.id,
                providerName: def.name,
                status: "ACTIVE",
                summary: `Your ${def.name} account is active and connected as "${existingConnection.accountName}".`,
                whatItEnables: def.whatItEnables,
                prerequisites,
                steps,
                currentStepIndex: 2,
                canConnect: true,
            };
        }
        // Prepare fresh OAuth authorization URL
        let connectUrl;
        if (def.oauthSupported) {
            try {
                const auth = await oauth_1.IntegrationOAuthService.buildAuthorizationUrl({
                    providerId,
                    companyId,
                    userId,
                    origin,
                    redirectPath: `/admin/${storeSlug || "store"}/mascot/integrations`,
                });
                connectUrl = auth.url;
            }
            catch (err) {
                console.warn(`[MASCOT_ONBOARDING] Could not build auth URL for ${providerId}:`, err.message);
            }
        }
        const steps = [
            {
                stepNumber: 1,
                title: "Review Permissions",
                description: `Connecting ${def.name} allows the mascot to ${def.whatItEnables[0].toLowerCase()}. SalesmanPro only requests the minimum necessary scopes.`,
                status: "COMPLETED",
            },
            {
                stepNumber: 2,
                title: `Authorize with ${def.name}`,
                description: `Click Connect to open the official ${def.name} authorization screen. Sign in and grant access to your business page or asset.`,
                status: "PENDING",
                actionType: "OAUTH_POPUP",
                actionUrl: connectUrl,
            },
            {
                stepNumber: 3,
                title: "Verify Connection",
                description: "The mascot performs a safe, read-only probe to verify asset access and confirm token validity.",
                status: "PENDING",
                actionType: "VERIFICATION",
            },
            {
                stepNumber: 4,
                title: "Enable Business Features",
                description: "Choose publishing mode: Draft Only, Approval Required, or Preapproved Automated Publishing.",
                status: "PENDING",
                actionType: "APPROVAL",
            },
        ];
        return {
            providerId: def.id,
            providerName: def.name,
            status: "NOT_CONNECTED",
            summary: `Let's connect your ${def.name} account to enable automated marketing and customer communication.`,
            whatItEnables: def.whatItEnables,
            prerequisites,
            steps,
            currentStepIndex: 1,
            connectUrl,
            canConnect: true,
        };
    }
    /**
     * Helper to query connected social or WhatsApp accounts for a company.
     */
    static async findExistingConnection(providerId, companyId) {
        if (providerId === "whatsapp") {
            const wa = await prismadb_1.default.whatsAppAccount.findFirst({
                where: { companyId, status: { not: "DISCONNECTED" } },
                select: {
                    id: true,
                    status: true,
                    displayName: true,
                    phoneNumber: true,
                },
            });
            return wa ? { status: wa.status, accountName: wa.displayName || wa.phoneNumber || "WhatsApp" } : null;
        }
        const platformMap = {
            facebook: "FACEBOOK",
            instagram: "INSTAGRAM",
            tiktok: "TIKTOK",
            youtube: "YOUTUBE",
        };
        const platform = platformMap[providerId.toLowerCase()];
        if (!platform)
            return null;
        const account = await prismadb_1.default.socialAccount.findFirst({
            where: { companyId, platform, status: { not: "DISCONNECTED" } },
            select: {
                id: true,
                status: true,
                accountName: true,
            },
        });
        return account;
    }
    /**
     * Returns a friendly status overview of all integrations for a store.
     */
    static async getStoreIntegrationsOverview(companyId) {
        const definitions = registry_1.IntegrationRegistry.getAllDefinitions();
        const socialAccounts = await prismadb_1.default.socialAccount.findMany({
            where: { companyId },
            select: {
                id: true,
                platform: true,
                accountName: true,
                username: true,
                profileImageUrl: true,
                status: true,
                lastSyncAt: true,
                tokenExpiresAt: true,
            },
        });
        const whatsappAccounts = await prismadb_1.default.whatsAppAccount.findMany({
            where: { companyId },
            select: {
                id: true,
                displayName: true,
                phoneNumber: true,
                status: true,
                lastConnectedAt: true,
            },
        });
        return definitions.map((def) => {
            let isConnected = false;
            let status = "NOT_CONNECTED";
            let accountName;
            let accountId;
            if (def.id === "whatsapp") {
                const wa = whatsappAccounts.find((a) => a.status !== "DISCONNECTED");
                if (wa) {
                    isConnected = true;
                    status = wa.status;
                    accountName = wa.displayName || wa.phoneNumber || "WhatsApp Cloud";
                    accountId = wa.id;
                }
            }
            else {
                const platformMap = {
                    facebook: "FACEBOOK",
                    instagram: "INSTAGRAM",
                    tiktok: "TIKTOK",
                    youtube: "YOUTUBE",
                };
                const plat = platformMap[def.id];
                const match = socialAccounts.find((s) => s.platform === plat && s.status !== "DISCONNECTED");
                if (match) {
                    isConnected = true;
                    status = match.status;
                    accountName = match.accountName;
                    accountId = match.id;
                }
            }
            return {
                id: def.id,
                name: def.name,
                category: def.category,
                description: def.description,
                icon: def.icon,
                isConnected,
                status,
                accountName,
                accountId,
                whatItEnables: def.whatItEnables,
            };
        });
    }
}
exports.MascotIntegrationOnboardingService = MascotIntegrationOnboardingService;
