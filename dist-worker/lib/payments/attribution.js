"use strict";
/**
 * lib/payments/attribution.ts
 *
 * Core financial attribution engine for SalesmanPro and Ghuba.
 * Handles deterministic store-level revenue attribution for multi-store carts,
 * fee/commission calculation, and financial balance integrity.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributeOrderFinancials = exports.DEFAULT_GHUBA_COMMISSION_RATE = exports.roundCurrency = void 0;
/**
 * Standard rounding to 2 decimal places to avoid IEEE-754 floating point imprecision.
 */
function roundCurrency(amount) {
    if (isNaN(amount) || !isFinite(amount))
        return 0;
    const res = Math.round((amount + Number.EPSILON) * 100) / 100;
    return res === 0 ? 0 : res;
}
exports.roundCurrency = roundCurrency;
/**
 * Default Ghuba commission rate (5%) if not specifically overridden on listing or company.
 */
exports.DEFAULT_GHUBA_COMMISSION_RATE = 0.05;
/**
 * Attribute an order's financial amounts to participating stores.
 * Supports single-store direct orders and multi-vendor Ghuba orders.
 */
function attributeOrderFinancials(order) {
    const currency = order.currency || "KES";
    const items = order.items || [];
    const isGhubaOrder = String(order.channel || "").toUpperCase() === "GHUBA" ||
        String(order.orderSource || "").toUpperCase() === "GHUBA" ||
        items.some((i) => !!i.marketplaceListingId);
    const attributions = {};
    if (items.length === 0) {
        // Fallback if items relation not populated: attribute to order.companyId
        const fallbackCompanyId = order.companyId || "UNKNOWN";
        const gross = roundCurrency(Number(order.totalFinalPrice ?? order.totalPrice ?? 0));
        const feeRate = isGhubaOrder ? exports.DEFAULT_GHUBA_COMMISSION_RATE : 0;
        const fee = roundCurrency(gross * feeRate);
        const net = roundCurrency(gross - fee);
        attributions[fallbackCompanyId] = {
            companyId: fallbackCompanyId,
            orderId: order.id,
            channel: isGhubaOrder ? "GHUBA" : "DIRECT",
            grossAmount: gross,
            feeAmount: fee,
            refundAmount: 0,
            netAmount: net,
            items: [],
            currency,
        };
        return {
            orderId: order.id,
            totalGross: gross,
            totalPlatformFees: fee,
            totalStoreNet: net,
            totalRefunds: 0,
            attributions,
        };
    }
    // Group and compute per-item attribution
    let orderTotalGross = 0;
    let orderTotalFees = 0;
    let orderTotalRefunds = 0;
    for (const item of items) {
        // Resolve owning store
        const itemCompanyId = item.marketplaceListing?.companyId ||
            item.product?.companyId ||
            order.companyId ||
            "UNKNOWN";
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.price) || 0;
        const itemGross = roundCurrency(Number(item.totalPrice ?? unitPrice * qty));
        const itemDiscount = roundCurrency(Number(item.discount || 0));
        const itemTax = roundCurrency(Number(item.tax || 0));
        // Determine Ghuba marketplace fee rate
        let commissionRate = 0;
        if (isGhubaOrder) {
            if (typeof item.marketplaceListing?.CommissionRate?.rate === "number") {
                commissionRate = item.marketplaceListing.CommissionRate.rate;
            }
            else if (typeof item.marketplaceListing?.profitMargin === "number" &&
                item.marketplaceListing.profitMargin > 0) {
                commissionRate = item.marketplaceListing.profitMargin > 1
                    ? item.marketplaceListing.profitMargin / 100
                    : item.marketplaceListing.profitMargin;
            }
            else {
                commissionRate = exports.DEFAULT_GHUBA_COMMISSION_RATE;
            }
        }
        const itemFee = roundCurrency(itemGross * commissionRate);
        // Calculate completed refunds on this item
        let itemRefund = 0;
        if (Array.isArray(item.Return)) {
            itemRefund = item.Return
                .filter((r) => r.status === "COMPLETED" || r.status === "APPROVED")
                .reduce((sum, r) => sum + Number(r.refundAmount || 0), 0);
            itemRefund = roundCurrency(itemRefund);
        }
        const itemNet = roundCurrency(itemGross - itemFee - itemRefund);
        if (!attributions[itemCompanyId]) {
            let resolvedChannel = "DIRECT";
            if (isGhubaOrder)
                resolvedChannel = "GHUBA";
            else if (String(order.channel || "").toUpperCase() === "WHATSAPP")
                resolvedChannel = "WHATSAPP";
            else if (String(order.channel || "").toUpperCase() === "POS")
                resolvedChannel = "POS";
            attributions[itemCompanyId] = {
                companyId: itemCompanyId,
                orderId: order.id,
                channel: resolvedChannel,
                grossAmount: 0,
                feeAmount: 0,
                refundAmount: 0,
                netAmount: 0,
                items: [],
                currency,
            };
        }
        const attributedItem = {
            id: item.id,
            orderId: order.id,
            marketplaceListingId: item.marketplaceListingId,
            productId: item.productId,
            companyId: itemCompanyId,
            quantity: qty,
            unitPrice,
            totalPrice: itemGross,
            discount: itemDiscount,
            tax: itemTax,
            commissionRate,
            feeAmount: itemFee,
            netStoreAmount: itemNet,
            refundAmount: itemRefund,
        };
        attributions[itemCompanyId].items.push(attributedItem);
        attributions[itemCompanyId].grossAmount = roundCurrency(attributions[itemCompanyId].grossAmount + itemGross);
        attributions[itemCompanyId].feeAmount = roundCurrency(attributions[itemCompanyId].feeAmount + itemFee);
        attributions[itemCompanyId].refundAmount = roundCurrency(attributions[itemCompanyId].refundAmount + itemRefund);
        attributions[itemCompanyId].netAmount = roundCurrency(attributions[itemCompanyId].netAmount + itemNet);
        orderTotalGross = roundCurrency(orderTotalGross + itemGross);
        orderTotalFees = roundCurrency(orderTotalFees + itemFee);
        orderTotalRefunds = roundCurrency(orderTotalRefunds + itemRefund);
    }
    // Account for store shipping if present on order and attributed
    const shipping = roundCurrency(Number(order.totalShipping || 0));
    if (shipping > 0) {
        const storeCount = Object.keys(attributions).length;
        if (storeCount > 0) {
            // Attribute shipping to primary store or split equally
            const primaryStoreId = order.companyId && attributions[order.companyId]
                ? order.companyId
                : Object.keys(attributions)[0];
            attributions[primaryStoreId].grossAmount = roundCurrency(attributions[primaryStoreId].grossAmount + shipping);
            attributions[primaryStoreId].netAmount = roundCurrency(attributions[primaryStoreId].netAmount + shipping);
            orderTotalGross = roundCurrency(orderTotalGross + shipping);
        }
    }
    const orderTotalStoreNet = roundCurrency(orderTotalGross - orderTotalFees - orderTotalRefunds);
    return {
        orderId: order.id,
        totalGross: orderTotalGross,
        totalPlatformFees: orderTotalFees,
        totalStoreNet: orderTotalStoreNet,
        totalRefunds: orderTotalRefunds,
        attributions,
    };
}
exports.attributeOrderFinancials = attributeOrderFinancials;
