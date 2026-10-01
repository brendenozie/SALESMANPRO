"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupCopy = exports.hubDashboardUrl = exports.defaultPostAuthPath = exports.parseAbsoluteUrl = exports.isStaticallyAllowedReturnHost = exports.isStorefrontSignupKind = exports.isBusinessAdminSignupKind = exports.classifyHost = exports.hostFromUrl = exports.normalizeHost = exports.AUTH_URL = exports.HUB_URL = exports.AUTH_HOST = exports.PLATFORM_ROOT = exports.GHUBA_HOSTS = exports.AUTH_HOSTS = exports.HUB_HOSTS = void 0;
exports.HUB_HOSTS = new Set([
    "salesmanpro.site",
    "www.salesmanpro.site",
    "localhost",
    "127.0.0.1",
]);
exports.AUTH_HOSTS = new Set(["auth.salesmanpro.site"]);
exports.GHUBA_HOSTS = new Set(["ghuba.shop", "www.ghuba.shop"]);
exports.PLATFORM_ROOT = "salesmanpro.site";
exports.AUTH_HOST = "auth.salesmanpro.site";
exports.HUB_URL = "https://salesmanpro.site";
exports.AUTH_URL = "https://auth.salesmanpro.site";
function normalizeHost(input) {
    if (!input)
        return "";
    return input.split(":")[0].trim().toLowerCase().replace(/^www\./, "");
}
exports.normalizeHost = normalizeHost;
function hostFromUrl(value) {
    if (!value)
        return "";
    try {
        const url = value.startsWith("http")
            ? new URL(value)
            : new URL(value, "https://placeholder.invalid");
        if (!value.startsWith("http"))
            return "";
        return normalizeHost(url.hostname);
    }
    catch {
        return "";
    }
}
exports.hostFromUrl = hostFromUrl;
function classifyHost(rawHost) {
    const host = normalizeHost(rawHost);
    if (!host)
        return { host: "", kind: "unknown", slug: null };
    if (exports.AUTH_HOSTS.has(host) || host === exports.AUTH_HOST) {
        return { host, kind: "auth", slug: null };
    }
    if (exports.HUB_HOSTS.has(host) || exports.HUB_HOSTS.has(`www.${host}`)) {
        return { host, kind: "hub", slug: null };
    }
    if (exports.GHUBA_HOSTS.has(host) || exports.GHUBA_HOSTS.has(`www.${host}`) || host === "ghuba") {
        return { host, kind: "ghuba", slug: "ghuba" };
    }
    if (host.endsWith(".salesmanpro.site")) {
        const slug = host.replace(/\.salesmanpro\.site$/, "");
        if (!slug || slug === "www" || slug === "auth") {
            return { host, kind: slug === "auth" ? "auth" : "unknown", slug: null };
        }
        if (slug === "ghuba") {
            return { host, kind: "ghuba", slug: "ghuba" };
        }
        return { host, kind: "store_subdomain", slug };
    }
    return { host, kind: "custom_domain", slug: host };
}
exports.classifyHost = classifyHost;
/** Hub signup is the only path that provisions a new business ADMIN. */
function isBusinessAdminSignupKind(kind) {
    return kind === "hub";
}
exports.isBusinessAdminSignupKind = isBusinessAdminSignupKind;
function isStorefrontSignupKind(kind) {
    return kind === "store_subdomain" || kind === "custom_domain" || kind === "ghuba";
}
exports.isStorefrontSignupKind = isStorefrontSignupKind;
function isStaticallyAllowedReturnHost(host) {
    const classified = classifyHost(host);
    if (!classified.host)
        return false;
    if (classified.kind === "auth")
        return false;
    if (classified.kind === "unknown")
        return false;
    if (classified.kind === "custom_domain")
        return false;
    return true;
}
exports.isStaticallyAllowedReturnHost = isStaticallyAllowedReturnHost;
function parseAbsoluteUrl(value) {
    if (!value)
        return null;
    try {
        let decoded = value.trim();
        // Safely unroll nested percent-encoding up to 3 levels
        for (let i = 0; i < 3; i++) {
            if (decoded.includes("%")) {
                try {
                    const next = decodeURIComponent(decoded);
                    if (next === decoded)
                        break;
                    decoded = next;
                }
                catch {
                    break;
                }
            }
            else {
                break;
            }
        }
        const url = new URL(decoded);
        if (url.protocol !== "https:" &&
            url.protocol !== "http:" &&
            !(url.protocol === "salesmanpro:" && url.hostname === "callback")) {
            return null;
        }
        if (url.username || url.password)
            return null;
        return url;
    }
    catch {
        return null;
    }
}
exports.parseAbsoluteUrl = parseAbsoluteUrl;
function defaultPostAuthPath(kind, canUseDashboard) {
    if (kind === "hub" && canUseDashboard)
        return "/dashboards";
    return "/";
}
exports.defaultPostAuthPath = defaultPostAuthPath;
function hubDashboardUrl() {
    return `${exports.HUB_URL}/dashboards`;
}
exports.hubDashboardUrl = hubDashboardUrl;
function signupCopy(kind, storeName) {
    if (kind === "hub") {
        return {
            title: "Create your SalesmanPro business account",
            subtitle: "You'll get dashboard access after you verify your email.",
        };
    }
    if (kind === "ghuba") {
        return {
            title: "Create your Ghuba marketplace account",
            subtitle: "Shop and track orders on Ghuba. This does not grant store management access.",
        };
    }
    if (kind === "store_subdomain" || kind === "custom_domain") {
        return {
            title: storeName ? `Create your account with ${storeName}` : "Create your store account",
            subtitle: "You're signing up as a customer of this store, not as a store administrator.",
        };
    }
    return {
        title: "Create your account",
        subtitle: "powered by salesmanpro",
    };
}
exports.signupCopy = signupCopy;
