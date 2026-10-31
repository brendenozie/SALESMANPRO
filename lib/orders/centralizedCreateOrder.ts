import { calculateOrderPricing, PricingOption } from "@/lib/pricing";
import prisma from "@/server/db/prismadb";
import {
  OrderSource,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import crypto from "crypto";
import { NotificationService } from "@/lib/notifications/notificationService";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type OrderPaymentOption =
  | "cod"
  | "pickupatshop"
  | "mpesa"
  | "card"
  | "paystack"
  | "ghuba"
  | "stripe"
  | "paypal"
  | "cash"
  | "split"
  | "pending"
  | (string & {});

export type OrderType = "PRODUCT" | "SERVICE" | "RENTAL" | "BOOKING" | "OTHER";

export interface CreateOrderItemInput {
  marketplaceListingId: string;
  quantity: number;
  price?: number;
  totalPrice?: number;
  discount?: number;
  tax?: number;
  selectedOptions?: PricingOption[];
  serviceNotes?: string | null;
  date?: string | null;
  timeSlot?: string | null;
  course?: string | null;
  kitchenStatus?: string | null;
  productId?: string;
  appointmentId?: string;
  riderId?: string;
}

export interface CreateOrderInput {
  companyId?: string | null;
  consumerId?: string | null;
  orderType?: OrderType;
  name: string;
  email: string;
  phone: string;
  mpesaPhone?: string | null;
  paymentOption?: OrderPaymentOption;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  orderSource?:
    | OrderSource
    | "WEBSITE"
    | "IN_PERSON"
    | "MOBILE"
    | "WHATSAPP"
    | "AI";
  items: CreateOrderItemInput[];
  shippingAddress?: Record<string, unknown> | Prisma.InputJsonValue | null;
  billingAddress?: Record<string, unknown> | Prisma.InputJsonValue | null;
  shippingMethod?: string | null;
  delivery?: boolean;
  deliveryStatus?: string | null;
  deliveryFee?: number;
  trackingNumber?: string | null;
  promoCode?: string | null;
  notes?: string | null;
  specialInstructions?: string | null;
  giftMessage?: string | null;
  isGift?: boolean;
  giftWrap?: boolean;
  deliveryDate?: Date | null;
  deliveryTimeSlot?: string | null;
  deliveryInstructions?: string | null;
  externalReference?: string | null;
  idempotencyKey?: string | null;
  posSessionId?: string | null;
  operatorId?: string | null;
  cashierName?: string | null;
  tableId?: string | null;
  tableSessionId?: string | null;
  tableNumber?: string | null;
  guestCount?: number | null;
  serviceMode?: string | null;
  kitchenStatus?: string | null;
  isHeld?: boolean;
  heldNote?: string | null;
  heldByStaff?: string | null;
  isWalkIn?: boolean;
  customerType?: string | null;
  channel?: any;
  actorType?: any;
  metadata?: Record<string, unknown>;
  totalPrice?: number;
  totalFinalPrice?: number;
  isOfflineSync?: boolean;
  offlinePolicy?: "STRICT" | "CONTROLLED" | "FLEXIBLE";
  deviceId?: string | null;
  operationId?: string | null;
  storeId?: string | null;
}

export interface CreateOrderResult {
  order: any;
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  };
  trackingNumber: string;
  payment: {
    option: string;
    status: PaymentStatus;
  };
  orderType: OrderType;
  alreadyExists: boolean;
  created: boolean;
  oversellDiscrepancies?: Array<{
    listingId: string;
    productId?: string | null;
    name: string;
    oversoldUnits: number;
    conflictRecordId?: string | null;
  }>;
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function safeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function generateTrackingNumber(): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `TRK-${datePart}-${randomPart}`;
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

function resolveOrderSource(source?: string): OrderSource {
  switch (source?.toUpperCase()) {
    case "POS":
    case "IN_PERSON":
      return OrderSource.IN_PERSON;
    case "MOBILE":
      return OrderSource.MOBILE;
    case "WHATSAPP":
    case "AI":
    case "WEBSITE":
    default:
      return OrderSource.WEBSITE;
  }
}

/* -------------------------------------------------------------------------- */
/* MAIN SERVICE                                                               */
/* -------------------------------------------------------------------------- */

export function resolvePaymentMethodType(paymentOption?: string | null): PaymentMethodType {
  const clean = (paymentOption || "").toLowerCase().trim();
  if (clean === "pickupatshop" || clean === "pickup") return PaymentMethodType.PICKUP;
  if (clean === "cod") return PaymentMethodType.COD;
  if (clean === "mpesa" || clean === "m-pesa") return PaymentMethodType.MPESA;
  if (clean === "card") return PaymentMethodType.CARD;
  if (clean === "paystack") return PaymentMethodType.PAYSTACK;
  if (clean === "ghuba") return PaymentMethodType.GHUBA;
  if (clean === "stripe") return PaymentMethodType.STRIPE;
  if (clean === "paypal") return PaymentMethodType.PAYPAL;
  if (clean === "cash") return PaymentMethodType.CASH;
  if (clean === "split") return PaymentMethodType.SPLIT;
  if (clean === "loyalty") return PaymentMethodType.LOYALTY;
  if (clean === "credit") return PaymentMethodType.CREDIT;
  return PaymentMethodType.PENDING;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  // 1. Validation with Walk-in / Anonymous Customer Fallbacks
  const isWalkIn = Boolean(input.isWalkIn || !input.consumerId || input.customerType === "WALK_IN");
  const customerName = (input.name || "").trim() || (isWalkIn ? "Walk-in Customer" : "");
  if (!customerName) throw new Error("Customer name is required.");

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
    const existingOrder = await prisma.customerOrder.findFirst({
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
        trackingNumber:
          existingOrder.trackingNumber ?? generateTrackingNumber(),
        payment: {
          option: existingOrder.paymentOption ?? paymentOption,
          status: existingOrder.paymentStatus as PaymentStatus,
        },
        orderType: input.orderType ?? "PRODUCT",
        alreadyExists: true,
        created: false,
      };
    }
  }

  // 3. Resolve Store Company ID (if missing)
  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId && input.items?.length) {
    for (const item of input.items) {
      const candidateId = item.marketplaceListingId || (item as any).productId;
      if (!candidateId) continue;

      let sampleListing = await prisma.marketplaceListings.findUnique({
        where: { id: candidateId },
        select: { companyId: true },
      });
      if (!sampleListing) {
        sampleListing = await prisma.marketplaceListings.findFirst({
          where: { productId: candidateId },
          select: { companyId: true },
        });
      }
      if (sampleListing?.companyId) {
        resolvedCompanyId = sampleListing.companyId;
        break;
      }

      const sampleProduct = await prisma.product.findUnique({
        where: { id: candidateId },
        select: { companyId: true },
      });
      if (sampleProduct?.companyId) {
        resolvedCompanyId = sampleProduct.companyId;
        break;
      }
    }
  }

  if (!resolvedCompanyId) {
    throw new Error("Unable to resolve store company ID for this order.");
  }

  // 4. Calculate Pricing Authoritatively via calculateOrderPricing Engine
  const pricing = await calculateOrderPricing({
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
  const trackingNumber =
    normalizeString(input.trackingNumber) ?? generateTrackingNumber();
  const resolvedSource = resolveOrderSource(input.orderSource);

  let computedPaymentStatus = input.paymentStatus ?? PaymentStatus.PENDING;
  if (paymentOption === "cash" || paymentOption === "split") {
    computedPaymentStatus = PaymentStatus.COMPLETED;
  }

  let computedOrderStatus = input.orderStatus ?? OrderStatus.PENDING;
  if (computedPaymentStatus === PaymentStatus.COMPLETED) {
    computedOrderStatus = OrderStatus.PAID;
  }

  // 6. DB Transaction (Order Creation + Inventory Decrement)
  const lowStockWarnings: Array<{ name: string; id: string; remaining: number }> = [];
  const oversellDiscrepancies: Array<{
    listingId: string;
    productId?: string | null;
    name: string;
    oversoldUnits: number;
    conflictRecordId?: string | null;
  }> = [];
  let foundInsideTx = false;

  const isOfflineSync = Boolean(
    input.isOfflineSync ||
      (input.metadata &&
        (input.metadata.channel === "OFFLINE_POS_SYNC" ||
          input.metadata._offlineSync === true))
  );
  const offlinePolicy = input.offlinePolicy || "CONTROLLED";
  const syncDeviceId =
    input.deviceId ||
    (input.metadata && typeof input.metadata.deviceId === "string"
      ? input.metadata.deviceId
      : "POS_TERMINAL");

  const order = await prisma.$transaction(
    async (tx) => {
      // Double-check idempotency inside transaction to prevent concurrent race duplicates
      if (input.idempotencyKey) {
        const concurrentExisting = await tx.customerOrder.findFirst({
          where: { idempotencyKey: input.idempotencyKey },
          include: { items: true },
        });
        if (concurrentExisting) {
          foundInsideTx = true;
          return concurrentExisting;
        }
      }

      const createdOrder = await tx.customerOrder.create({
        data: {
          consumerId: consumerId ?? undefined,
          companyId: resolvedCompanyId,
          name: customerName,
          email,
          phone,
          mpesaPhone,
          paymentOption,
          paymentMethod: resolvePaymentMethodType(paymentOption),
          paymentStatus: computedPaymentStatus,
          status: computedOrderStatus,
          orderSource: resolvedSource,
          channel: (input.channel || (input.posSessionId ? "POS" : "WEBSITE")) as any,
          actorType: (input.actorType || (input.posSessionId ? "STAFF" : "CUSTOMER")) as any,
          trackingNumber,
          shippingAddress:
            (input.shippingAddress as Prisma.InputJsonValue) ?? undefined,
          billingAddress:
            (input.billingAddress as Prisma.InputJsonValue) ?? undefined,
          shippingMethod: input.shippingMethod ?? undefined,
          delivery: pricing.requiresDelivery || (input.delivery ?? false),
          deliveryStatus:
            input.deliveryStatus ??
            (computedPaymentStatus === PaymentStatus.COMPLETED
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
              const origItem = input.items.find(
                (i) => i.marketplaceListingId === pItem.marketplaceListingId,
              );
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
                selectedOptions:
                  (pItem.selectedOptions as unknown as Prisma.InputJsonValue) ??
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
            throw new Error(
              `Item "${pItem.name || pItem.marketplaceListingId}" is no longer available.`,
            );
          }

          if (currentListing.quantity < pItem.quantity) {
            if (!isOfflineSync || offlinePolicy === "STRICT") {
              throw new Error(
                `Insufficient stock for "${currentListing.name}". Available: ${currentListing.quantity}, Requested: ${pItem.quantity}`,
              );
            }
          }

          const rawRemainingQty = currentListing.quantity - pItem.quantity;
          const isOversold = rawRemainingQty < 0;
          const oversoldUnits = isOversold ? Math.abs(rawRemainingQty) : 0;
          const remainingQty = Math.max(0, rawRemainingQty);

          if (remainingQty <= 5) {
            lowStockWarnings.push({
              id: currentListing.id,
              name: currentListing.name,
              remaining: remainingQty,
            });
          }

          // 1. Update MarketplaceListing (clamp display quantity >= 0 while preserving movement delta in ledger)
          await tx.marketplaceListings.update({
            where: { id: pItem.marketplaceListingId },
            data: {
              quantity: isOversold
                ? 0
                : {
                    decrement: pItem.quantity,
                  },
              ...(remainingQty <= 0
                ? { isAvailable: false }
                : {}),
            },
          });

          // 2. Decrement linked Product and InventoryItem if present
          if (currentListing.productId) {
            await tx.product.update({
              where: { id: currentListing.productId },
              data: {
                quantity: remainingQty,
                isAvailable: remainingQty > 0,
              },
            }).catch(() => null);

            const invItem = await tx.inventoryItem.findFirst({
              where: {
                productId: currentListing.productId,
                companyId: resolvedCompanyId,
              },
            });

            if (invItem) {
              const prevInvQty = Math.max(0, Number(invItem.quantity || 0));
              const newInvQty = Math.max(0, prevInvQty - pItem.quantity);
              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: {
                  quantity: newInvQty,
                },
              });

              const { formatLedgerDetails } = await import(
                "@/lib/inventory/inventory-service"
              );
              const saleType = input.posSessionId ? "POS_SALE" : "SALE";
              await tx.inventoryLog.create({
                data: {
                  inventoryId: invItem.id,
                  action: saleType,
                  quantity: pItem.quantity,
                  details: formatLedgerDetails(
                    `${input.posSessionId ? "POS Sale" : "Customer Order"} - Order #${createdOrder.id.slice(-6)} (${createdOrder.trackingNumber || ""})${
                      isOversold ? ` [OFFLINE OVERSELL DISCREPANCY: -${oversoldUnits}]` : ""
                    }`,
                    {
                      movementType: saleType,
                      productId: currentListing.productId,
                      companyId: resolvedCompanyId,
                      previousQuantity: prevInvQty,
                      newQuantity: newInvQty,
                      delta: -pItem.quantity,
                      relatedOrderId: createdOrder.id,
                      referenceId: createdOrder.trackingNumber || createdOrder.id,
                      actorId: input.operatorId || null,
                      reason: isOversold
                        ? `Offline sale #${createdOrder.id} oversold by ${oversoldUnits} unit(s) on device ${syncDeviceId}`
                        : `Order #${createdOrder.id}`,
                    },
                  ),
                  ...(input.operatorId && /^[0-9a-fA-F]{24}$/.test(input.operatorId)
                    ? { userId: input.operatorId }
                    : {}),
                },
              }).catch(() => null);
            }
          }

          if (isOversold) {
            let conflictRecordId: string | null = null;
            try {
              const conflict = await (tx as any).syncConflictRecord?.create({
                data: {
                  companyId: resolvedCompanyId,
                  storeId: input.storeId || null,
                  deviceId: syncDeviceId,
                  operationId: input.operationId || input.idempotencyKey || createdOrder.id,
                  entityType: "INVENTORY",
                  entityId: currentListing.productId || currentListing.id,
                  conflictType: "OVERSELL_DISCREPANCY",
                  severity: "HIGH",
                  status: "OPEN",
                  clientPayload: {
                    orderId: createdOrder.id,
                    trackingNumber: createdOrder.trackingNumber,
                    marketplaceListingId: currentListing.id,
                    requestedQuantity: pItem.quantity,
                  },
                  serverState: {
                    productName: currentListing.name,
                    availableBeforeSale: currentListing.quantity,
                    requestedDeduction: pItem.quantity,
                    oversoldUnits,
                  },
                  details: `Offline sale ${createdOrder.trackingNumber} from device ${syncDeviceId} sold ${pItem.quantity} units of "${currentListing.name}" when only ${currentListing.quantity} were available in cloud stock (discrepancy: -${oversoldUnits}).`,
                },
              });
              conflictRecordId = conflict?.id || null;
            } catch {
              // Non-blocking if conflict table is still initializing
            }

            oversellDiscrepancies.push({
              listingId: currentListing.id,
              productId: currentListing.productId,
              name: currentListing.name,
              oversoldUnits,
              conflictRecordId,
            });
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
      } else if (input.tableId) {
        await tx.restaurantTable.update({
          where: { id: input.tableId },
          data: {
            status: "OCCUPIED",
            currentOrderId: createdOrder.id,
          },
        }).catch(() => null);
      }

      return createdOrder;
    },
    { maxWait: 10_000, timeout: 20_000 },
  );

  // Asynchronously dispatch notifications without blocking order response
  (async () => {
    try {
      // 1. Order Created Notification
      await NotificationService.publishEvent({
        title: `New Order #${trackingNumber || order.id.slice(-6)}`,
        message: `Order of KES ${pricing.total} received from ${customerName || "Customer"} (${pricing.items.length} items).`,
        eventType: "ORDER_CREATED",
        severity: "INFO",
        companyId: resolvedCompanyId,
        actionUrl: `/admin/orders?orderId=${order.id}`,
        resourceType: "order",
        resourceId: order.id,
        recipientPolicy: {
          type: "STORE_STAFF",
        },
        channels: ["IN_APP", "PUSH_ANDROID", "PUSH_DESKTOP"],
        idempotencyKey: `order_${order.id}_created`,
      });

      // 2. Low Stock Warnings
      for (const item of lowStockWarnings) {
        const todayStr = new Date().toISOString().slice(0, 10);
        await NotificationService.publishEvent({
          title: item.remaining === 0 ? `🚨 Stockout Alert: ${item.name}` : `⚠️ Low Stock Alert: ${item.name}`,
          message: item.remaining === 0 
            ? `Item "${item.name}" is completely out of stock.`
            : `Item "${item.name}" has only ${item.remaining} units remaining. Restock recommended.`,
          eventType: item.remaining === 0 ? "STOCKOUT_WARNING" : "LOW_STOCK_WARNING",
          severity: item.remaining === 0 ? "CRITICAL" : "WARNING",
          companyId: resolvedCompanyId,
          actionUrl: `/admin/inventory`,
          resourceType: "inventory",
          resourceId: item.id,
          recipientPolicy: {
            type: "STORE_ADMINS",
          },
          channels: ["IN_APP", "EMAIL", "PUSH_ANDROID", "PUSH_DESKTOP"],
          idempotencyKey: `low_stock_${item.id}_${todayStr}`,
        });
      }
    } catch (notifErr: any) {
      console.warn("[centralizedCreateOrder] Notification dispatch warning:", notifErr?.message || notifErr);
    }
  })();

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
    trackingNumber: order.trackingNumber ?? trackingNumber,
    payment: {
      option: paymentOption,
      status: computedPaymentStatus,
    },
    orderType: input.orderType ?? "PRODUCT",
    alreadyExists: foundInsideTx,
    created: !foundInsideTx,
    oversellDiscrepancies,
  };
}

export default createOrder;
