"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOfflineAuthGrant = exports.issueOfflineAuthGrant = exports.hashStaffPin = exports.verifyRegisteredDeviceAccess = exports.getProvisionedStaffPinDigests = exports.issueDeviceOfflineGrant = exports.verifyOfflineGrantToken = exports.signOfflineGrant = exports.buildDeviceReceiptPrefix = exports.resolvePermittedOfflineActions = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const posStaffService_1 = require("@/lib/pos/posStaffService");
function getSigningSecret() {
    const secret = process.env.OFFLINE_GRANT_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        process.env.JWT_SECRET ||
        "salesmanpro-offline-grant-signing-secret-v1";
    return secret;
}
function base64UrlEncode(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
function base64UrlDecode(input) {
    const padLength = (4 - (input.length % 4)) % 4;
    const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
    return Buffer.from(padded, "base64").toString("utf8");
}
function resolvePermittedOfflineActions(role, customPosPermissions) {
    const normalizedRole = (role || "CASHIER").toUpperCase();
    const baseActions = [
        "POS_SALE",
        "POS_CASH_TENDER",
        "POS_SPLIT_CASH_TENDER",
        "CUSTOMER_CREATE",
        "RECEIPT_PRINT",
        "RECEIPT_REPRINT",
        "SESSION_OPEN",
        "SESSION_CLOSE",
    ];
    if (normalizedRole === "ADMIN" ||
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "OWNER" ||
        normalizedRole === "MANAGER") {
        return [
            ...baseActions,
            "POS_DISCOUNT",
            "POS_RETURN",
            "INVENTORY_MOVEMENT",
            "EXPENSE_CREATE",
            "QUOTATION_CREATE",
            "INVOICE_CREATE",
        ];
    }
    const extra = new Set(baseActions);
    if (Array.isArray(customPosPermissions)) {
        for (const perm of customPosPermissions) {
            const upper = perm.toUpperCase();
            if (upper.includes("DISCOUNT"))
                extra.add("POS_DISCOUNT");
            if (upper.includes("RETURN") || upper.includes("REFUND"))
                extra.add("POS_RETURN");
            if (upper.includes("INVENTORY") || upper.includes("STOCK"))
                extra.add("INVENTORY_MOVEMENT");
            if (upper.includes("EXPENSE"))
                extra.add("EXPENSE_CREATE");
            if (upper.includes("QUOTATION"))
                extra.add("QUOTATION_CREATE");
            if (upper.includes("INVOICE"))
                extra.add("INVOICE_CREATE");
        }
    }
    return Array.from(extra);
}
exports.resolvePermittedOfflineActions = resolvePermittedOfflineActions;
function buildDeviceReceiptPrefix(storeId, deviceId) {
    const cleanStore = (storeId || "MAIN").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "MAIN";
    const cleanDevice = (deviceId || "DEV0").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "DEV0";
    return `OFF-${cleanStore}-${cleanDevice}`;
}
exports.buildDeviceReceiptPrefix = buildDeviceReceiptPrefix;
function signOfflineGrant(payload) {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "SMPRO-OFFLINE-GRANT", v: 1 }));
    const body = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${header}.${body}`;
    const signature = crypto_1.default
        .createHmac("sha256", getSigningSecret())
        .update(signingInput)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    return {
        token: `${signingInput}.${signature}`,
        payload,
        signature,
    };
}
exports.signOfflineGrant = signOfflineGrant;
function verifyOfflineGrantToken(token) {
    try {
        if (!token || typeof token !== "string") {
            return { valid: false, expired: false, reason: "Missing offline grant token" };
        }
        const parts = token.split(".");
        if (parts.length !== 3) {
            return { valid: false, expired: false, reason: "Malformed offline grant token" };
        }
        const [headerB64, bodyB64, signature] = parts;
        const signingInput = `${headerB64}.${bodyB64}`;
        const expectedSig = crypto_1.default
            .createHmac("sha256", getSigningSecret())
            .update(signingInput)
            .digest("base64")
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSig);
        if (sigBuffer.length !== expectedBuffer.length || !crypto_1.default.timingSafeEqual(sigBuffer, expectedBuffer)) {
            return { valid: false, expired: false, reason: "Invalid offline grant signature" };
        }
        const payload = JSON.parse(base64UrlDecode(bodyB64));
        const expiresAtMs = new Date(payload.expiresAt).getTime();
        if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
            return { valid: false, expired: true, reason: "Offline authorization grant has expired", payload };
        }
        return { valid: true, expired: false, payload };
    }
    catch (err) {
        return { valid: false, expired: false, reason: err?.message || "Failed to verify offline grant" };
    }
}
exports.verifyOfflineGrantToken = verifyOfflineGrantToken;
async function issueDeviceOfflineGrant(params) {
    const companySettings = await prismadb_1.default.companySettings
        .findUnique({
        where: { companyId: params.companyId },
    })
        .catch(() => null);
    const policyRaw = (companySettings?.offlineInventoryPolicy || "CONTROLLED").toUpperCase();
    const offlineStockPolicy = policyRaw === "STRICT" || policyRaw === "FLEXIBLE" ? policyRaw : "CONTROLLED";
    const ttlHours = Math.max(1, Math.min(720, Number(companySettings?.offlineGrantTtlHours || 168)));
    const offlineAllowanceBuffer = Number(companySettings?.offlineAllowanceBuffer ?? 5);
    const cleanDeviceId = (params.deviceId || `DEV_${params.userId.slice(-6)}`).trim();
    const effectiveStoreId = params.storeId || `store_${params.companyId}`;
    // Check if device Already exists and is REVOKED
    const existingDevice = await prismadb_1.default.registeredDevice
        .findUnique({
        where: {
            companyId_deviceId: {
                companyId: params.companyId,
                deviceId: cleanDeviceId,
            },
        },
    })
        .catch(() => null);
    if (existingDevice && existingDevice.status === "REVOKED") {
        throw new Error(`Device "${cleanDeviceId}" has been revoked by a store administrator (${existingDevice.revokeReason || "Access revoked"}).`);
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const grantId = `grant_${crypto_1.default.randomBytes(10).toString("hex")}`;
    const receiptPrefix = existingDevice?.receiptPrefix || buildDeviceReceiptPrefix(effectiveStoreId, cleanDeviceId);
    const normalizedRole = (params.role || "CASHIER").toUpperCase();
    const maxDiscountPercent = normalizedRole === "ADMIN" || normalizedRole === "OWNER" || normalizedRole === "MANAGER" || normalizedRole === "SUPER_ADMIN"
        ? 100
        : 15;
    const grantPayload = {
        grantId,
        companyId: params.companyId,
        storeId: effectiveStoreId,
        deviceId: cleanDeviceId,
        userId: params.userId,
        role: normalizedRole,
        permittedOfflineActions: resolvePermittedOfflineActions(normalizedRole, params.customPosPermissions),
        offlineStockPolicy,
        offlineAllowanceBuffer,
        maxDiscountPercent,
        receiptPrefix,
        issuedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        policyVersion: 1,
    };
    const signedGrant = signOfflineGrant(grantPayload);
    const registeredDevice = await prismadb_1.default.registeredDevice.upsert({
        where: {
            companyId_deviceId: {
                companyId: params.companyId,
                deviceId: cleanDeviceId,
            },
        },
        update: {
            storeId: effectiveStoreId,
            userId: params.userId,
            name: params.deviceName || existingDevice?.name || `${params.platform || "POS"} Terminal (${cleanDeviceId.slice(-6)})`,
            platform: (params.platform || existingDevice?.platform || "WEB").toUpperCase(),
            appVersion: params.appVersion || existingDevice?.appVersion || "2.4.0",
            protocolVersion: Number(params.protocolVersion || 1),
            offlineGrantId: grantId,
            offlineGrantExpiresAt: expiresAt,
            offlineStockPolicy,
            receiptPrefix,
            lastHeartbeatAt: now,
        },
        create: {
            companyId: params.companyId,
            storeId: effectiveStoreId,
            deviceId: cleanDeviceId,
            userId: params.userId,
            name: params.deviceName || `${params.platform || "POS"} Terminal (${cleanDeviceId.slice(-6)})`,
            platform: (params.platform || "WEB").toUpperCase(),
            appVersion: params.appVersion || "2.4.0",
            protocolVersion: Number(params.protocolVersion || 1),
            status: "ACTIVE",
            offlineGrantId: grantId,
            offlineGrantExpiresAt: expiresAt,
            offlineStockPolicy,
            receiptPrefix,
            lastHeartbeatAt: now,
        },
    });
    // Keep legacy prisma.device in sync for backward compatibility
    await prismadb_1.default.device
        .upsert({
        where: { apiKey: cleanDeviceId },
        update: {
            name: registeredDevice.name,
            companyId: params.companyId,
        },
        create: {
            apiKey: cleanDeviceId,
            name: registeredDevice.name,
            companyId: params.companyId,
        },
    })
        .catch(() => null);
    return {
        grant: signedGrant,
        registeredDevice,
    };
}
exports.issueDeviceOfflineGrant = issueDeviceOfflineGrant;
async function getProvisionedStaffPinDigests(companyId) {
    try {
        const staffProfiles = await prismadb_1.default.staffProfile.findMany({
            where: {
                companyId,
                employmentStatus: "ACTIVE",
                isPosActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
        const digests = [];
        for (const staff of staffProfiles) {
            if (staff.user?.isActive === false)
                continue;
            const pinSha256 = staff.codeHash ||
                (staff.loginCode ? (0, posStaffService_1.hashPOSCode)(staff.loginCode.trim()) : null);
            if (!pinSha256)
                continue;
            digests.push({
                staffProfileId: staff.id,
                userId: staff.userId,
                name: staff.user?.name || "Staff Operator",
                role: staff.posRole || staff.user?.role || "CASHIER",
                posPermissions: Array.isArray(staff.posPermissions) ? staff.posPermissions : [],
                pinSha256,
                isActive: true,
                expiresAt: staff.codeExpiresAt ? staff.codeExpiresAt.toISOString() : null,
            });
        }
        return digests;
    }
    catch (err) {
        console.warn("[PROVISION_STAFF_PINS_WARN]", err);
        return [];
    }
}
exports.getProvisionedStaffPinDigests = getProvisionedStaffPinDigests;
async function verifyRegisteredDeviceAccess(params) {
    const cleanDeviceId = (params.deviceId || "").trim();
    if (!cleanDeviceId) {
        return { allowed: false, device: null, reason: "deviceId is required", code: "TENANT_MISMATCH" };
    }
    const device = await prismadb_1.default.registeredDevice.findUnique({
        where: {
            companyId_deviceId: {
                companyId: params.companyId,
                deviceId: cleanDeviceId,
            },
        },
    });
    if (device) {
        if (device.status === "REVOKED") {
            return {
                allowed: false,
                device,
                reason: `Device ${cleanDeviceId} has been revoked (${device.revokeReason || "Revoked by administrator"})`,
                code: "DEVICE_REVOKED",
            };
        }
        if (device.status === "SUSPENDED") {
            return {
                allowed: false,
                device,
                reason: `Device ${cleanDeviceId} is suspended`,
                code: "DEVICE_SUSPENDED",
            };
        }
    }
    if (params.offlineGrantToken) {
        const verified = verifyOfflineGrantToken(params.offlineGrantToken);
        if (!verified.valid) {
            return {
                allowed: false,
                device,
                reason: verified.reason || "Invalid offline grant",
                code: verified.expired ? "GRANT_EXPIRED" : "TENANT_MISMATCH",
            };
        }
        if (verified.payload?.companyId !== params.companyId || verified.payload?.deviceId !== cleanDeviceId) {
            return {
                allowed: false,
                device,
                reason: "Offline grant tenant or device mismatch",
                code: "TENANT_MISMATCH",
            };
        }
    }
    return { allowed: true, device, code: "OK" };
}
exports.verifyRegisteredDeviceAccess = verifyRegisteredDeviceAccess;
function hashStaffPin(companyId, pin) {
    return crypto_1.default
        .createHash("sha256")
        .update(`${companyId}:${pin.trim()}`)
        .digest("hex");
}
exports.hashStaffPin = hashStaffPin;
function issueOfflineAuthGrant(params) {
    const now = new Date();
    const ttlHours = params.ttlHours ?? 72;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const storeId = params.storeId || `store_${params.companyId}`;
    const payload = {
        grantId: `grant_${crypto_1.default.randomBytes(8).toString("hex")}`,
        companyId: params.companyId,
        storeId,
        deviceId: params.deviceId,
        userId: params.userId,
        role: params.role,
        permittedOfflineActions: resolvePermittedOfflineActions(params.role),
        offlineStockPolicy: params.offlineStockPolicy || "CONTROLLED",
        offlineAllowanceBuffer: params.offlineAllowanceBuffer ?? 5,
        maxDiscountPercent: 15,
        receiptPrefix: buildDeviceReceiptPrefix(storeId, params.deviceId),
        issuedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        policyVersion: 1,
    };
    const signed = signOfflineGrant(payload);
    return {
        ...payload,
        signature: signed.signature,
        token: signed.token,
    };
}
exports.issueOfflineAuthGrant = issueOfflineAuthGrant;
function verifyOfflineAuthGrant(grant, expectedCompanyId, expectedDeviceId) {
    if (typeof grant === "string") {
        const res = verifyOfflineGrantToken(grant);
        if (!res.valid)
            return { valid: false, reason: res.reason };
        if (expectedCompanyId && res.payload?.companyId !== expectedCompanyId) {
            return { valid: false, reason: "Tenant mismatch" };
        }
        if (expectedDeviceId && res.payload?.deviceId !== expectedDeviceId) {
            return { valid: false, reason: "Device mismatch" };
        }
        return { valid: true };
    }
    const { signature, ...rest } = grant;
    delete rest.token;
    const expectedSigned = signOfflineGrant(rest);
    if (expectedSigned.signature !== signature) {
        return { valid: false, reason: "Invalid offline grant signature" };
    }
    const expiresAtMs = new Date(grant.expiresAt).getTime();
    if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
        return { valid: false, reason: "Offline authorization grant has expired" };
    }
    if (expectedCompanyId && grant.companyId !== expectedCompanyId) {
        return { valid: false, reason: "Tenant mismatch" };
    }
    if (expectedDeviceId && grant.deviceId !== expectedDeviceId) {
        return { valid: false, reason: "Device mismatch" };
    }
    return { valid: true };
}
exports.verifyOfflineAuthGrant = verifyOfflineAuthGrant;
