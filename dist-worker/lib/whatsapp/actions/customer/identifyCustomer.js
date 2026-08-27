"use strict";
/**
 * lib/whatsapp/actions/customer/identifyCustomer.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyCustomer = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const normalizePhone_1 = require("../../normalizePhone");
async function identifyCustomer(args, context) {
    const phone = (0, normalizePhone_1.normalizePhoneNumber)(args.phone ?? context.phoneNumber);
    const contact = await prismadb_1.default.whatsAppContact.findFirst({
        where: {
            companyId: context.companyId,
            phoneNumber: phone,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    const ordersCount = await prismadb_1.default.customerOrder.count({
        where: {
            companyId: context.companyId,
            phone,
        },
    });
    const name = contact?.name ?? contact?.profileName ?? args.name ?? "Valued Customer";
    return {
        success: true,
        action: "identify_customer",
        message: `Welcome ${name}! You have ${ordersCount} past order${ordersCount === 1 ? "" : "s"} with us.`,
        data: {
            customer: {
                name,
                phone,
                email: contact?.email ?? args.email,
                totalOrders: ordersCount,
            },
        },
    };
}
exports.identifyCustomer = identifyCustomer;
