/**
 * lib/integrations/onboarding.ts
 *
 * Mascot-Led Integration Onboarding Engine for SalesmanPro.
 * Translates complex OAuth handshakes and API requirements into human-friendly,
 * role-aware conversational steps for store owners and staff.
 */

import prisma from "@/server/db/prismadb";
import { IntegrationRegistry } from "./registry";
import { IntegrationOAuthService } from "./oauth";
import {
  MascotOnboardingGuide,
  MascotOnboardingStep,
  IntegrationStatus,
} from "./types";

export class MascotIntegrationOnboardingService {
  /**
   * Generates a step-by-step onboarding guide for any supported provider.
   */
  public static async getOnboardingGuide(params: {
    providerId: string;
    companyId: string;
    userRole: string;
    userId: string;
    storeSlug?: string;
    origin: string;
  }): Promise<MascotOnboardingGuide> {
    const { providerId, companyId, userRole, userId, storeSlug, origin } = params;
    const def = IntegrationRegistry.getDefinition(providerId);

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
    const isPlatformReady = await IntegrationRegistry.isPlatformConfigured(providerId);

    // Check current connection status in database
    const existingConnection = await this.findExistingConnection(providerId, companyId);
    const status: IntegrationStatus = existingConnection ? (existingConnection.status as any) : "NOT_CONNECTED";

    const prerequisites = def.prerequisites.map((p, idx) => ({
      name: p,
      satisfied: idx === 1 ? isPlatformReady : true, // Index 1 is platform app config
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
      const steps: MascotOnboardingStep[] = [
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
    let connectUrl: string | undefined;
    if (def.oauthSupported) {
      try {
        const auth = await IntegrationOAuthService.buildAuthorizationUrl({
          providerId,
          companyId,
          userId,
          origin,
          redirectPath: `/admin/${storeSlug || "store"}/mascot/integrations`,
        });
        connectUrl = auth.url;
      } catch (err: any) {
        console.warn(`[MASCOT_ONBOARDING] Could not build auth URL for ${providerId}:`, err.message);
      }
    }

    const steps: MascotOnboardingStep[] = [
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
  private static async findExistingConnection(providerId: string, companyId: string) {
    if (providerId === "whatsapp") {
      const wa = await prisma.whatsappAccount.findFirst({
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

    const platformMap: Record<string, any> = {
      facebook: "FACEBOOK",
      instagram: "INSTAGRAM",
      tiktok: "TIKTOK",
      youtube: "YOUTUBE",
    };

    const platform = platformMap[providerId.toLowerCase()];
    if (!platform) return null;

    const account = await prisma.socialAccount.findFirst({
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
  public static async getStoreIntegrationsOverview(companyId: string) {
    const definitions = IntegrationRegistry.getAllDefinitions();
    const socialAccounts = await prisma.socialAccount.findMany({
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

    const whatsappAccounts = await prisma.whatsappAccount.findMany({
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
      let status: IntegrationStatus = "NOT_CONNECTED";
      let accountName: string | undefined;
      let accountId: string | undefined;

      if (def.id === "whatsapp") {
        const wa = whatsappAccounts.find((a) => a.status !== "DISCONNECTED");
        if (wa) {
          isConnected = true;
          status = wa.status as any;
          accountName = wa.displayName || wa.phoneNumber || "WhatsApp Cloud";
          accountId = wa.id;
        }
      } else {
        const platformMap: Record<string, string> = {
          facebook: "FACEBOOK",
          instagram: "INSTAGRAM",
          tiktok: "TIKTOK",
          youtube: "YOUTUBE",
        };
        const plat = platformMap[def.id];
        const match = socialAccounts.find((s) => s.platform === plat && s.status !== "DISCONNECTED");
        if (match) {
          isConnected = true;
          status = match.status as any;
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
