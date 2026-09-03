"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function createOrder(data) {
    const { consumerId, items, totalPrice, totalTax, totalDiscount, totalShipping, totalFinalPrice, paymentOption, shippingAddress, billingAddress, notes, name, email, phone, mpesaPhone, promoCode, trackingNumber, deliveryStatus, status = "PENDING", delivery, shippingMethod, companyId, idempotencyKey, } = data;
    return await prismadb_1.default.customerOrder.create({
        data: {
            companyId,
            consumerId,
            name,
            email,
            phone,
            mpesaPhone,
            promoCode,
            trackingNumber,
            deliveryStatus,
            delivery: delivery ?? false,
            paymentOption,
            paymentStatus: "INITIATED",
            totalPrice,
            totalTax: totalTax ?? 0,
            totalDiscount: totalDiscount ?? 0,
            totalShipping: totalShipping ?? 0,
            totalFinalPrice: totalFinalPrice ?? totalPrice,
            shippingAddress,
            billingAddress,
            shippingMethod,
            notes,
            status,
            orderSource: "WEBSITE",
            idempotencyKey,
            items: {
                create: items.map((item) => ({
                    marketplaceListingId: item.marketplaceListingId,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    subtotal: item.subtotal,
                    date: item.date || null,
                    timeSlot: item.timeSlot || null,
                    // totalPrice: item.subtotal, // Calculate total price for the item
                    selectedOptions: item.selectedOptions || null, // Store selected options if available
                })),
            },
        },
        include: { items: true },
    });
}
exports.createOrder = createOrder;
// import prisma from "@/server/db/prismadb";
// export async function createOrder(data: any) {
//   const {
//     consumerId,
//     items,
//     totalPrice,
//     totalTax,
//     totalDiscount,
//     totalShipping,
//     totalFinalPrice,
//     paymentOption,
//     shippingAddress,
//     billingAddress,
//     notes,
//     name,
//     email,
//     phone,
//     mpesaPhone,
//     promoCode,
//     trackingNumber,
//     deliveryStatus,
//     status = "PENDING",
//     delivery,
//     shippingMethod,
//     companyId,
//   } = data;
//   return await prisma.customerOrder.create({
//     data: {
//       companyId,
//       consumerId,
//       name,
//       email,
//       phone,
//       mpesaPhone,
//       promoCode,
//       trackingNumber,
//       deliveryStatus,
//       delivery: delivery ?? false,
//       paymentOption,
//       paymentStatus: "PENDING",
//       totalPrice,
//       totalTax: totalTax ?? 0,
//       totalDiscount: totalDiscount ?? 0,
//       totalShipping: totalShipping ?? 0,
//       totalFinalPrice: totalFinalPrice ?? totalPrice,
//       shippingAddress,
//       billingAddress,
//       shippingMethod,
//       notes,
//       status,
//       orderSource: "WEBSITE",
//       // ✅ FIX: Pass the date string directly, removing new Date()
//       items: {
//         create: items.map((item: any) => ({
//           marketplaceListingId: item.marketplaceListingId,
//           quantity: item.quantity,
//           price: item.price,
//           date: item.date || null, // Changed from new Date(item.date)
//           timeSlot: item.timeSlot || null,
//         })),
//       },
//     },
//     include: { items: true },
//   });
// }
