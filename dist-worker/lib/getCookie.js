"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallbackCookie = void 0;
const cookie_1 = __importDefault(require("cookie"));
/**
 * Safe cookie getter that works in both App and Pages environments.
 * You can pass `req` if available (like in API routes or NextAuth callbacks),
 * or it falls back to reading `process.env` (in server contexts).
 */
function getCallbackCookie(req) {
    try {
        if (req?.headers?.cookie) {
            const parsed = cookie_1.default.parse(req.headers.cookie || "");
            return parsed["nextauth_callback_url"] || null;
        }
        if (typeof document !== "undefined") {
            // On the client
            const parsed = cookie_1.default.parse(document.cookie || "");
            return parsed["nextauth_callback_url"] || null;
        }
        return null;
    }
    catch {
        return null;
    }
}
exports.getCallbackCookie = getCallbackCookie;
