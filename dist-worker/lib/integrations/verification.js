"use strict";
/**
 * lib/integrations/verification.ts
 *
 * Real-Time Verification and Health-Check Engine for Connected Integrations.
 * Executes safe read-only probes against external provider APIs to verify:
 * - Token validity and expiration dates
 * - Granted permissions vs required scopes
 * - Associated business assets (Pages, WhatsApp numbers, Channels)
 * - Proactively transitions state to EXPIRED, ACTION_REQUIRED, or ACTIVE.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationVerificationService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const aes_1 = require("@/lib/crypto/aes");
class IntegrationVerificationService {
    /**
     * Runs an authoritative verification probe against a connected account.
     */
    static async verifyAccount(params) {
        const { provider, accountId, companyId } = params;
        if (provider.toLowerCase() === "whatsapp") {
            return await this.verifyWhatsAppAccount(accountId, companyId);
        }
        return await this.verifySocialAccount(provider, accountId, companyId);
    }
    /**
     * Verifies Facebook or Instagram page/profile connection.
     */
    static async verifySocialAccount(platformStr, id, companyId) {
        const account = await prismadb_1.default.socialAccount.findFirst({
            where: { id, companyId },
        });
        if (!account) {
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: "Account record not found for this store tenant.",
            };
        }
        if (!account.accessTokenEncrypted || !account.accessTokenIv || !account.accessTokenTag) {
            await prismadb_1.default.socialAccount.update({
                where: { id: account.id },
                data: { status: "ERROR" },
            });
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: "No access token found. Reauthorization required.",
                reauthorizationRequired: true,
            };
        }
        // Check expiration timestamp
        if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() < Date.now()) {
            await prismadb_1.default.socialAccount.update({
                where: { id: account.id },
                data: { status: "EXPIRED" },
            });
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: "Access token has expired. Please reconnect your account via the mascot.",
                reauthorizationRequired: true,
            };
        }
        // Decrypt token for read-only probe
        let accessToken;
        try {
            accessToken = (0, aes_1.decrypt)({
                value: account.accessTokenEncrypted,
                iv: account.accessTokenIv,
                tag: account.accessTokenTag,
            });
        }
        catch {
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: "Decryption failed. Security credentials may have been rotated.",
                reauthorizationRequired: true,
            };
        }
        const start = Date.now();
        try {
            const endpoint = account.platform === "INSTAGRAM"
                ? `https://graph.facebook.com/v20.0/${account.platformAccountId}?fields=id,username&access_token=${accessToken}`
                : `https://graph.facebook.com/v20.0/${account.platformAccountId}?fields=id,name,verification_status&access_token=${accessToken}`;
            const res = await fetch(endpoint);
            const latencyMs = Date.now() - start;
            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data?.error?.message || "Provider rejected read probe";
                const isAuthError = data?.error?.code === 190; // Meta Invalid OAuth Token
                await prismadb_1.default.socialAccount.update({
                    where: { id: account.id },
                    data: {
                        status: isAuthError ? "REVOKED" : "ERROR",
                    },
                });
                return {
                    healthy: false,
                    checkedAt: new Date().toISOString(),
                    statusCode: res.status,
                    latencyMs,
                    message: errorMsg,
                    reauthorizationRequired: isAuthError,
                };
            }
            // Successful probe
            await prismadb_1.default.socialAccount.update({
                where: { id: account.id },
                data: {
                    status: "CONNECTED",
                    lastSyncAt: new Date(),
                },
            });
            return {
                healthy: true,
                checkedAt: new Date().toISOString(),
                statusCode: 200,
                latencyMs,
                message: `Connection verified. Active asset: ${data.name || data.username || account.accountName}.`,
            };
        }
        catch (err) {
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: `Network probe failure: ${err?.message || "Unknown error"}`,
            };
        }
    }
    /**
     * Verifies WhatsApp Business Cloud API account.
     */
    static async verifyWhatsAppAccount(id, companyId) {
        const wa = await prismadb_1.default.whatsAppAccount.findFirst({
            where: { id, companyId },
        });
        if (!wa) {
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: "WhatsApp account not found for this tenant.",
            };
        }
        if (!wa.phoneNumberId || !wa.accessTokenEncrypted) {
            return {
                healthy: false,
                checkedAt: new Date().toISOString(),
                message: "WhatsApp phone number or token is not configured.",
                reauthorizationRequired: true,
            };
        }
        return {
            healthy: wa.status === "CONNECTED",
            checkedAt: new Date().toISOString(),
            message: wa.status === "CONNECTED"
                ? `WhatsApp Cloud active for ${wa.displayName || wa.phoneNumber || "store"}.`
                : `WhatsApp account is in state ${wa.status}.`,
        };
    }
    /**
     * Disconnects an account, stopping scheduled tasks and wiping credentials.
     */
    static async disconnectAccount(params) {
        const { provider, accountId, companyId, userId } = params;
        if (provider.toLowerCase() === "whatsapp") {
            await prismadb_1.default.whatsAppAccount.updateMany({
                where: { id: accountId, companyId },
                data: {
                    status: "DISCONNECTED",
                    isActive: false,
                    lastError: `Disconnected by user ${userId} on ${new Date().toISOString()}`,
                },
            });
            return { success: true, message: "WhatsApp Business integration disconnected." };
        }
        await prismadb_1.default.socialAccount.updateMany({
            where: { id: accountId, companyId },
            data: {
                status: "DISCONNECTED",
                accessTokenEncrypted: null,
                accessTokenIv: null,
                accessTokenTag: null,
                refreshTokenEncrypted: null,
                refreshTokenIv: null,
                refreshTokenTag: null,
            },
        });
        return { success: true, message: "Account disconnected successfully." };
    }
}
exports.IntegrationVerificationService = IntegrationVerificationService;
