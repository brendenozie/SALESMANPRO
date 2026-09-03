"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCompanyFromWhatsApp = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function resolveCompanyFromWhatsApp(phoneNumberId) {
    /**
     * WhatsAppAccount.phoneNumberId is a unique field mapped to Company.
     */
    const account = await prismadb_1.default.whatsAppAccount.findUnique({
        where: {
            phoneNumberId,
        },
        select: {
            companyId: true,
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    if (!account || !account.companyId || !account.company) {
        throw new Error(`No company configured for WhatsApp phone number ${phoneNumberId}`);
    }
    return {
        companyId: account.companyId,
        company: account.company,
    };
}
exports.resolveCompanyFromWhatsApp = resolveCompanyFromWhatsApp;
