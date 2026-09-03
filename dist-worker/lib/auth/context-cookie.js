"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = exports.readAuthContextFromCookieHeader = exports.decodeAuthContext = exports.encodeAuthContext = exports.AUTH_CONTEXT_MAX_AGE_SECONDS = exports.AUTH_CONTEXT_COOKIE = void 0;
exports.AUTH_CONTEXT_COOKIE = "sp.auth.ctx";
exports.AUTH_CONTEXT_MAX_AGE_SECONDS = 20 * 60;
function secret() {
    return (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-auth-context");
}
// 1. Replaced Node.js createHmac with Web Crypto API (async)
async function sign(payload) {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(secret());
    const data = encoder.encode(payload);
    const cryptoKey = await crypto.subtle.importKey("raw", keyMaterial, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
    return Buffer.from(signatureBuffer).toString("base64url");
}
// 2. Replaced Node.js timingSafeEqual with a custom edge-compatible implementation
function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength)
        return false;
    let mismatch = 0;
    for (let i = 0; i < a.byteLength; i++) {
        mismatch |= a[i] ^ b[i];
    }
    return mismatch === 0;
}
async function encodeAuthContext(ctx) {
    const payload = Buffer.from(JSON.stringify(ctx), "utf8").toString("base64url");
    const signature = await sign(payload); // Now requires await
    return `${payload}.${signature}`;
}
exports.encodeAuthContext = encodeAuthContext;
async function decodeAuthContext(value) {
    if (!value)
        return null;
    const [payload, signature] = value.split(".");
    if (!payload || !signature)
        return null;
    const expected = await sign(payload); // Now requires await
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (!timingSafeEqual(a, b))
        return null;
    try {
        const ctx = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (!ctx?.returnHost || !ctx?.kind || !ctx?.issuedAt)
            return null;
        if (Date.now() - ctx.issuedAt > exports.AUTH_CONTEXT_MAX_AGE_SECONDS * 1000)
            return null;
        return ctx;
    }
    catch {
        return null;
    }
}
exports.decodeAuthContext = decodeAuthContext;
async function readAuthContextFromCookieHeader(cookieHeader) {
    if (!cookieHeader)
        return null;
    const parts = cookieHeader.split(";").map((p) => p.trim());
    const match = parts.find((p) => p.startsWith(`${exports.AUTH_CONTEXT_COOKIE}=`));
    if (!match)
        return null;
    return await decodeAuthContext(decodeURIComponent(match.slice(exports.AUTH_CONTEXT_COOKIE.length + 1)));
}
exports.readAuthContextFromCookieHeader = readAuthContextFromCookieHeader;
function cookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: exports.AUTH_CONTEXT_MAX_AGE_SECONDS,
    };
}
exports.cookieOptions = cookieOptions;
