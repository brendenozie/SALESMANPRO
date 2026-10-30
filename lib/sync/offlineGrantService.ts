import crypto from "crypto";
import prisma from "@/server/db/prismadb";
import { hashPOSCode } from "@/lib/pos/posSessionService";

export type OfflineStockPolicy = "STRICT" | "CONTROLLED" | "FLEXIBLE";

export type OfflinePermittedAction =
  | "POS_SALE"
  | "POS_CASH_TENDER"
  | "POS_SPLIT_CASH_TENDER"
  | "POS_DISCOUNT"
  | "POS_RETURN"
  | "CUSTOMER_CREATE"
  | "INVENTORY_MOVEMENT"
  | "EXPENSE_CREATE"
  | "QUOTATION_CREATE"
  | "INVOICE_CREATE"
  | "RECEIPT_PRINT"
  | "RECEIPT_REPRINT"
  | "SESSION_OPEN"
  | "SESSION_CLOSE";

export interface OfflineAuthGrantPayload {
  grantId: string;
  companyId: string;
  storeId: string;
  deviceId: string;
  userId: string;
  role: string;
  permittedOfflineActions: OfflinePermittedAction[];
  offlineStockPolicy: OfflineStockPolicy;
  offlineAllowanceBuffer: number;
  maxDiscountPercent: number;
  receiptPrefix: string;
  issuedAt: string;
  expiresAt: string;
  policyVersion: number;
}

export interface SignedOfflineAuthGrant {
  token: string;
  payload: OfflineAuthGrantPayload;
  signature: string;
}

export interface ProvisionedStaffPinDigest {
  staffProfileId: string;
  userId: string;
  name: string;
  role: string;
  posPermissions: string[];
  pinSha256: string;
  isActive: boolean;
  expiresAt: string | null;
}

function getSigningSecret(): string {
  const secret =
    process.env.OFFLINE_GRANT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    "salesmanpro-offline-grant-signing-secret-v1";
  return secret;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function resolvePermittedOfflineActions(role: string, customPosPermissions?: string[]): OfflinePermittedAction[] {
  const normalizedRole = (role || "CASHIER").toUpperCase();
  const baseActions: OfflinePermittedAction[] = [
    "POS_SALE",
    "POS_CASH_TENDER",
    "POS_SPLIT_CASH_TENDER",
    "CUSTOMER_CREATE",
    "RECEIPT_PRINT",
    "RECEIPT_REPRINT",
    "SESSION_OPEN",
    "SESSION_CLOSE",
  ];

  if (
    normalizedRole === "ADMIN" ||
    normalizedRole === "SUPER_ADMIN" ||
    normalizedRole === "OWNER" ||
    normalizedRole === "MANAGER"
  ) {
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

  const extra = new Set<OfflinePermittedAction>(baseActions);
  if (Array.isArray(customPosPermissions)) {
    for (const perm of customPosPermissions) {
      const upper = perm.toUpperCase();
      if (upper.includes("DISCOUNT")) extra.add("POS_DISCOUNT");
      if (upper.includes("RETURN") || upper.includes("REFUND")) extra.add("POS_RETURN");
      if (upper.includes("INVENTORY") || upper.includes("STOCK")) extra.add("INVENTORY_MOVEMENT");
      if (upper.includes("EXPENSE")) extra.add("EXPENSE_CREATE");
      if (upper.includes("QUOTATION")) extra.add("QUOTATION_CREATE");
      if (upper.includes("INVOICE")) extra.add("INVOICE_CREATE");
    }
  }

  return Array.from(extra);
}

export function buildDeviceReceiptPrefix(storeId: string, deviceId: string): string {
  const cleanStore = (storeId || "MAIN").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "MAIN";
  const cleanDevice = (deviceId || "DEV0").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "DEV0";
  return `OFF-${cleanStore}-${cleanDevice}`;
}

export function signOfflineGrant(payload: OfflineAuthGrantPayload): SignedOfflineAuthGrant {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "SMPRO-OFFLINE-GRANT", v: 1 }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = crypto
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

export function verifyOfflineGrantToken(token: string): {
  valid: boolean;
  expired: boolean;
  reason?: string;
  payload?: OfflineAuthGrantPayload;
} {
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
    const expectedSig = crypto
      .createHmac("sha256", getSigningSecret())
      .update(signingInput)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, expired: false, reason: "Invalid offline grant signature" };
    }

    const payload = JSON.parse(base64UrlDecode(bodyB64)) as OfflineAuthGrantPayload;
    const expiresAtMs = new Date(payload.expiresAt).getTime();
    if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
      return { valid: false, expired: true, reason: "Offline authorization grant has expired", payload };
    }

    return { valid: true, expired: false, payload };
  } catch (err: any) {
    return { valid: false, expired: false, reason: err?.message || "Failed to verify offline grant" };
  }
}

