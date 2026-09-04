/**
 * lib/payments/attribution.ts
 *
 * Core financial attribution engine for SalesmanPro and Ghuba.
 * Handles deterministic store-level revenue attribution for multi-store carts,
 * fee/commission calculation, and financial balance integrity.
 */

export interface AttributedOrderItem {
  id: string;
  orderId: string;
  marketplaceListingId?: string | null;
  productId?: string | null;
  companyId: string; // The owning store/company
  name?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  tax: number;
  commissionRate: number; // e.g. 0.05 for 5%
  feeAmount: number;
  netStoreAmount: number;
  refundAmount: number;
}

export interface StoreOrderAttribution {
  companyId: string;
  orderId: string;
  channel: "DIRECT" | "GHUBA" | "WHATSAPP" | "POS" | "API" | "OTHER";
  grossAmount: number;
  feeAmount: number; // Ghuba fee or gateway fee
  refundAmount: number;
  netAmount: number;
  items: AttributedOrderItem[];
  currency: string;
}

export interface OrderFinancialSummary {
  orderId: string;
  totalGross: number;
  totalPlatformFees: number;
  totalStoreNet: number;
  totalRefunds: number;
  attributions: Record<string, StoreOrderAttribution>; // keyed by companyId
}

/**
 * Standard rounding to 2 decimal places to avoid IEEE-754 floating point imprecision.
 */
export function roundCurrency(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Default Ghuba commission rate (5%) if not specifically overridden on listing or company.
 */
export const DEFAULT_GHUBA_COMMISSION_RATE = 0.05;

/**
 * Attribute an order's financial amounts to participating stores.
 * Supports single-store direct orders and multi-vendor Ghuba orders.
 */
export function attributeOrderFinancials(order: {
  id: string;
  companyId?: string | null;
  channel?: string | null;
  orderSource?: string | null;
  totalFinalPrice?: number | null;
  totalPrice?: number | null;
  totalShipping?: number | null;
  totalTax?: number | null;
  totalDiscount?: number | null;
  currency?: string | null;
  items?: Array<{
    id: string;
    marketplaceListingId?: string | null;
    productId?: string | null;
    quantity: number;
    price: number;
    totalPrice?: number | null;
    discount?: number | null;
    tax?: number | null;
    marketplaceListing?: {
      id: string;
      companyId?: string | null;
      profitMargin?: number | null;
      CommissionRate?: { rate: number } | null;
    } | null;
    product?: {
      id: string;
      companyId?: string | null;
    } | null;
    Return?: Array<{
      status: string;
      refundAmount?: number | null;
    }>;
  }>;
}): OrderFinancialSummary {
  const currency = order.currency || "KES";
  const items = order.items || [];
  const isGhubaOrder =
    String(order.channel || "").toUpperCase() === "GHUBA" ||
    String(order.orderSource || "").toUpperCase() === "GHUBA" ||
    items.some((i) => !!i.marketplaceListingId);

  const attributions: Record<string, StoreOrderAttribution> = {};

  if (items.length === 0) {
    // Fallback if items relation not populated: attribute to order.companyId
    const fallbackCompanyId = order.companyId || "UNKNOWN";
    const gross = roundCurrency(Number(order.totalFinalPrice ?? order.totalPrice ?? 0));
    const feeRate = isGhubaOrder ? DEFAULT_GHUBA_COMMISSION_RATE : 0;
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
    const itemCompanyId =
      item.marketplaceListing?.companyId ||
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
      } else if (
        typeof item.marketplaceListing?.profitMargin === "number" &&
        item.marketplaceListing.profitMargin > 0
      ) {
        commissionRate = item.marketplaceListing.profitMargin > 1
          ? item.marketplaceListing.profitMargin / 100
          : item.marketplaceListing.profitMargin;
      } else {
        commissionRate = DEFAULT_GHUBA_COMMISSION_RATE;
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
      let resolvedChannel: StoreOrderAttribution["channel"] = "DIRECT";
      if (isGhubaOrder) resolvedChannel = "GHUBA";
      else if (String(order.channel || "").toUpperCase() === "WHATSAPP") resolvedChannel = "WHATSAPP";
      else if (String(order.channel || "").toUpperCase() === "POS") resolvedChannel = "POS";

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

    const attributedItem: AttributedOrderItem = {
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
    attributions[itemCompanyId].grossAmount = roundCurrency(
      attributions[itemCompanyId].grossAmount + itemGross
    );
    attributions[itemCompanyId].feeAmount = roundCurrency(
      attributions[itemCompanyId].feeAmount + itemFee
    );
    attributions[itemCompanyId].refundAmount = roundCurrency(
      attributions[itemCompanyId].refundAmount + itemRefund
    );
    attributions[itemCompanyId].netAmount = roundCurrency(
      attributions[itemCompanyId].netAmount + itemNet
    );

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
      attributions[primaryStoreId].grossAmount = roundCurrency(
        attributions[primaryStoreId].grossAmount + shipping
      );
      attributions[primaryStoreId].netAmount = roundCurrency(
        attributions[primaryStoreId].netAmount + shipping
      );
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
