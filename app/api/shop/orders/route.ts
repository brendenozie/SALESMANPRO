import { NextResponse } from "next/server";
import { unifiedOrderSchema } from "@/lib/orders/orderSchemas";
import { createOrder } from "@/lib/orders/centralizedCreateOrder";
import { processOrderPayment } from "@/lib/orders/processOrderPayment";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": [
    "Content-Type",
    "Authorization",
    "cache-control",
    "x-api-key",
    "X-Requested-With",
    "Accept",
    "Idempotency-Key",
  ].join(", "),
  "Access-Control-Max-Age": "86400",
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export const POST = withApiHandler(
  async (req) => {
    try {
      const incoming = await req.json();

      /**
       * --------------------------------------------------
       * NORMAL SHOP ORDER NORMALIZATION
       * --------------------------------------------------
       */
      const normalized = {
        ...incoming,
        orderType: incoming.orderType ?? "PRODUCT",
        source: incoming.source ?? "WEBSITE",
        items: Array.isArray(incoming.items)
          ? incoming.items.map((item: any) => ({
              marketplaceListingId: item.marketplaceListingId ?? item.listingId,
              quantity: item.quantity ?? 1,
              /**
               * Informational only. Server pricing overrides this.
               */
              price: item.price,
              totalPrice: item.totalPrice ?? item.subtotal ?? item.subTotal,
              selectedOptions: item.selectedOptions ?? item.variants ?? [],
              date: item.date ?? null,
              timeSlot: item.timeSlot ?? null,
              serviceNotes: item.serviceNotes ?? null,
              productId: item.productId,
              appointmentId: item.appointmentId,
            }))
          : [],
      };

      const parsed = unifiedOrderSchema.safeParse(normalized);

      if (!parsed.success) {
        return response(
          {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten(),
          },
          400,
        );
      }

      const data = parsed.data;

      /**
       * --------------------------------------------------
       * CREATE ORDER (CENTRALIZED SERVICE)
       * --------------------------------------------------
       */
      const result = await createOrder({
        companyId: data.companyId,
        consumerId: data.consumerId,
        orderType: data.orderType,
        orderSource: data.source,
        name: data.name,
        email: data.email,
        phone: data.phone,
        mpesaPhone: data.mpesaPhone,
        paymentOption: data.paymentOption,
        items: data.items,
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        promoCode: data.promoCode,
        notes: data.notes,
        trackingNumber: data.trackingNumber,
        idempotencyKey: data.idempotencyKey,
        posSessionId: data.posSessionId,
        operatorId: data.operatorId,
        cashierName: data.cashierName,
        tableId: data.tableId,
        tableSessionId: data.tableSessionId,
        tableNumber: data.tableNumber,
        guestCount: data.guestCount,
        serviceMode: data.serviceMode,
        kitchenStatus: data.kitchenStatus,
        isHeld: data.isHeld,
        heldNote: data.heldNote,
        isWalkIn: data.isWalkIn,
        customerType: data.customerType,
        channel: data.channel || (data.posSessionId || data.source === "POS" ? "POS" : "WEBSITE"),
        actorType: data.actorType || (data.posSessionId ? "STAFF" : "CUSTOMER"),
        metadata: {
          ...(data.metadata ?? {}),
          channel: data.channel || (data.posSessionId || data.source === "POS" ? "POS" : "SHOP"),
          paymentData: data.paymentData,
        },
      });

      /**
       * --------------------------------------------------
       * PAYMENT PROCESSING
       * --------------------------------------------------
       */
      const payment = await processOrderPayment({
        order: result.order,
        companyId: data.companyId,
        paymentOption: data.paymentOption,
        email: data.email,
        phone: data.phone,
        mpesaPhone: data.mpesaPhone,
        paymentData: data.paymentData,
      });

      /**
       * --------------------------------------------------
       * AUTHORITATIVE FISCAL INVOICING & RECEIPT ENGINE
       * --------------------------------------------------
       */
      let fiscalResult: any = { mode: "STANDARD" };
      let receiptHtml = "";
      let receiptEscPos: any = null;
      let receiptData: any = null;

      try {
        const { etimsService } = await import("@/lib/etims/service");
        const { receiptRenderer } = await import("@/lib/receipts/receiptRenderer");

        const targetCompanyId = result.order.companyId || data.companyId;

        // Fetch company profile for receipt header
        const companyRecord = targetCompanyId
          ? await prisma.company.findUnique({
              where: { id: targetCompanyId },
              select: { name: true, phone: true, address: true, email: true },
            })
          : null;

        // Perform authoritative fiscalization check & submission
        fiscalResult = await etimsService.processOrderFiscalization({
          companyId: targetCompanyId,
          order: result.order,
          customerPin: data.customerPin || (data.paymentData as any)?.customerPin || null,
          customerName: data.name,
          paymentOption: data.paymentOption,
          terminalId: data.terminalId || (data.metadata as any)?.terminalId || "T01",
          cashierId: data.consumerId || null,
          cashierName: data.cashierName || (data.paymentData as any)?.cashierName || "Cashier",
          idempotencyKey: data.idempotencyKey || undefined,
        });

        const now = new Date();
        const rawItems = Array.isArray(result.order.items) ? result.order.items : [];

        receiptData = {
          storeName: companyRecord?.name || "Store",
          storeAddress: companyRecord?.address || undefined,
          storePhone: companyRecord?.phone || undefined,
          storeEmail: companyRecord?.email || undefined,
          orderId: result.order.id,
          trackingNumber: result.trackingNumber,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          cashierName: data.cashierName || (data.paymentData as any)?.cashierName || "Cashier",
          cashierId: data.consumerId || undefined,
          terminalId: data.terminalId || (data.metadata as any)?.terminalId || "T01",
          customerName: data.name || "Walk-in Customer",
          customerPhone: data.phone || undefined,
          customerEmail: data.email || undefined,
          customerPin: data.customerPin || (data.paymentData as any)?.customerPin || undefined,
          currency: "KES",
          subtotal: result.pricing?.subtotal ?? (result.order.totalPrice || 0),
          totalDiscount: result.pricing?.discount ?? (result.order.totalDiscount || 0),
          totalTax: result.pricing?.tax ?? (result.order.totalTax || 0),
          finalTotal: result.pricing?.total ?? (result.order.totalFinalPrice || 0),
          paymentMethod: data.paymentOption,
          paymentMethodDetails: (data.paymentData as any)?.paymentMethodDetails || data.paymentOption.toUpperCase(),
          items: rawItems.map((item: any, idx: number) => ({
            id: item.marketplaceListingId || `item-${idx}`,
            name: item.name || item.marketplaceListing?.name || `Item ${idx + 1}`,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: item.discount || 0,
            taxTypeCode: item.taxTypeCode || "A",
            subtotal: item.totalPrice || item.price * item.quantity,
          })),
          isFiscal: fiscalResult.mode === "ETIMS",
          kraPin: fiscalResult.invoice?.kraPin,
          branchId: fiscalResult.invoice?.branchId,
          branchName: fiscalResult.invoice?.branchName,
          deviceId: fiscalResult.invoice?.deviceId,
          invoiceNumber: fiscalResult.invoice?.invoiceNumber,
          controlCode: fiscalResult.invoice?.controlCode || fiscalResult.fiscalResult?.controlCode,
          scuId: fiscalResult.invoice?.scuId || fiscalResult.fiscalResult?.scuId,
          internalData: fiscalResult.invoice?.internalData || fiscalResult.fiscalResult?.internalData,
          qrCodeUrl: fiscalResult.invoice?.qrCodeUrl || fiscalResult.fiscalResult?.qrCodeUrl,
          taxBreakdown: fiscalResult.invoice?.taxBreakdown,
        };

        receiptHtml = receiptRenderer.renderHtml(receiptData, fiscalResult.mode);
        receiptEscPos = receiptRenderer.renderEscPos(receiptData, fiscalResult.mode);
      } catch (fErr) {
        console.error("[FISCAL_INVOICING_ERROR]", fErr);
      }

      return response(
        {
          success: true,
          message: result.alreadyExists
            ? "Existing order returned."
            : "Order created successfully.",
          data: {
            order: result.order,
            pricing: result.pricing,
            trackingNumber: result.trackingNumber,
            payment,
            fiscal: {
              mode: fiscalResult.mode,
              status: fiscalResult.fiscalResult?.status || "NOT_REQUIRED",
              invoiceNumber: fiscalResult.invoice?.invoiceNumber || null,
              controlCode: fiscalResult.invoice?.controlCode || null,
              qrCodeUrl: fiscalResult.invoice?.qrCodeUrl || null,
            },
            receipt: {
              mode: fiscalResult.mode,
              html: receiptHtml,
              escPos: receiptEscPos,
              details: receiptData,
            },
            authorizationUrl: payment?.authorizationUrl ?? null,
            checkoutRequestId: (payment as any)?.checkoutRequestId ?? null,
            alreadyExists: result.alreadyExists,
          },
        },
        result.alreadyExists ? 200 : 201,
      );

    } catch (error: any) {
      console.error("[SHOP_ORDER_ERROR]", error);

      return response(
        {
          success: false,
          error: error?.message ?? "Failed to create order.",
        },
        500,
      );
    }
  },
  {
    requireAuth: false,
    requireRateLimit: true,
  },
);
