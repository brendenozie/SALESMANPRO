import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { encode, decode } from "next-auth/jwt";
import { createHandoverToken } from "@/lib/auth/handover";
import { resolveUserDestination } from "@/lib/auth/destinationResolver";
import { HUB_URL } from "@/lib/auth/domain";
import { authenticatePOSOperator } from "@/lib/pos/posSessionService";
import { hashPOSCode } from "@/lib/pos/posStaffService";
import {
  issueDeviceOfflineGrant,
  getProvisionedStaffPinDigests,
  verifyRegisteredDeviceAccess,
} from "@/lib/sync/offlineGrantService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-device-id, x-client-platform, x-company-id, x-store-id",
};

function getAuthSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "default-salesmanpro-auth-secret-32-chars-min"
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/auth/app-login
 * Session validation & verification for desktop/mobile apps on restart
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing authorization token" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const decoded = await decode({
      token,
      secret: getAuthSecret(),
    });

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        companyId: true,
      },
    });

    if (!user || user.isActive === false) {
      return NextResponse.json(
        { success: false, message: "Account disabled or not found" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Resolve company and locations
    const requestedCompanyId = req.headers.get("x-company-id") || (decoded.companyId as string) || user.companyId;
    const company = await resolveUserCompany(user.id, requestedCompanyId);
    const stores = company ? await resolveCompanyStores(company.id) : [];
    const activeStoreId = req.headers.get("x-store-id") || stores[0]?.id || null;
    const deviceIdHeader = req.headers.get("x-device-id") || "";

    if (company?.id && deviceIdHeader) {
      const accessCheck = await verifyRegisteredDeviceAccess({
        companyId: company.id,
        deviceId: deviceIdHeader,
      });
      if (!accessCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            code: accessCheck.code || "DEVICE_REVOKED",
            message: accessCheck.reason || "Device access has been revoked",
            error: accessCheck.reason || "Device access has been revoked",
          },
          { status: 403, headers: CORS_HEADERS }
        );
      }
    }

    let offlineGrant: any = null;
    let staffPinDigests: any[] = [];
    if (company?.id) {
      try {
        const issued = await issueDeviceOfflineGrant({
          companyId: company.id,
          storeId: activeStoreId,
          deviceId: deviceIdHeader || `DEV_${user.id.slice(-6)}`,
          platform: req.headers.get("x-client-platform") || "HYBRID",
          userId: user.id,
          role: user.role || "STAFF",
        });
        offlineGrant = issued.grant;
        staffPinDigests = await getProvisionedStaffPinDigests(company.id);
      } catch (grantErr: any) {
        console.warn("[APP_AUTH_GRANT_REFRESH_WARN]", grantErr.message);
      }
    }

    // Fresh handover token for embedded WebViews
    const { token: handoverToken } = await createHandoverToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: company?.id || null,
      hasTenantAccess: true,
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        success: true,
        message: "Session is valid",
        expiresAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        company,
        stores,
        activeStoreId,
        handoverToken,
        offlineGrant,
        staffPinDigests,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[APP_AUTH_VERIFY_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Authentication validation failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/auth/app-login
 * Direct login for WPF Desktop and Android clients
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      email,
      password,
      loginCode,
      companyId,
      terminalId,
      deviceId,
      deviceName,
      platform,
      appVersion,
    } = body;

    // --- Mode 1: Staff / Educator / Student Login Code (Mobile & Desktop) ---
    const staffCode = (loginCode || body.staffLoginCode || "").toString().trim();
    if (staffCode) {
      const hashedCode = hashPOSCode(staffCode);
      let user: any = null;
      let resolvedCompany: any = null;
      let resolvedCompanyId: string | null = companyId || null;
      let role = "STAFF";
      let staffProfile: any = null;

      // 1. Check StaffProfile (POS Cashier / Operator / Manager)
      staffProfile = await prisma.staffProfile.findFirst({
        where: {
          OR: [
            { loginCode: staffCode },
            { codeHash: hashedCode },
          ],
        },
        include: {
          user: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              currency: true,
              logoUrl: true,
              address: true,
              contactPhone: true,
              contactEmail: true,
            },
          },
        },
      });

      if (staffProfile && staffProfile.user) {
        user = staffProfile.user;
        resolvedCompany = staffProfile.company;
        resolvedCompanyId = staffProfile.companyId;
        role = staffProfile.posRole || staffProfile.jobTitle || "CASHIER";
      }

      // 2. Check Educator / Teacher
      if (!user) {
        const educator = await prisma.educator.findFirst({
          where: { loginCode: staffCode },
          include: {
            user: true,
            Company: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                logoUrl: true,
                address: true,
                contactPhone: true,
                contactEmail: true,
              },
            },
          },
        });
        if (educator && educator.user) {
          user = educator.user;
          resolvedCompany = educator.Company;
          resolvedCompanyId = educator.companyId || educator.Company?.id || null;
          role = "TEACHER";
        }
      }

      // 3. Check Student
      if (!user) {
        const student = await prisma.student.findFirst({
          where: { loginCode: staffCode },
          include: {
            user: true,
            Company: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                logoUrl: true,
                address: true,
                contactPhone: true,
                contactEmail: true,
              },
            },
          },
        });
        if (student) {
          user = student.user || {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            email: `${student.loginCode}@student.salesmanpro.local`,
            role: "STUDENT",
            isActive: true,
          };
          resolvedCompany = student.Company;
          resolvedCompanyId = student.companyId || student.Company?.id || null;
          role = "STUDENT";
        }
      }

      // 4. Check HeadTeacher
      if (!user) {
        const headTeacher = await prisma.headTeacher.findFirst({
          where: { loginCode: staffCode },
          include: {
            user: true,
            Company: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                logoUrl: true,
                address: true,
                contactPhone: true,
                contactEmail: true,
              },
            },
          },
        });
        if (headTeacher && headTeacher.user) {
          user = headTeacher.user;
          resolvedCompany = headTeacher.Company;
          resolvedCompanyId = headTeacher.companyId || headTeacher.Company?.id || null;
          role = "HEAD_TEACHER";
        }
      }

      // 5. Check SalesAgent
      if (!user) {
        const agent = await prisma.salesAgent.findFirst({
          where: { loginCode: staffCode },
          include: {
            user: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                logoUrl: true,
                address: true,
                contactPhone: true,
                contactEmail: true,
              },
            },
          },
        });
        if (agent && agent.user) {
          user = agent.user;
          resolvedCompany = agent.company;
          resolvedCompanyId = agent.companyId || agent.company?.id || null;
          role = "AGENT";
        }
      }

      // 6. Check TransportDriver
      if (!user) {
        const driver = await prisma.transportDriver.findFirst({
          where: { loginCode: staffCode },
          include: {
            user: true,
            Company: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                logoUrl: true,
                address: true,
                contactPhone: true,
                contactEmail: true,
              },
            },
          },
        });
        if (driver && driver.user) {
          user = driver.user;
          resolvedCompany = driver.Company;
          resolvedCompanyId = driver.companyId || driver.Company?.id || null;
          role = "DRIVER";
        }
      }

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid login code. Please verify your PIN or contact your administrator.",
            error: "Invalid login code. Please verify your PIN or contact your administrator.",
          },
          { status: 401, headers: CORS_HEADERS }
        );
      }

      if (user.isActive === false) {
        return NextResponse.json(
          {
            success: false,
            message: "This account has been deactivated. Please contact your manager.",
            error: "This account has been deactivated. Please contact your manager.",
          },
          { status: 403, headers: CORS_HEADERS }
        );
      }

      // Resolve Company if not already populated
      if (!resolvedCompany && resolvedCompanyId) {
        resolvedCompany = await prisma.company.findUnique({
          where: { id: resolvedCompanyId },
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true,
            logoUrl: true,
            address: true,
            contactPhone: true,
            contactEmail: true,
          },
        });
      }

      if (!resolvedCompany) {
        resolvedCompany = await resolveUserCompany(user.id, user.companyId || resolvedCompanyId);
      }

      const effectiveCompanyId = resolvedCompany?.id || resolvedCompanyId || null;

      // Handle POS session if staff profile
      let activePosSession: any = null;
      if (staffProfile && effectiveCompanyId) {
        try {
          const posResult = await authenticatePOSOperator({
            companyId: effectiveCompanyId,
            loginCode: staffCode,
            terminalId: terminalId || "T01",
          });
          activePosSession = posResult.session;
        } catch (posErr: any) {
          console.warn("[POS_OPERATOR_AUTH_NON_BLOCKING]", posErr.message);
        }
      }

      const stores = effectiveCompanyId ? await resolveCompanyStores(effectiveCompanyId) : [];
      const activeStoreId = body.storeId || stores[0]?.id || null;

      let offlineGrant: any = null;
      let staffPinDigests: any[] = [];
      if (effectiveCompanyId) {
        const issued = await issueDeviceOfflineGrant({
          companyId: effectiveCompanyId,
          storeId: activeStoreId,
          deviceId: deviceId || terminalId || `DEV_${user.id.slice(-6)}`,
          deviceName: deviceName || `${platform || "POS"} - ${user.name || "Staff"}`,
          platform: platform || "POS",
          appVersion: appVersion || "2.4.0",
          protocolVersion: body.protocolVersion || 1,
          userId: user.id,
          role: role || user.role || "CASHIER",
          customPosPermissions: Array.isArray(staffProfile?.posPermissions) ? staffProfile.posPermissions : [],
        });
        offlineGrant = issued.grant;
        staffPinDigests = await getProvisionedStaffPinDigests(effectiveCompanyId);
      }

      const maxAgeSeconds = 30 * 24 * 60 * 60;
      const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();

      const sessionToken = await encode({
        token: {
          id: user.id,
          sub: user.id,
          name: user.name || "Operator",
          email: user.email || `${user.id}@salesmanpro.local`,
          role: user.role || role || "STAFF",
          companyId: effectiveCompanyId,
          terminalId: terminalId || "T01",
          sessionId: activePosSession?.id || null,
          hasTenantAccess: true,
        },
        secret: getAuthSecret(),
        maxAge: maxAgeSeconds,
      });

      const { token: handoverToken } = await createHandoverToken({
        id: user.id,
        name: user.name || "Operator",
        email: user.email,
        role: user.role || role || "STAFF",
        companyId: effectiveCompanyId,
        hasTenantAccess: true,
      });

      // Resolve server-side destination for native app routing
      const staffDestResult = await resolveUserDestination(
        { id: user.id, role: user.role || role, companyId: effectiveCompanyId, companySlug: resolvedCompany?.slug },
        { platform: platform || "ANDROID", activeStoreId }
      );
      const staffDestination = staffDestResult.destination;

      return NextResponse.json(
        {
          success: true,
          message: `${role} authenticated successfully`,
          token: sessionToken,
          accessToken: sessionToken,
          tokenType: "Bearer",
          expiresIn: maxAgeSeconds,
          expiresAt,
          handoverToken,
          offlineGrant,
          staffPinDigests,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || role,
            staffCode,
            loginCode: staffCode,
          },
          destination: staffDestination,
          company: resolvedCompany,
          stores,
          activeStoreId,
          posSession: activePosSession
            ? {
              id: activePosSession.id,
              terminalId: activePosSession.terminalId,
              status: activePosSession.status,
            }
            : null,
        },
        { headers: CORS_HEADERS }
      );
    }

    // --- Mode 2: Direct Email & Password Login ---
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both email and password", error: "Please provide both email and password" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password", error: "Invalid email or password" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: "This account has been deactivated. Please contact support.", error: "This account has been deactivated. Please contact support." },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password", error: "Invalid email or password" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Resolve company and locations
    const company = await resolveUserCompany(user.id, companyId || user.companyId);
    if (!company && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          code: "NO_STORE_ASSIGNED",
          message: "No store or company workspace is assigned to this account.",
          error: "No store or company workspace is assigned to this account.",
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const stores = company ? await resolveCompanyStores(company.id) : [];
    const activeStoreId = body.storeId || stores[0]?.id || null;

    let offlineGrant: any = null;
    let staffPinDigests: any[] = [];
    if (company?.id) {
      const issued = await issueDeviceOfflineGrant({
        companyId: company.id,
        storeId: activeStoreId,
        deviceId: deviceId || `DEV_${user.id.slice(-6)}`,
        deviceName: deviceName || `${platform || "Client"} - ${user.name || "POS"}`,
        platform: platform || "Desktop",
        appVersion: appVersion || "2.4.0",
        protocolVersion: body.protocolVersion || 1,
        userId: user.id,
        role: user.role || "ADMIN",
      });
      offlineGrant = issued.grant;
      staffPinDigests = await getProvisionedStaffPinDigests(company.id);
    }

    const maxAgeSeconds = 30 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();

    // Issue JWT App Session Token
    const sessionToken = await encode({
      token: {
        id: user.id,
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: company?.id || null,
        hasTenantAccess: true,
      },
      secret: getAuthSecret(),
      maxAge: maxAgeSeconds, // 30 days
    });

    // Create handover token for instant WebView loading without re-login
    const { token: handoverToken } = await createHandoverToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: company?.id || null,
      hasTenantAccess: true,
    });

    // Resolve server-side destination for native app routing
    const emailDestResult = await resolveUserDestination(
      { id: user.id, role: user.role, companyId: company?.id, companySlug: company?.slug },
      { platform: platform || "DESKTOP", activeStoreId }
    );
    const emailDestination = emailDestResult.destination;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token: sessionToken,
        accessToken: sessionToken,
        tokenType: "Bearer",
        expiresIn: maxAgeSeconds,
        expiresAt,
        handoverToken,
        offlineGrant,
        staffPinDigests,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        destination: emailDestination,
        company,
        stores,
        activeStoreId,
        device: {
          deviceId: deviceId || null,
          platform: platform || "Desktop",
          appVersion: appVersion || "1.0.0",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[APP_LOGIN_ERROR]", error);
    const errMsg = error.message || "An unexpected login error occurred";
    return NextResponse.json(
      { success: false, message: errMsg, error: errMsg },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

async function resolveUserCompany(userId: string, defaultCompanyId?: string | null) {
  if (defaultCompanyId) {
    const comp = await prisma.company.findUnique({
      where: { id: defaultCompanyId },
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        logoUrl: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
      },
    });
    if (comp) return comp;
  }

  // Look for company owned by user
  const owned = await prisma.company.findFirst({
    where: { userId },
    select: {
      id: true,
      name: true,
      slug: true,
      currency: true,
      logoUrl: true,
      address: true,
      contactPhone: true,
      contactEmail: true,
    },
  });
  if (owned) return owned;

  // Look for company via staff profile
  const staff = await prisma.staffProfile.findFirst({
    where: { userId, employmentStatus: "ACTIVE" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          logoUrl: true,
          address: true,
          contactPhone: true,
          contactEmail: true,
        },
      },
    },
  });
  if (staff?.company) return staff.company;

  // Check SalesAgent
  const agent = await prisma.salesAgent.findFirst({
    where: { userId, isActive: true },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          logoUrl: true,
          address: true,
          contactPhone: true,
          contactEmail: true,
        },
      },
    },
  });
  if (agent?.company) return agent.company;

  // SECURITY: Never fall back to an arbitrary tenant via prisma.company.findFirst()!
  return null;
}

async function resolveCompanyStores(companyId: string) {
  try {
    const companyLocations = await prisma.companyLocation.findMany({
      where: { companyId, visible: true },
      include: {
        location: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    if (companyLocations.length > 0) {
      return companyLocations.map((cl) => ({
        id: cl.id,
        name: cl.displayName || cl.location.name,
        address: cl.addressLine1Override || cl.location.address || "",
        city: cl.cityOverride || cl.location.city || "",
        phone: cl.location.phone || "",
      }));
    }

    // Default primary branch if no specific branch locations registered
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, address: true, contactPhone: true },
    });

    return [
      {
        id: `store_${companyId}`,
        name: `${company?.name || "Main"} Branch`,
        address: company?.address || "Main Store",
        city: "Main",
        phone: company?.contactPhone || "",
      },
    ];
  } catch (err) {
    console.error("[RESOLVE_STORES_ERROR]", err);
    return [
      {
        id: `store_${companyId}`,
        name: "Main Branch",
        address: "Head Office",
        city: "Default",
        phone: "",
      },
    ];
  }
}
