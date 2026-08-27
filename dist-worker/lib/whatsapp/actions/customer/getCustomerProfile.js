"use strict";
/**
 * lib/whatsapp/actions/customer/getCustomerProfile.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.getCustomerProfile = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getCustomerProfile(_args, context) {
    const contact = await prismadb_1.default.whatsAppContact.findFirst({
        where: {
            companyId: context.companyId,
            phoneNumber: context.phoneNumber,
        },
    });
    const ordersCount = await prismadb_1.default.customerOrder.count({
        where: {
            companyId: context.companyId,
            phone: context.phoneNumber,
        },
    });
    const name = contact?.name ?? contact?.profileName ?? "Valued Customer";
    return {
        success: true,
        action: "get_customer_profile",
        message: `Customer Profile:\n• Name: ${name}\n• Phone: ${context.phoneNumber}\n• Email: ${contact?.email ?? "Not set"}\n• Total Orders: ${ordersCount}`,
        data: {
            profile: {
                name,
                phone: context.phoneNumber,
                email: contact?.email,
                totalOrders: ordersCount,
            },
        },
    };
}
exports.getCustomerProfile = getCustomerProfile;
async function updateCustomer(args, context) {
    await prismadb_1.default.whatsAppContact.updateMany({
        where: {
            companyId: context.companyId,
            phoneNumber: context.phoneNumber,
        },
        data: {
            name: args.name ?? undefined,
            email: args.email ?? undefined,
        },
    });
    return {
        success: true,
        action: "update_customer",
        message: "Your customer profile details have been updated successfully.",
        data: { updated: true },
    };
}
exports.updateCustomer = updateCustomer;
