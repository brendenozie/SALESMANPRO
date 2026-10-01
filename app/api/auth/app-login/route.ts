import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { encode, decode } from "next-auth/jwt";
import { createHandoverToken } from "@/lib/auth/handover";
import { HUB_URL } from "@/lib/auth/domain";
import { authenticatePOSOperator } from "@/lib/pos/posSessionService";
import { hashPOSCode } from "@/lib/pos/posStaffService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-device-id, x-client-platform",
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
    const company = await resolveUserCompany(user.id, user.companyId);
    const stores = company ? await resolveCompanyStores(company.id) : [];

    // Fresh handover token for embedded WebViews
    const { token: handoverToken } = await createHandoverToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: company?.id || null,
      hasTenantAccess: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Session is valid",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        company,
        stores,
        activeStoreId: stores[0]?.id || null,
        handoverToken,
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
        if (agent && agent.user) {
          user = agent.user;
          resolvedCompany = agent.Company;
          resolvedCompanyId = agent.companyId || agent.Company?.id || null;
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
        maxAge: 30 * 24 * 60 * 60,
      });

      const { token: handoverToken } = await createHandoverToken({
        id: user.id,
        name: user.name || "Operator",
        email: user.email,
        role: user.role || role || "STAFF",
        companyId: effectiveCompanyId,
        hasTenantAccess: true,
      });

      return NextResponse.json(
        {
          success: true,
          message: `${role} authenticated successfully`,
          token: sessionToken,
          handoverToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || role,
            staffCode,
            loginCode: staffCode,
          },
          company: resolvedCompany,
          stores,
          activeStoreId: stores[0]?.id || null,
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
    const company = await resolveUserCompany(user.id, user.companyId);
    const stores = company ? await resolveCompanyStores(company.id) : [];

    // Optional device registration
    if (deviceId && company?.id) {
      try {
        await prisma.device.upsert({
          where: { apiKey: deviceId },
          update: {
            name: deviceName || `${platform || "Client"} - ${user.name || "POS"}`,
            companyId: company.id,
          },
          create: {
            apiKey: deviceId,
            name: deviceName || `${platform || "Client"} - ${user.name || "POS"}`,
            companyId: company.id,
          },
        });
      } catch (devErr) {
        console.warn("[DEVICE_REGISTRATION_WARNING]", devErr);
      }
    }

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
      maxAge: 30 * 24 * 60 * 60, // 30 days
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

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token: sessionToken,
        handoverToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        company,
        stores,
        activeStoreId: stores[0]?.id || null,
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
    where: { userId },
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

  // Fallback to first available company
  return prisma.company.findFirst({
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
