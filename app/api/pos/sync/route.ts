import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/centralizedCreateOrder";
import { processOrderPayment } from "@/lib/orders/processOrderPayment";
import { createPOSCustomer } from "@/lib/pos/posCustomerService";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import type {
  SyncBatchRequest,
  SyncBatchResponse,
  SyncOperationResult,
} from "@/types/pos-offline";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-POS-Device-Id, Idempotency-Key",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export const POST = withApiHandler(async (req) => {
  try {
    const body: SyncBatchRequest = await req.json();
    const { deviceId, companyId, operations } = body;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "X-POS-Device-Id / deviceId is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json(
        {
          success: true,
          batchId: body.batchId || "EMPTY",
          results: [],
          serverRevision: Date.now(),
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const results: SyncOperationResult[] = [];
    // Local ID to Server ID remapping map for this batch
    const remappings = new Map<string, string>();

    for (const op of operations) {
      try {
        if (op.entityType === "CUSTOMER") {
          const custPayload = op.payload;
          const custRes = await createPOSCustomer({
            companyId: op.companyId || companyId,
            name: custPayload.name,
            phone: custPayload.phone,
            email: custPayload.email,
            address: custPayload.address,
            notes: custPayload.notes,
          });

          remappings.set(op.entityLocalId, custRes.customer.id);

          results.push({
            operationId: op.operationId,
            status: "SUCCESS",
            serverEntityId: custRes.customer.id,
            remapping: {
              localId: op.entityLocalId,
              serverId: custRes.customer.id,
            },
          });
        } else if (op.entityType === "ORDER") {
          const orderPayload = op.payload;

          // Remap customer if created in this batch or previous batch
          let consumerId = orderPayload.consumerId;
          if (orderPayload.customerLocalId && remappings.has(orderPayload.customerLocalId)) {
            consumerId = remappings.get(orderPayload.customerLocalId);
          }

          // Format items according to centralizedCreateOrder schema
          const items = Array.isArray(orderPayload.items)
            ? orderPayload.items.map((item: any) => ({
                marketplaceListingId: item.marketplaceListingId || item.id,
                quantity: Number(item.quantity || 1),
                price: item.finalPrice ?? item.price,
                totalPrice: item.subtotal ?? (item.price * item.quantity),
                selectedOptions: item.selectedOptions || [],
                serviceNotes: item.serviceNotes,
                date: item.serviceDate,
                timeSlot: item.serviceTimeSlot,
                productId: item.productId,
              }))
            : [];

          const orderRes = await createOrder({
            companyId: op.companyId || companyId,
            consumerId: consumerId || undefined,
            orderType: orderPayload.orderType || "PRODUCT",
            orderSource: "IN_PERSON",
            name: orderPayload.customerName || "Walk-in Customer",
            email: orderPayload.customerEmail || "pos-customer@store.local",
            phone: orderPayload.customerPhone || "0000000000",
            paymentOption: orderPayload.paymentOption || "cash",
            items,
            idempotencyKey: op.idempotencyKey,
            posSessionId: orderPayload.posSessionId || undefined,
            operatorId: op.operatorId || orderPayload.operatorId || undefined,
            cashierName: orderPayload.cashierName || undefined,
            metadata: {
              channel: "OFFLINE_POS_SYNC",
              deviceId: op.deviceId,
              localReceiptNumber: orderPayload.localReceiptNumber,
              clientCreatedAt: orderPayload.clientCreatedAt || orderPayload.createdAt,
            },
          });

          // Ensure payment processing
          if (orderRes.created && (orderPayload.paymentOption === "cash" || orderPayload.paymentOption === "split")) {
            await processOrderPayment({
              order: orderRes.order,
              companyId: op.companyId || companyId,
              paymentOption: orderPayload.paymentOption,
              email: orderRes.order.email,
              phone: orderRes.order.phone,
              paymentData: {
                cashierName: orderPayload.cashierName,
                notes: `Offline POS Cash Sale synced from ${deviceId}`,
                payments: orderPayload.payments,
              },
            }).catch((pErr) => {
              console.warn(`[POS_PAYMENT_SYNC_NON_BLOCKING] Payment logging warning: ${pErr.message}`);
            });
          }

          results.push({
            operationId: op.operationId,
            status: "SUCCESS",
            serverEntityId: orderRes.order.id,
            trackingNumber: orderRes.trackingNumber,
            alreadyExists: orderRes.alreadyExists,
          });
        } else if (op.entityType === "SESSION_CLOSE") {
          const sessPayload = op.payload;
          if (sessPayload.serverId || sessPayload.posSessionId) {
            const sessId = sessPayload.serverId || sessPayload.posSessionId;
            await prisma.posSession.update({
              where: { id: sessId },
              data: {
                status: "CLOSED",
                closedAt: new Date(sessPayload.closedAt || Date.now()),
                closingBalance: sessPayload.closingCash,
                notes: `Closed offline from terminal ${deviceId}. Expected: ${sessPayload.expectedCash}, Counted: ${sessPayload.closingCash}`,
              },
            }).catch(() => null);
          }

          results.push({
            operationId: op.operationId,
            status: "SUCCESS",
            serverEntityId: sessPayload.serverId,
          });
        } else {
          // Unsupported entity type
          results.push({
            operationId: op.operationId,
            status: "FAILED",
            error: `Unsupported entityType: ${op.entityType}`,
          });
        }
      } catch (opErr: any) {
        console.error(`[SYNC_OP_ERROR] Operation ${op.operationId} failed:`, opErr.message);

        // Detect if error is a stock/inventory conflict
        const isConflict =
          opErr.message?.includes("Insufficient stock") ||
          opErr.message?.includes("no longer available") ||
          opErr.message?.includes("conflict");

        results.push({
          operationId: op.operationId,
          status: isConflict ? "CONFLICT" : "FAILED",
          error: opErr.message || "Failed to process operation",
        });
      }
    }

    const responsePayload: SyncBatchResponse = {
      success: true,
      batchId: body.batchId || "BATCH-DEFAULT",
      results,
      serverRevision: Date.now(),
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error("[POS_SYNC_ENDPOINT_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal sync error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
