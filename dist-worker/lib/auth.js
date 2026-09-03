"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthSession = exports.authOptions = void 0;
const prisma_adapter_1 = require("@next-auth/prisma-adapter");
const next_1 = require("next-auth/next");
const google_1 = __importDefault(require("next-auth/providers/google"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const crypto_1 = require("crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const handover_1 = require("@/lib/auth/handover");
const authorization_1 = require("@/lib/auth/authorization");
const context_1 = require("@/lib/auth/context");
const domain_1 = require("@/lib/auth/domain");
const provision_1 = require("@/lib/auth/provision");
const verification_1 = require("@/lib/auth/verification");
function getSharedSecret() {
    return (process.env.NEXTAUTH_SECRET ||
        process.env.AUTH_SECRET ||
        "default-salesmanpro-auth-secret-32-chars-min");
}
function createResilientPrismaAdapter(p) {
    const baseAdapter = (0, prisma_adapter_1.PrismaAdapter)(p);
    return {
        ...baseAdapter,
        async getUserByAccount(provider_providerAccountId) {
            const account = await p.account.findUnique({
                where: { provider_providerAccountId },
                include: { user: true },
            });
            if (!account)
                return null;
            if (!account.user) {
                // Purge orphan account whose User row was deleted so re-linking succeeds
                await p.account.delete({ where: { id: account.id } }).catch(() => null);
                return null;
            }
            return account.user;
        },
        async linkAccount(data) {
            // Use upsert to avoid duplicate key error P2002 if an existing/orphan account record was present
            return p.account.upsert({
                where: {
                    provider_providerAccountId: {
                        provider: data.provider,
                        providerAccountId: data.providerAccountId,
                    },
                },
                update: {
                    userId: data.userId,
                    type: data.type,
                    refresh_token: data.refresh_token,
                    access_token: data.access_token,
                    expires_at: data.expires_at,
                    token_type: data.token_type,
                    scope: data.scope,
                    id_token: data.id_token,
                    session_state: data.session_state,
                },
                create: {
                    ...data,
                },
            });
        },
    };
}
async function findExistingUserByEmail(email) {
    return prismadb_1.default.user.findUnique({
        where: { email: email.trim().toLowerCase() },
    });
}
async function findUserByLoginCode(loginCode) {
    const student = await prismadb_1.default.student.findUnique({
        where: { loginCode },
        include: { user: true },
    });
    if (student)
        return { user: student.user, role: student.levelStatus || "STUDENT" };
    const educator = await prismadb_1.default.educator.findUnique({
        where: { loginCode },
        include: { user: true },
    });
    if (educator)
        return { user: educator.user, role: "EDUCATOR" };
    const consumer = await prismadb_1.default.consumer.findUnique({
        where: { loginCode },
        include: { user: true },
    });
    if (consumer)
        return { user: consumer.user, role: consumer.user.role || "USER" };
    const salesAgent = await prismadb_1.default.salesAgent.findUnique({
        where: { loginCode },
        include: { user: true },
    });
    if (salesAgent)
        return { user: salesAgent.user, role: "AGENT" };
    const driver = await prismadb_1.default.transportDriver.findUnique({
        where: { loginCode },
        include: { user: true },
    });
    if (driver)
        return { user: driver.user, role: driver.user.role };
    const parent = await prismadb_1.default.parent.findUnique({
        where: { loginCode },
        include: { user: true },
    });
    if (parent)
        return { user: parent.user, role: "PARENT" };
    return null;
}
async function resolveHasTenantAccess(userId, role, companyId) {
    if ((0, authorization_1.canAccessDashboard)({ role, companyId, emailVerified: true, isActive: true })) {
        return true;
    }
    const [owned, staff] = await Promise.all([
        prismadb_1.default.company.findFirst({ where: { userId }, select: { id: true } }),
        prismadb_1.default.staffProfile.findUnique({ where: { userId }, select: { id: true } }),
    ]);
    return !!(owned || staff);
}
async function resolveFlowContext(opts) {
    const fromCookie = await (0, context_1.readAuthContextFromCookieHeader)(opts.cookieHeader);
    if (fromCookie)
        return fromCookie;
    // Fallback: check next-auth callback-url cookie if present
    if (opts.cookieHeader) {
        const parts = opts.cookieHeader.split(";").map((p) => p.trim());
        const match = parts.find((p) => p.startsWith("__Secure-next-auth.callback-url=") ||
            p.startsWith("next-auth.callback-url="));
        if (match) {
            const rawVal = match.split("=").slice(1).join("=");
            if (rawVal) {
                try {
                    const decodedVal = decodeURIComponent(rawVal);
                    const resolved = await (0, context_1.resolveReturnContext)(decodedVal);
                    if (resolved)
                        return resolved;
                }
                catch { }
            }
        }
    }
    if (opts.requestUrl) {
        try {
            const url = new URL(opts.requestUrl);
            const callbackUrl = url.searchParams.get("callbackUrl") || url.searchParams.get("target");
            const resolved = await (0, context_1.resolveReturnContext)(callbackUrl);
            if (resolved)
                return resolved;
        }
        catch {
            /* ignore */
        }
    }
    return null;
}
function sessionUserFromDb(user) {
    return {
        id: user.id,
        name: user.name ?? undefined,
        email: user.email,
        role: (user.role || "USER"),
        phone: user.phone ?? undefined,
        username: user.username ?? undefined,
        bio: user.bio ?? undefined,
        address: user.address ?? undefined,
        profilePicture: user.profilePicture ?? user.image ?? undefined,
        emailVerified: user.emailVerified,
        isActive: user.isActive !== false,
        companyId: user.companyId ?? undefined,
        hasTenantAccess: user.hasTenantAccess,
    };
}
const authOptions = (ctx = {}) => {
    const requestCtx = typeof ctx === "string" ? { host: ctx } : ctx || {};
    const secret = getSharedSecret();
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return {
        adapter: createResilientPrismaAdapter(prismadb_1.default),
        providers: [
            (0, credentials_1.default)({
                id: "token-signin",
                name: "Token Sign-In",
                credentials: {
                    token: { label: "Token", type: "text" },
                },
                async authorize(credentials, req) {
                    if (!credentials?.token)
                        return null;
                    try {
                        const rawReqHost = typeof req?.headers?.get === "function"
                            ? req.headers.get("host")
                            : req?.headers?.host;
                        const expectedHost = (0, domain_1.normalizeHost)(rawReqHost || requestCtx.host || "");
                        const decodedToken = await (0, handover_1.consumeHandoverToken)(credentials.token, expectedHost);
                        if (!decodedToken || !decodedToken.email)
                            return null;
                        return {
                            id: decodedToken.id,
                            name: decodedToken.name ?? null,
                            email: decodedToken.email,
                            image: decodedToken.image ?? null,
                            role: decodedToken.role ?? undefined,
                            emailVerified: typeof decodedToken.emailVerified === "boolean" ? decodedToken.emailVerified : null,
                            companyId: decodedToken.companyId ?? null,
                            hasTenantAccess: Boolean(decodedToken.hasTenantAccess),
                        };
                    }
                    catch {
                        return null;
                    }
                },
            }),
            (0, credentials_1.default)({
                id: "credentials-email-password",
                name: "Email & Password",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password)
                        return null;
                    const userFoundInDb = await findExistingUserByEmail(credentials.email);
                    if (!userFoundInDb || !userFoundInDb.password)
                        return null;
                    if (userFoundInDb.isActive === false)
                        return null;
                    const passwordMatch = await bcryptjs_1.default.compare(credentials.password, userFoundInDb.password);
                    if (!passwordMatch)
                        return null;
                    const hasTenantAccess = await resolveHasTenantAccess(userFoundInDb.id, userFoundInDb.role, userFoundInDb.companyId);
                    const flow = await resolveFlowContext(requestCtx);
                    await (0, provision_1.applyLoginContext)(userFoundInDb.id, flow);
                    return sessionUserFromDb({ ...userFoundInDb, hasTenantAccess });
                },
            }),
            (0, credentials_1.default)({
                id: "school-code-login",
                name: "School Login Code",
                credentials: {
                    loginCode: { label: "School Login Code", type: "text" },
                },
                async authorize(credentials) {
                    if (!credentials?.loginCode)
                        return null;
                    if (credentials.loginCode.length !== 6 ||
                        !/^\d+$/.test(credentials.loginCode))
                        return null;
                    const loginCodeResult = await findUserByLoginCode(credentials.loginCode);
                    if (!loginCodeResult || !loginCodeResult.user)
                        return null;
                    const user = loginCodeResult.user;
                    if (user.isActive === false)
                        return null;
                    const hasTenantAccess = await resolveHasTenantAccess(user.id, loginCodeResult.role || user.role, user.companyId);
                    return sessionUserFromDb({
                        ...user,
                        role: loginCodeResult.role || user.role,
                        hasTenantAccess,
                    });
                },
            }),
            ...(googleClientId && googleClientSecret
                ? [
                    (0, google_1.default)({
                        clientId: googleClientId,
                        clientSecret: googleClientSecret,
                        allowDangerousEmailAccountLinking: true,
                        httpOptions: {
                            timeout: 40000,
                        },
                    }),
                ]
                : []),
        ],
        session: {
            strategy: "jwt",
            maxAge: 30 * 24 * 60 * 60,
            updateAge: 24 * 60 * 60,
            generateSessionToken: () => (0, crypto_1.randomUUID)?.() ?? (0, crypto_1.randomBytes)(32).toString("hex"),
        },
        callbacks: {
            async redirect({ url, baseUrl }) {
                if (url.includes("/logout") || url.includes("/api/auth/signout")) {
                    return url.startsWith("/") ? `${baseUrl}${url}` : url;
                }
                if (url.includes("/failure") ||
                    url.includes("/unauthorized") ||
                    url.includes("/verify-email")) {
                    return url.startsWith("/") ? `${baseUrl}${url}` : url;
                }
                // If it's already a handover URL, extract and validate the inner target
                if (url.includes("/api/auth/handover")) {
                    try {
                        const handoverUrlObj = new URL(url.startsWith("/") ? `${baseUrl}${url}` : url);
                        const innerTarget = handoverUrlObj.searchParams.get("target");
                        if (innerTarget && innerTarget !== url) {
                            const safeTarget = await (0, handover_1.safeHandoverTarget)(innerTarget);
                            if (safeTarget &&
                                (0, domain_1.normalizeHost)(safeTarget.hostname) !== "auth.salesmanpro.site") {
                                const cleanHandover = new URL("/api/auth/handover", baseUrl);
                                cleanHandover.searchParams.set("target", safeTarget.toString());
                                return cleanHandover.toString();
                            }
                        }
                    }
                    catch { }
                }
                let finalRedirectUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
                try {
                    // Safely unroll nested percent-encoding up to 3 levels
                    for (let i = 0; i < 3; i++) {
                        if (finalRedirectUrl.includes("%")) {
                            const next = decodeURIComponent(finalRedirectUrl);
                            if (next === finalRedirectUrl)
                                break;
                            finalRedirectUrl = next;
                        }
                        else {
                            break;
                        }
                    }
                }
                catch {
                    /* already decoded */
                }
                try {
                    const targetUrlObj = new URL(finalRedirectUrl);
                    const targetHost = (0, domain_1.normalizeHost)(targetUrlObj.hostname);
                    const targetPath = targetUrlObj.pathname;
                    // If the target is the auth domain itself, redirect to platform dashboards!
                    if (targetHost === "auth.salesmanpro.site" ||
                        targetHost === (0, domain_1.normalizeHost)(new URL(baseUrl).hostname)) {
                        if (targetPath.startsWith("/api/auth") ||
                            targetPath.startsWith("/verify-email")) {
                            return finalRedirectUrl;
                        }
                        if (targetPath === "/signin" ||
                            targetPath === "/signup" ||
                            targetPath === "/" ||
                            targetPath === "") {
                            finalRedirectUrl = `${domain_1.HUB_URL}/dashboards`;
                        }
                    }
                    const allowed = await (0, context_1.isAllowedReturnUrl)(finalRedirectUrl);
                    if (!allowed) {
                        return `${domain_1.HUB_URL}/unauthorized?reason=invalid_callback`;
                    }
                    const handoverUrl = new URL("/api/auth/handover", baseUrl);
                    handoverUrl.searchParams.set("target", finalRedirectUrl);
                    return handoverUrl.toString();
                }
                catch {
                    return `${domain_1.HUB_URL}/unauthorized?reason=invalid_redirect`;
                }
            },
            async signIn({ user, account }) {
                if (!account ||
                    account.provider === "credentials" ||
                    account.provider === "token-signin" ||
                    account.provider === "school-code-login" ||
                    account.provider === "credentials-email-password") {
                    return true;
                }
                if (!user.email)
                    return false;
                const flow = await resolveFlowContext(requestCtx);
                const existing = await prismadb_1.default.user.findUnique({
                    where: { email: user.email.toLowerCase() },
                    select: { id: true, role: true, isActive: true },
                });
                if (existing?.isActive === false)
                    return false;
                if (existing) {
                    await (0, provision_1.applyLoginContext)(existing.id, flow);
                }
                return true;
            },
            async jwt({ token, user }) {
                if (user) {
                    let dbUser = null;
                    if (user.id) {
                        dbUser = await prismadb_1.default.user.findUnique({
                            where: { id: user.id },
                            select: {
                                role: true,
                                emailVerified: true,
                                isActive: true,
                                companyId: true,
                            },
                        });
                    }
                    const role = dbUser?.role || user.role || "USER";
                    const companyId = dbUser?.companyId ?? user.companyId;
                    const hasTenantAccess = user.hasTenantAccess ??
                        (await resolveHasTenantAccess(user.id, role, companyId));
                    Object.assign(token, {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        username: user.username,
                        bio: user.bio,
                        address: user.address,
                        role,
                        profilePicture: user.profilePicture,
                        emailVerified: dbUser?.emailVerified ?? user.emailVerified,
                        isActive: dbUser?.isActive ?? user.isActive,
                        companyId,
                        hasTenantAccess,
                    });
                }
                else if (token.id && token.hasTenantAccess === undefined) {
                    const dbUser = await prismadb_1.default.user.findUnique({
                        where: { id: String(token.id) },
                        select: {
                            role: true,
                            emailVerified: true,
                            isActive: true,
                            companyId: true,
                        },
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.emailVerified = dbUser.emailVerified;
                        token.isActive = dbUser.isActive;
                        token.companyId = dbUser.companyId;
                        token.hasTenantAccess = await resolveHasTenantAccess(String(token.id), dbUser.role, dbUser.companyId);
                    }
                    else {
                        token.hasTenantAccess = false;
                    }
                }
                return token;
            },
            async session({ session, token }) {
                if (session.user) {
                    Object.assign(session.user, {
                        id: token.id,
                        name: token.name,
                        email: token.email,
                        phone: token.phone,
                        username: token.username,
                        bio: token.bio,
                        address: token.address,
                        role: token.role,
                        profilePicture: token.profilePicture,
                        emailVerified: token.emailVerified,
                        isActive: token.isActive,
                        companyId: token.companyId,
                        hasTenantAccess: token.hasTenantAccess,
                    });
                }
                return session;
            },
        },
        events: {
            async createUser({ user }) {
                if (!user?.id)
                    return;
                const flow = await resolveFlowContext(requestCtx);
                if (flow) {
                    await (0, provision_1.provisionSignupRelationships)(user.id, flow, {
                        isNewUser: true,
                    });
                }
                const existing = await prismadb_1.default.user.findUnique({
                    where: { id: user.id },
                    select: { email: true, emailVerified: true },
                });
                if (!existing?.email)
                    return;
                await prismadb_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        emailVerified: existing.emailVerified === false
                            ? false
                            : (existing.emailVerified ?? false),
                    },
                });
                if (existing.emailVerified !== true) {
                    const token = await (0, verification_1.createEmailVerificationToken)(existing.email);
                    const callbackUrl = flow?.returnUrl || domain_1.HUB_URL;
                    await (0, verification_1.sendVerificationEmail)(existing.email, token, callbackUrl).catch(() => null);
                }
            },
        },
        secret: secret,
        useSecureCookies: process.env.NODE_ENV === "production",
        pages: {
            signIn: "/signin",
            error: "/signin",
        },
        cookies: {
            sessionToken: {
                name: process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.session-token"
                    : "next-auth.session-token",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 30 * 24 * 60 * 60,
                },
            },
            callbackUrl: {
                name: process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.callback-url"
                    : "next-auth.callback-url",
                options: {
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                },
            },
            csrfToken: {
                name: process.env.NODE_ENV === "production"
                    ? "__Host-next-auth.csrf-token"
                    : "next-auth.csrf-token",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                },
            },
            pkceCodeVerifier: {
                name: process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.pkce.code_verifier"
                    : "next-auth.pkce.code_verifier",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 15,
                },
            },
            state: {
                name: process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.state"
                    : "next-auth.state",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 15,
                },
            },
            nonce: {
                name: process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.nonce"
                    : "next-auth.nonce",
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                },
            },
        },
    };
};
exports.authOptions = authOptions;
const getAuthSession = () => (0, next_1.getServerSession)((0, exports.authOptions)());
exports.getAuthSession = getAuthSession;
