"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const pricing_1 = require("@/lib/pricing");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */
function safeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}
function generateTrackingNumber() {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = crypto_1.default.randomBytes(4).toString("hex").toUpperCase();
    return `TRK-${datePart}-${randomPart}`;
}
function normalizePhone(phone) {
    return phone.trim().replace(/[^\d+]/g, "");
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function normalizeString(value) {
    if (!value)
        return undefined;
    const normalized = value.trim();
    return normalized.length ? normalized : undefined;
}
function resolveOrderSource(source) {
    switch (source?.toUpperCase()) {
        case "POS":
        case "IN_PERSON":
            return client_1.OrderSource.IN_PERSON;
        case "MOBILE":
            return client_1.OrderSource.MOBILE;
        case "WHATSAPP":
        case "AI":
        case "WEBSITE":
        default:
            return client_1.OrderSource.WEBSITE;
    }
}
/* -------------------------------------------------------------------------- */
/* MAIN SERVICE                                                               */
/* -------------------------------------------------------------------------- */
async function createOrder(input) {
    // 1. Validation with Walk-in / Anonymous Customer Fallbacks
    const isWalkIn = Boolean(input.isWalkIn || !input.consumerId || input.customerType === "WALK_IN");
    const customerName = (input.name || "").trim() || (isWalkIn ? "Walk-in Customer" : "");
    if (!customerName)
        throw new Error("Customer name is required.");
    const companyId = normalizeString(input.companyId);
    const consumerId = normalizeString(input.consumerId);
    const email = normalizeEmail(input.email || (isWalkIn ? "walkin@pos.local" : ""));
    const phone = normalizePhone(input.phone || (isWalkIn ? "0000000000" : ""));
    const mpesaPhone = input.mpesaPhone
        ? normalizePhone(input.mpesaPhone)
        : undefined;
    const paymentOption = normalizeString(input.paymentOption) ?? "cod";
    // 2. Idempotency Check
    if (input.idempotencyKey) {
        const existingOrder = await prismadb_1.default.customerOrder.findFirst({
            where: { idempotencyKey: input.idempotencyKey },
            include: { items: true },
        });
        if (existingOrder) {
            return {
                order: existingOrder,
                pricing: {
                    subtotal: safeNumber(existingOrder.totalPrice),
                    discount: safeNumber(existingOrder.totalDiscount),
                    tax: safeNumber(existingOrder.totalTax),
                    shipping: safeNumber(existingOrder.totalShipping),
                    total: safeNumber(existingOrder.totalFinalPrice),
                    itemCount: existingOrder.items.length,
                },
                trackingNumber: existingOrder.trackingNumber ?? generateTrackingNumber(),
                payment: {
                    option: existingOrder.paymentOption ?? paymentOption,
                    status: existingOrder.paymentStatus,
                },
                orderType: input.orderType ?? "PRODUCT",
                alreadyExists: true,
                created: false,
            };
        }
    }
    // 3. Resolve Store Company ID (if missing)
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId) {
        const sampleListing = await prismadb_1.default.marketplaceListings.findUnique({
            where: { id: input.items[0].marketplaceListingId },
            select: { companyId: true },
        });
        if (sampleListing?.companyId) {
            resolvedCompanyId = sampleListing.companyId;
        }
    }
    if (!resolvedCompanyId) {
        throw new Error("Unable to resolve store company ID for this order.");
    }
    // 4. Calculate Pricing Authoritatively via calculateOrderPricing Engine
    const pricing = await (0, pricing_1.calculateOrderPricing)({
        companyId: resolvedCompanyId,
        items: input.items.map((item) => ({
            marketplaceListingId: item.marketplaceListingId,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions ?? [],
            date: item.date ?? undefined,
            timeSlot: item.timeSlot ?? undefined,
        })),
        promoCode: input.promoCode ?? undefined,
        shippingMethod: input.shippingMethod ?? undefined,
    });
    // 5. Compute Order Defaults & Statuses
    const trackingNumber = normalizeString(input.trackingNumber) ?? generateTrackingNumber();
    const resolvedSource = resolveOrderSource(input.orderSource);
    let computedPaymentStatus = input.paymentStatus ?? client_1.PaymentStatus.PENDING;
    if (paymentOption === "cash" || paymentOption === "split") {
        computedPaymentStatus = client_1.PaymentStatus.COMPLETED;
    }
    let computedOrderStatus = input.orderStatus ?? client_1.OrderStatus.PENDING;
    if (computedPaymentStatus === client_1.PaymentStatus.COMPLETED) {
        computedOrderStatus = client_1.OrderStatus.PAID;
    }
    // 6. DB Transaction (Order Creation + Inventory Decrement)
    const order = await prismadb_1.default.$transaction(async (tx) => {
        const createdOrder = await tx.customerOrder.create({
            data: {
                consumerId: consumerId ?? undefined,
                companyId: resolvedCompanyId,
                name: customerName,
                email,
                phone,
                mpesaPhone,
                paymentOption,
                paymentMethod: paymentOption.toUpperCase(),
                paymentStatus: computedPaymentStatus,
                status: computedOrderStatus,
                orderSource: resolvedSource,
                channel: (input.channel || (input.posSessionId ? "POS" : "WEBSITE")),
                actorType: (input.actorType || (input.posSessionId ? "STAFF" : "CUSTOMER")),
                trackingNumber,
                shippingAddress: input.shippingAddress ?? undefined,
                billingAddress: input.billingAddress ?? undefined,
                shippingMethod: input.shippingMethod ?? undefined,
                delivery: pricing.requiresDelivery || (input.delivery ?? false),
                deliveryStatus: input.deliveryStatus ??
                    (computedPaymentStatus === client_1.PaymentStatus.COMPLETED
                        ? "Processing"
                        : "Pending"),
                deliveryFee: input.deliveryFee ?? pricing.shipping,
                notes: input.notes ?? undefined,
                specialInstructions: input.specialInstructions ?? undefined,
                giftMessage: input.giftMessage ?? undefined,
                isGift: input.isGift ?? false,
                giftWrap: input.giftWrap ?? false,
                deliveryDate: input.deliveryDate ?? undefined,
                deliveryTimeSlot: input.deliveryTimeSlot ?? undefined,
                deliveryInstructions: input.deliveryInstructions ?? undefined,
                promoCode: input.promoCode ?? undefined,
                totalPrice: pricing.subtotal,
                totalDiscount: pricing.totalDiscount,
                totalTax: pricing.tax,
                totalShipping: pricing.shipping,
                totalFinalPrice: pricing.total,
                idempotencyKey: input.idempotencyKey ?? undefined,
                posSessionId: input.posSessionId ?? undefined,
                operatorId: input.operatorId ?? undefined,
                cashierName: input.cashierName ?? undefined,
                tableId: input.tableId ?? undefined,
                tableSessionId: input.tableSessionId ?? undefined,
                tableNumber: input.tableNumber ?? undefined,
                guestCount: input.guestCount ?? undefined,
                serviceMode: input.serviceMode ?? "DINE_IN",
                kitchenStatus: input.kitchenStatus ?? (input.tableId ? "SENT" : "NOT_SENT"),
                kitchenSentAt: input.kitchenStatus === "SENT" || input.tableId ? new Date() : undefined,
                isHeld: input.isHeld ?? false,
                heldAt: input.isHeld ? new Date() : undefined,
                heldNote: input.heldNote ?? undefined,
                heldByStaff: input.heldByStaff ?? input.cashierName ?? undefined,
                isWalkIn,
                customerType: input.customerType || (isWalkIn ? "WALK_IN" : "REGISTERED"),
                items: {
                    create: pricing.items.map((pItem) => {
                        const origItem = input.items.find((i) => i.marketplaceListingId === pItem.marketplaceListingId);
                        return {
                            marketplaceListingId: pItem.marketplaceListingId,
                            quantity: pItem.quantity,
                            price: pItem.unitPriceWithOptions,
                            totalPrice: pItem.total,
                            discount: pItem.discount,
                            tax: pItem.tax,
                            serviceNotes: origItem?.serviceNotes ?? undefined,
                            course: origItem?.course ?? undefined,
                            kitchenStatus: origItem?.kitchenStatus ?? (input.tableId ? "SENT" : "PENDING"),
                            selectedOptions: pItem.selectedOptions ??
                                undefined,
                            date: origItem?.date ?? undefined,
                            timeSlot: origItem?.timeSlot ?? undefined,
                            riderId: origItem?.riderId ?? undefined,
                            ...(origItem?.productId
                                ? { productId: origItem.productId }
                                : {}),
                            ...(origItem?.appointmentId
                                ? { appointmentId: origItem.appointmentId }
                                : {}),
                        };
                    }),
                },
            },
            include: {
                items: true,
            },
        });
        // Increment POS session stats if order is linked to a session
        if (input.posSessionId) {
            await tx.posSession.update({
                where: { id: input.posSessionId },
                data: {
                    totalSales: { increment: pricing.total },
                    totalTransactions: { increment: 1 },
                },
            }).catch(() => null);
        }
        // Stock Decrement Loop with Atomic Concurrency Check (POS -> MARKETPLACELISTINGS -> PRODUCTS -> STOCK)
        for (const pItem of pricing.items) {
            if (pItem.pricingMode === "PRODUCT") {
                const currentListing = await tx.marketplaceListings.findUnique({
                    where: { id: pItem.marketplaceListingId },
                    select: { id: true, name: true, quantity: true, isAvailable: true, productId: true },
                });
                if (!currentListing) {
                    throw new Error(`Item "${pItem.name || pItem.marketplaceListingId}" is no longer available.`);
                }
                if (currentListing.quantity < pItem.quantity) {
                    throw new Error(`Insufficient stock for "${currentListing.name}". Available: ${currentListing.quantity}, Requested: ${pItem.quantity}`);
                }
                // 1. Decrement MarketplaceListing
                await tx.marketplaceListings.update({
                    where: { id: pItem.marketplaceListingId },
                    data: {
                        quantity: {
                            decrement: pItem.quantity,
                        },
                        ...(currentListing.quantity - pItem.quantity <= 0
                            ? { isAvailable: false }
                            : {}),
                    },
                });
                // 2. Decrement linked Product and InventoryItem if present
                if (currentListing.productId) {
                    await tx.product.update({
                        where: { id: currentListing.productId },
                        data: {
                            quantity: {
                                decrement: pItem.quantity,
                            },
                        },
                    }).catch(() => null);
                    const invItem = await tx.inventoryItem.findFirst({
                        where: {
                            productId: currentListing.productId,
                            companyId: resolvedCompanyId,
                        },
                    });
                    if (invItem) {
                        await tx.inventoryItem.update({
                            where: { id: invItem.id },
                            data: {
                                quantity: {
                                    decrement: pItem.quantity,
                                },
                            },
                        });
                        await tx.inventoryLog.create({
                            data: {
                                inventoryId: invItem.id,
                                action: "POS_SALE",
                                quantity: pItem.quantity,
                                details: `POS Sale - Order #${createdOrder.id} (${createdOrder.trackingNumber || ""})`,
                                userId: input.operatorId || undefined,
                            },
                        }).catch(() => null);
                    }
                }
            }
        }
        // Update Restaurant Table & Session if table was specified
        if (input.tableSessionId) {
            await tx.tableSession.update({
                where: { id: input.tableSessionId },
                data: {
                    orderId: createdOrder.id,
                    status: "ACTIVE",
                },
            }).catch(() => null);
            if (input.tableId) {
                await tx.restaurantTable.update({
                    where: { id: input.tableId },
                    data: {
                        status: "OCCUPIED",
                        currentOrderId: createdOrder.id,
                        currentSessionId: input.tableSessionId,
                    },
                }).catch(() => null);
            }
        }
        else if (input.tableId) {
            await tx.restaurantTable.update({
                where: { id: input.tableId },
                data: {
                    status: "OCCUPIED",
                    currentOrderId: createdOrder.id,
                },
            }).catch(() => null);
        }
        return createdOrder;
    }, { maxWait: 10_000, timeout: 20_000 });
    return {
        order,
        pricing: {
            subtotal: pricing.subtotal,
            discount: pricing.totalDiscount,
            tax: pricing.tax,
            shipping: pricing.shipping,
            total: pricing.total,
            itemCount: pricing.items.length,
        },
        trackingNumber,
        payment: {
            option: paymentOption,
            status: computedPaymentStatus,
        },
        orderType: input.orderType ?? "PRODUCT",
        alreadyExists: false,
        created: true,
    };
}
exports.createOrder = createOrder;
exports.default = createOrder;
