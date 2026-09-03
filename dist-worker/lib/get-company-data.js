"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyData = void 0;
// /server/lib/get-company-data.ts
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getCompanyData(slug, requestedHost, requestedSubdomain, includeOptions // Pass your 'leanShellInclude' or 'pageDataInclude' object here
) {
    let raw = null;
    if (requestedHost) {
        const normalizedHost = requestedHost.replace(/^www\./, "").toLowerCase();
        raw = await prismadb_1.default.company.findFirst({
            where: {
                OR: [
                    { domain: normalizedHost },
                    { domain: `www.${normalizedHost}` },
                    { domain: `https://${normalizedHost}` },
                    { domain: `https://www.${normalizedHost}` },
                ],
            },
            include: includeOptions,
        });
    }
    if (!raw && requestedSubdomain) {
        raw = await prismadb_1.default.company.findFirst({
            where: { slug: requestedSubdomain },
            include: includeOptions,
        });
    }
    if (!raw) {
        raw = await prismadb_1.default.company.findFirst({
            where: { slug: slug },
            include: includeOptions,
        });
    }
    return raw;
}
exports.getCompanyData = getCompanyData;
