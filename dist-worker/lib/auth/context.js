"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostFromCallbackParam = exports.contextFromHostFallback = exports.isAllowedReturnUrl = exports.attachAuthContextFromRequest = exports.applyAuthContextCookie = exports.resolveReturnContext = exports.cookieOptions = exports.readAuthContextFromCookieHeader = exports.decodeAuthContext = exports.encodeAuthContext = exports.AUTH_CONTEXT_COOKIE = void 0;
const domain_1 = require("./domain");
const context_cookie_1 = require("./context-cookie");
var context_cookie_2 = require("./context-cookie");
Object.defineProperty(exports, "AUTH_CONTEXT_COOKIE", { enumerable: true, get: function () { return context_cookie_2.AUTH_CONTEXT_COOKIE; } });
Object.defineProperty(exports, "encodeAuthContext", { enumerable: true, get: function () { return context_cookie_2.encodeAuthContext; } });
Object.defineProperty(exports, "decodeAuthContext", { enumerable: true, get: function () { return context_cookie_2.decodeAuthContext; } });
Object.defineProperty(exports, "readAuthContextFromCookieHeader", { enumerable: true, get: function () { return context_cookie_2.readAuthContextFromCookieHeader; } });
Object.defineProperty(exports, "cookieOptions", { enumerable: true, get: function () { return context_cookie_2.cookieOptions; } });
async function resolveReturnContext(callbackUrl) {
    let url = (0, domain_1.parseAbsoluteUrl)(callbackUrl);
    if (!url)
        return null;
    // If callbackUrl is a handover URL pointing to auth host, extract the inner target!
    if ((0, domain_1.normalizeHost)(url.hostname) === domain_1.AUTH_HOST) {
        const innerTarget = url.searchParams.get("target");
        if (innerTarget) {
            const unwrapped = (0, domain_1.parseAbsoluteUrl)(innerTarget);
            if (unwrapped) {
                url = unwrapped;
            }
        }
    }
    const host = (0, domain_1.normalizeHost)(url.hostname);
    if (!host)
        return null;
    const classified = (0, domain_1.classifyHost)(host);
    // If the target is still the auth host, default to the Hub dashboards
    if (classified.kind === "auth") {
        return {
            kind: "hub",
            returnHost: "salesmanpro.site",
            returnUrl: "https://salesmanpro.site/dashboards",
            tenantSlug: null,
            issuedAt: Date.now(),
        };
    }
    if (classified.kind === "custom_domain") {
        const allowed = await isAllowedReturnUrl(url.toString());
        if (!allowed)
            return null;
    }
    else if (!(0, domain_1.isStaticallyAllowedReturnHost)(host)) {
        return null;
    }
    return {
        kind: classified.kind === "unknown" ? "custom_domain" : classified.kind,
        returnHost: host,
        returnUrl: `${url.origin}${url.pathname === "/signin" || url.pathname === "/signup" ? "/" : url.pathname}${url.search}`,
        tenantSlug: classified.slug,
        issuedAt: Date.now(),
    };
}
exports.resolveReturnContext = resolveReturnContext;
async function applyAuthContextCookie(res, ctx) {
    if (!ctx)
        return res;
    const token = await (0, context_cookie_1.encodeAuthContext)(ctx);
    res.cookies.set(context_cookie_1.AUTH_CONTEXT_COOKIE, token, (0, context_cookie_1.cookieOptions)());
    return res;
}
exports.applyAuthContextCookie = applyAuthContextCookie;
async function attachAuthContextFromRequest(request, res) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") ||
        request.nextUrl.searchParams.get("target");
    const ctx = await resolveReturnContext(callbackUrl);
    if (ctx)
        await applyAuthContextCookie(res, ctx);
    return ctx;
}
exports.attachAuthContextFromRequest = attachAuthContextFromRequest;
async function isAllowedReturnUrl(raw) {
    const url = (0, domain_1.parseAbsoluteUrl)(raw);
    if (!url)
        return false;
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
        if ((0, domain_1.normalizeHost)(url.hostname) !== "localhost" && (0, domain_1.normalizeHost)(url.hostname) !== "127.0.0.1") {
            return false;
        }
    }
    const host = (0, domain_1.normalizeHost)(url.hostname);
    if ((0, domain_1.isStaticallyAllowedReturnHost)(host))
        return true;
    // In Edge runtime (e.g. Next.js middleware), TCP database & Redis sockets are unsupported
    if (process.env.NEXT_RUNTIME === "edge") {
        return false;
    }
    try {
        const { fetchWithCache } = await Promise.resolve().then(() => __importStar(require("../cache")));
        const cacheKey = `allowed_return_host:${host}`;
        return await fetchWithCache(cacheKey, async () => {
            const prisma = (await Promise.resolve().then(() => __importStar(require("../../server/db/prismadb")))).default;
            const classified = (0, domain_1.classifyHost)(host);
            const company = await prisma.company.findFirst({
                where: {
                    OR: [
                        { domain: host },
                        { domain: `www.${host}` },
                        { domain: url.hostname.toLowerCase() },
                        ...(classified.slug ? [{ slug: classified.slug }, { domain: classified.slug }] : []),
                    ],
                },
                select: { id: true },
            });
            return !!company;
        }, { ttlSeconds: 300 });
    }
    catch {
        return false;
    }
}
exports.isAllowedReturnUrl = isAllowedReturnUrl;
function contextFromHostFallback(host) {
    const classified = (0, domain_1.classifyHost)(host);
    if (classified.kind === "auth" || classified.kind === "unknown" || !classified.host) {
        return {
            kind: "hub",
            returnHost: "salesmanpro.site",
            returnUrl: "https://salesmanpro.site/dashboards",
            tenantSlug: null,
            issuedAt: Date.now(),
        };
    }
    return {
        kind: classified.kind,
        returnHost: classified.host,
        returnUrl: classified.kind === "hub" ? "https://salesmanpro.site" : `https://${classified.host}`,
        tenantSlug: classified.slug,
        issuedAt: Date.now(),
    };
}
exports.contextFromHostFallback = contextFromHostFallback;
function hostFromCallbackParam(callbackUrl) {
    return (0, domain_1.hostFromUrl)(callbackUrl);
}
exports.hostFromCallbackParam = hostFromCallbackParam;