export async function issueDeviceOfflineGrant(params: {
  companyId: string;
  storeId?: string | null;
  deviceId: string;
  deviceName?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  protocolVersion?: number | null;
  userId: string;
  role: string;
  customPosPermissions?: string[];
}): Promise<{
  grant: SignedOfflineAuthGrant;
  registeredDevice: any;
}> {
  const companySettings = await prisma.companySettings
    .findUnique({
      where: { companyId: params.companyId },
    })
    .catch(() => null);

  const policyRaw = (companySettings?.offlineInventoryPolicy || "CONTROLLED").toUpperCase();
  const offlineStockPolicy: OfflineStockPolicy =
    policyRaw === "STRICT" || policyRaw === "FLEXIBLE" ? policyRaw : "CONTROLLED";

  const ttlHours = Math.max(1, Math.min(720, Number(companySettings?.offlineGrantTtlHours || 168)));
  const offlineAllowanceBuffer = Number(companySettings?.offlineAllowanceBuffer ?? 5);

  const cleanDeviceId = (params.deviceId || `DEV_${params.userId.slice(-6)}`).trim();
  const effectiveStoreId = params.storeId || `store_${params.companyId}`;

  // Check if device Already exists and is REVOKED
  const existingDevice = await prisma.registeredDevice
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
    throw new Error(
      `Device "${cleanDeviceId}" has been revoked by a store administrator (${existingDevice.revokeReason || "Access revoked"}).`
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
  const grantId = `grant_${crypto.randomBytes(10).toString("hex")}`;
  const receiptPrefix = existingDevice?.receiptPrefix || buildDeviceReceiptPrefix(effectiveStoreId, cleanDeviceId);

  const normalizedRole = (params.role || "CASHIER").toUpperCase();
  const maxDiscountPercent =
    normalizedRole === "ADMIN" || normalizedRole === "OWNER" || normalizedRole === "MANAGER" || normalizedRole === "SUPER_ADMIN"
      ? 100
      : 15;

  const grantPayload: OfflineAuthGrantPayload = {
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

  const registeredDevice = await prisma.registeredDevice.upsert({
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
  await prisma.device
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

export async function getProvisionedStaffPinDigests(companyId: string): Promise<ProvisionedStaffPinDigest[]> {
  try {
    const staffProfiles = await prisma.staffProfile.findMany({
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

    const digests: ProvisionedStaffPinDigest[] = [];
    for (const staff of staffProfiles) {
      if (staff.user?.isActive === false) continue;
      const pinSha256 =
        staff.codeHash ||
        (staff.loginCode ? hashPOSCode(staff.loginCode.trim()) : null);
      if (!pinSha256) continue;

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
  } catch (err) {
    console.warn("[PROVISION_STAFF_PINS_WARN]", err);
    return [];
  }
}

export async function verifyRegisteredDeviceAccess(params: {
  companyId: string;
  deviceId: string;
  offlineGrantToken?: string | null;
}): Promise<{
  allowed: boolean;
  device: any | null;
  reason?: string;
  code?: "DEVICE_REVOKED" | "DEVICE_SUSPENDED" | "GRANT_EXPIRED" | "TENANT_MISMATCH" | "OK";
}> {
  const cleanDeviceId = (params.deviceId || "").trim();
  if (!cleanDeviceId) {
    return { allowed: false, device: null, reason: "deviceId is required", code: "TENANT_MISMATCH" };
  }

  const device = await prisma.registeredDevice.findUnique({
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

export function hashStaffPin(companyId: string, pin: string): string {
  return crypto
    .createHash("sha256")
    .update(`${companyId}:${pin.trim()}`)
    .digest("hex");
}

export function issueOfflineAuthGrant(params: {
  companyId: string;
  storeId?: string;
  deviceId: string;
  userId: string;
  role: string;
  ttlHours?: number;
  offlineStockPolicy?: OfflineStockPolicy;
  offlineAllowanceBuffer?: number;
}): OfflineAuthGrantPayload & { signature: string; token: string } {
  const now = new Date();
  const ttlHours = params.ttlHours ?? 72;
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
  const storeId = params.storeId || `store_${params.companyId}`;
  const payload: OfflineAuthGrantPayload = {
    grantId: `grant_${crypto.randomBytes(8).toString("hex")}`,
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

export function verifyOfflineAuthGrant(
  grant: (OfflineAuthGrantPayload & { signature: string }) | string,
  expectedCompanyId?: string,
  expectedDeviceId?: string
): { valid: boolean; reason?: string } {
  if (typeof grant === "string") {
    const res = verifyOfflineGrantToken(grant);
    if (!res.valid) return { valid: false, reason: res.reason };
    if (expectedCompanyId && res.payload?.companyId !== expectedCompanyId) {
      return { valid: false, reason: "Tenant mismatch" };
    }
    if (expectedDeviceId && res.payload?.deviceId !== expectedDeviceId) {
      return { valid: false, reason: "Device mismatch" };
    }
    return { valid: true };
  }

  const { signature, ...rest } = grant as any;
  delete rest.token;
  const expectedSigned = signOfflineGrant(rest as OfflineAuthGrantPayload);
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

