"use strict";
/**
 * lib/whatsapp/actions/products/getStoreInformation.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreInformation = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getStoreInformation(args, context) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: context.companyId },
        select: {
            name: true,
            description: true,
            contactEmail: true,
            contactPhone: true,
            address: true,
            openingHours: true,
            domain: true,
        },
    });
    if (!company) {
        return {
            success: false,
            action: "get_store_information",
            message: "Store information is currently unavailable.",
        };
    }
    let message = "";
    switch (args.topic) {
        case "hours":
            message = `🕒 *Opening Hours for ${company.name}:*\n${company.openingHours ? JSON.stringify(company.openingHours) : "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: Closed"}`;
            break;
        case "location":
            message = `📍 *Store Location for ${company.name}:*\n${company.address ?? "Please contact support for our physical pickup location."}`;
            break;
        case "contact":
            message = `📞 *Contact ${company.name}:*\n• Phone: ${company.contactPhone ?? "N/A"}\n• Email: ${company.contactEmail ?? "N/A"}${company.domain ? `\n• Website: https://${company.domain}` : ""}`;
            break;
        case "payment_methods":
            message = `💳 *Payment Options at ${company.name}:*\n• M-Pesa (STK Push or Paybill)\n• Cash on Delivery (COD)\n• Credit/Debit Card\n• Store Pickup`;
            break;
        case "general":
        default:
            message = `🏢 *${company.name}*\n_${company.description ?? "Welcome to our store!"}_\n\n📍 Address: ${company.address ?? "Available on request"}\n📞 Phone: ${company.contactPhone ?? "N/A"}\n✉️ Email: ${company.contactEmail ?? "N/A"}`;
            break;
    }
    return {
        success: true,
        action: "get_store_information",
        message,
        data: { company },
    };
}
exports.getStoreInformation = getStoreInformation;
