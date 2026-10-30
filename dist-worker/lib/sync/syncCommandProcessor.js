"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSyncOperationsBatch = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const centralizedCreateOrder_1 = require("@/lib/orders/centralizedCreateOrder");
const processOrderPayment_1 = require("@/lib/orders/processOrderPayment");
const posCustomerService_1 = require("@/lib/pos/posCustomerService");
const numbering_1 = require("@/lib/documents/numbering");
const stockMovementLedger_1 = require("@/lib/inventory/stockMovementLedger");
const changeLogService_1 = require("@/lib/sync/changeLogService");
async function processSyncOperationsBatch(params) {
    const { companyId, storeId, deviceId, actorUserId, operations } = params;
    // Fetch company offline policy if not explicitly provided
    let offlinePolicy = params.offlinePolicy || "CONTROLLED";
    if (!params.offlinePolicy) {
        const settings = await prismadb_1.default.companySettings
            .findUnique({ where: { companyId } })
            .catch(() => null);
        const rawPolicy = (settings?.offlineInventoryPolicy || "CONTROLLED").toUpperCase();
        if (rawPolicy === "STRICT" || rawPolicy === "FLEXIBLE") {
            offlinePolicy = rawPolicy;
        }
    }
    const results = [];
    const remappings = new Map();
    for (const op of operations) {
        const operationId = (op.operationId || "").trim();
        if (!operationId) {
            results.push({
                operationId: "MISSING_OP_ID",
                idempotencyKey: "INVALID",
                status: "FAILED",
                error: "operationId is required for every sync operation",
            });
            continue;
        }
        const opDeviceId = (op.deviceId || deviceId || "POS_TERMINAL").trim();
        const idempotencyKey = (op.idempotencyKey || `${opDeviceId}:${operationId}`).trim();
        const localEntityId = (op.entityLocalId || op.entityId || "").trim();
        const normalizedType = (op.entityType || "").toUpperCase();
        const opStoreId = op.storeId || storeId || null;
        const effectiveActorId = op.operatorId || op.userId || actorUserId || null;
        try {
            // 1. Check durable SyncOperationReceipt for idempotency
            const existingReceipt = await (0, changeLogService_1.findOperationReceipt)(companyId, idempotencyKey);
            if (existingReceipt && existingReceipt.status !== "REJECTED") {
                const cachedPayload = existingReceipt.responsePayload || {};
                if (localEntityId && existingReceipt.serverEntityId) {
                    remappings.set(localEntityId, existingReceipt.serverEntityId);
                }
                results.push({
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    alreadyExists: true,
                    serverEntityId: existingReceipt.serverEntityId || cachedPayload.serverEntityId,
                    trackingNumber: cachedPayload.trackingNumber,
                    serverSequence: existingReceipt.serverSequence ?? undefined,
                    remapping: localEntityId && existingReceipt.serverEntityId
                        ? { localId: localEntityId, serverId: existingReceipt.serverEntityId }
                        : undefined,
                });
                continue;
            }
            // 2. Dispatch by normalized entityType
            if (normalizedType === "CUSTOMER" || normalizedType === "CUSTOMER_CREATE") {
                const p = op.payload || {};
                const custRes = await (0, posCustomerService_1.createPOSCustomer)({
                    companyId,
                    name: p.name || "Walk-in Customer",
                    phone: p.phone || "",
                    email: p.email || "",
                    address: p.address || "",
                    notes: p.notes || "",
                });
                const serverId = custRes.customer.consumerId || custRes.customer.id;
                if (localEntityId && serverId) {
                    remappings.set(localEntityId, serverId);
                }
                const changeEntry = await (0, changeLogService_1.appendSyncChange)({
                    companyId,
                    storeId: opStoreId,
                    entityType: "CUSTOMER",
                    entityId: serverId,
                    changeType: custRes.duplicate ? "UPDATED" : "CREATED",
                    payload: custRes.customer,
                    sourceDeviceId: opDeviceId,
                    sourceOperationId: operationId,
                    actorId: effectiveActorId,
                });
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: serverId,
                    serverSequence: changeEntry.sequence,
                    remapping: localEntityId
                        ? { localId: localEntityId, serverId }
                        : undefined,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "CUSTOMER",
                    entityLocalId: localEntityId,
                    serverEntityId: serverId,
                    status: "APPLIED",
                    serverSequence: changeEntry.sequence,
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "ORDER" ||
                normalizedType === "SALE" ||
                normalizedType === "SALE_CREATE") {
                const orderPayload = op.payload || {};
                // Safety guard: Never allow an offline-queued operation to claim an online provider payment is already confirmed
                const rawPaymentOption = (orderPayload.paymentOption ||
                    orderPayload.paymentMethod ||
                    "cash")
                    .toString()
                    .toLowerCase();
                const isOnlineDependentMethod = rawPaymentOption === "mpesa" ||
                    rawPaymentOption === "paystack" ||
                    rawPaymentOption === "stripe" ||
                    rawPaymentOption === "card";
                const effectivePaymentOption = isOnlineDependentMethod
                    ? "pending"
                    : rawPaymentOption;
                let consumerId = orderPayload.consumerId;
                const candidateLocalCustId = orderPayload.customerLocalId || orderPayload.consumerId;
                if (candidateLocalCustId && remappings.has(candidateLocalCustId)) {
                    consumerId = remappings.get(candidateLocalCustId);
                }
                else if (typeof consumerId === "string" &&
                    !consumerId.match(/^[0-9a-fA-F]{24}$/)) {
                    // Look up if local customer was remapped in a previous batch receipt
                    const prevCustReceipt = await prismadb_1.default.syncOperationReceipt.findFirst({
                        where: {
                            companyId,
                            entityType: "CUSTOMER",
                            entityLocalId: consumerId,
                        },
                    });
                    if (prevCustReceipt?.serverEntityId) {
                        consumerId = prevCustReceipt.serverEntityId;
                    }
                    else {
                        consumerId = undefined;
                    }
                }
                const items = Array.isArray(orderPayload.items)
                    ? orderPayload.items.map((item) => ({
                        marketplaceListingId: item.marketplaceListingId || item.listingId || item.id,
                        quantity: Math.max(1, Number(item.quantity || 1)),
                        price: item.unitPrice ?? item.finalPrice ?? item.price,
                        totalPrice: item.subtotal ??
                            (item.unitPrice ?? item.price ?? 0) * Number(item.quantity || 1),
                        selectedOptions: item.selectedOptions || [],
                        serviceNotes: item.serviceNotes,
                        date: item.serviceDate,
                        timeSlot: item.serviceTimeSlot,
                        productId: item.productId,
                    }))
                    : [];
                const orderRes = await (0, centralizedCreateOrder_1.createOrder)({
                    companyId,
                    consumerId: consumerId || undefined,
                    orderType: orderPayload.orderType || "PRODUCT",
                    orderSource: "IN_PERSON",
                    name: orderPayload.customerName || "Walk-in Customer",
                    email: orderPayload.customerEmail || "pos-customer@store.local",
                    phone: orderPayload.customerPhone || "0000000000",
                    paymentOption: effectivePaymentOption,
                    items,
                    idempotencyKey,
                    posSessionId: orderPayload.posSessionId &&
                        /^[0-9a-fA-F]{24}$/.test(orderPayload.posSessionId)
                        ? orderPayload.posSessionId
                        : undefined,
                    operatorId: effectiveActorId && /^[0-9a-fA-F]{24}$/.test(effectiveActorId)
                        ? effectiveActorId
                        : undefined,
                    cashierName: orderPayload.cashierName || undefined,
                    isOfflineSync: true,
                    offlinePolicy,
                    deviceId: opDeviceId,
                    operationId,
                    storeId: opStoreId,
                    metadata: {
                        channel: "OFFLINE_POS_SYNC",
                        deviceId: opDeviceId,
                        localReceiptNumber: orderPayload.localReceiptNumber || orderPayload.receiptNumber,
                        clientCreatedAt: orderPayload.clientCreatedAt ||
                            orderPayload.createdAt ||
                            op.clientTimestamp,
                        requestedPaymentMethod: rawPaymentOption,
                    },
                });
                // Process cash or split-cash payment authoritatively
                if (orderRes.created &&
                    (effectivePaymentOption === "cash" || effectivePaymentOption === "split")) {
                    await (0, processOrderPayment_1.processOrderPayment)({
                        order: orderRes.order,
                        companyId,
                        paymentOption: effectivePaymentOption,
                        email: orderRes.order.email,
                        phone: orderRes.order.phone,
                        paymentData: {
                            cashierName: orderPayload.cashierName,
                            notes: `Offline POS Sale synced from ${opDeviceId}`,
                            payments: orderPayload.payments,
                        },
                    }).catch((pErr) => {
                        console.warn(`[SYNC_PAYMENT_NON_BLOCKING] Payment record warning: ${pErr.message}`);
                    });
                }
                if (localEntityId) {
                    remappings.set(localEntityId, orderRes.order.id);
                }
                const changeEntry = await (0, changeLogService_1.appendSyncChange)({
                    companyId,
                    storeId: opStoreId,
                    entityType: "SALE",
                    entityId: orderRes.order.id,
                    changeType: "CREATED",
                    payload: {
                        orderId: orderRes.order.id,
                        trackingNumber: orderRes.trackingNumber,
                        totalFinalPrice: orderRes.pricing.total,
                        paymentStatus: orderRes.payment.status,
                        localReceiptNumber: orderPayload.localReceiptNumber || orderPayload.receiptNumber || null,
                        oversellDiscrepancies: orderRes.oversellDiscrepancies || [],
                    },
                    sourceDeviceId: opDeviceId,
                    sourceOperationId: operationId,
                    actorId: effectiveActorId,
                });
                const hasWarnings = Array.isArray(orderRes.oversellDiscrepancies) &&
                    orderRes.oversellDiscrepancies.length > 0;
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: orderRes.order.id,
                    trackingNumber: orderRes.trackingNumber,
                    alreadyExists: orderRes.alreadyExists,
                    serverSequence: changeEntry.sequence,
                    remapping: localEntityId
                        ? { localId: localEntityId, serverId: orderRes.order.id }
                        : undefined,
                    warnings: hasWarnings ? orderRes.oversellDiscrepancies : undefined,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "SALE",
                    entityLocalId: localEntityId,
                    serverEntityId: orderRes.order.id,
                    status: hasWarnings ? "APPLIED_WITH_WARNING" : "APPLIED",
                    serverSequence: changeEntry.sequence,
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "INVENTORY_MOVEMENT" ||
                normalizedType === "INVENTORY_DELTA") {
                const p = op.payload || {};
                const delta = Number(p.delta ?? p.quantityDelta ?? 0);
                const movementRes = await (0, stockMovementLedger_1.applyAuthoritativeStockMovement)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    marketplaceListingId: p.marketplaceListingId || p.listingId || null,
                    productId: p.productId || null,
                    delta,
                    movementType: p.movementType || (delta < 0 ? "DAMAGE_WRITE_OFF" : "RESTOCK"),
                    reason: p.reason || `Offline inventory movement from ${opDeviceId}`,
                    referenceId: p.referenceId || idempotencyKey,
                    actorId: effectiveActorId,
                    offlinePolicy,
                    isOfflineSync: true,
                });
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: movementRes.inventoryLogId ||
                        movementRes.inventoryItemId ||
                        movementRes.productId ||
                        operationId,
                    conflictRecordId: movementRes.conflictRecordId,
                    warnings: movementRes.oversold
                        ? [
                            {
                                oversoldUnits: movementRes.oversoldAmount,
                                conflictRecordId: movementRes.conflictRecordId,
                            },
                        ]
                        : undefined,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "INVENTORY_MOVEMENT",
                    entityLocalId: localEntityId,
                    serverEntityId: resObj.serverEntityId,
                    status: movementRes.oversold ? "APPLIED_WITH_WARNING" : "APPLIED",
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "EXPENSE" || normalizedType === "EXPENSE_CREATE") {
                const p = op.payload || {};
                const expenseId = p.expenseId ||
                    `EXP-${opDeviceId.slice(-4).toUpperCase()}-${operationId.slice(-6).toUpperCase()}`;
                const expense = await prismadb_1.default.expense.upsert({
                    where: { expenseId },
                    update: {},
                    create: {
                        expenseId,
                        companyId,
                        category: p.category || "Operations",
                        description: p.description || "Offline POS Expense",
                        vendor: p.vendor || "N/A",
                        amount: Math.max(0, Number(p.amount || 0)),
                        taxAmount: Number(p.taxAmount || 0),
                        paymentMethod: p.paymentMethod || "CASH",
                        reference: p.reference || idempotencyKey,
                        costCenter: p.costCenter || "POS Branch",
                        approvedBy: p.approvedBy || null,
                        status: p.status || "Paid",
                        date: p.date ? new Date(p.date) : new Date(),
                        notes: p.notes || `Synced from offline device ${opDeviceId}`,
                    },
                });
                const changeEntry = await (0, changeLogService_1.appendSyncChange)({
                    companyId,
                    storeId: opStoreId,
                    entityType: "EXPENSE",
                    entityId: expense.id,
                    changeType: "CREATED",
                    payload: expense,
                    sourceDeviceId: opDeviceId,
                    sourceOperationId: operationId,
                    actorId: effectiveActorId,
                });
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: expense.id,
                    serverSequence: changeEntry.sequence,
                    remapping: localEntityId
                        ? { localId: localEntityId, serverId: expense.id }
                        : undefined,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "EXPENSE",
                    entityLocalId: localEntityId,
                    serverEntityId: expense.id,
                    status: "APPLIED",
                    serverSequence: changeEntry.sequence,
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "QUOTATION" ||
                normalizedType === "QUOTATION_CREATE") {
                const p = op.payload || {};
                const rawItems = Array.isArray(p.items) ? p.items : [];
                let subtotal = 0;
                let taxAmount = 0;
                let discountAmount = 0;
                const normalizedItems = rawItems.map((it) => {
                    const qty = Math.max(1, parseInt(it.quantity || "1", 10));
                    const unitPrice = parseFloat(it.unitPrice ?? it.price ?? "0");
                    const taxRate = parseFloat(it.taxRate || "0");
                    const discount = parseFloat(it.discount || "0");
                    const lineGross = qty * unitPrice;
                    const lineDiscount = lineGross * (discount / 100);
                    const lineNet = lineGross - lineDiscount;
                    const lineTax = lineNet * (taxRate / 100);
                    const lineTotal = lineNet + lineTax;
                    subtotal += lineNet;
                    taxAmount += lineTax;
                    discountAmount += lineDiscount;
                    return {
                        description: it.description || it.name || "Quotation item",
                        quantity: qty,
                        unitPrice,
                        taxRate,
                        discount,
                        totalPrice: Math.round((lineTotal + Number.EPSILON) * 100) / 100,
                        productId: it.productId || null,
                        marketplaceListingId: it.marketplaceListingId || null,
                    };
                });
                const totalAmount = Math.round((subtotal + taxAmount + Number.EPSILON) * 100) / 100;
                const quotationNumber = await (0, numbering_1.generateDocumentNumber)(companyId, "QUOTATION");
                const quotation = await prismadb_1.default.quotation.create({
                    data: {
                        quotationNumber,
                        companyId,
                        customerName: p.customerName || "Walk-in Customer",
                        customerEmail: p.customerEmail || null,
                        customerPhone: p.customerPhone || null,
                        consumerId: p.consumerId && remappings.has(p.consumerId)
                            ? remappings.get(p.consumerId)
                            : p.consumerId && /^[0-9a-fA-F]{24}$/.test(p.consumerId)
                                ? p.consumerId
                                : null,
                        subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100,
                        taxAmount: Math.round((taxAmount + Number.EPSILON) * 100) / 100,
                        discountAmount: Math.round((discountAmount + Number.EPSILON) * 100) / 100,
                        totalAmount,
                        currency: p.currency || "KES",
                        issueDate: new Date(),
                        expiryDate: p.expiryDate
                            ? new Date(p.expiryDate)
                            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        status: "DRAFT",
                        notes: p.notes || `Created offline on terminal ${opDeviceId}`,
                        terms: p.terms || "Valid for 30 days.",
                        items: {
                            create: normalizedItems,
                        },
                    },
                    include: { items: true },
                });
                const changeEntry = await (0, changeLogService_1.appendSyncChange)({
                    companyId,
                    storeId: opStoreId,
                    entityType: "QUOTATION",
                    entityId: quotation.id,
                    changeType: "CREATED",
                    payload: quotation,
                    sourceDeviceId: opDeviceId,
                    sourceOperationId: operationId,
                    actorId: effectiveActorId,
                });
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: quotation.id,
                    trackingNumber: quotation.quotationNumber,
                    serverSequence: changeEntry.sequence,
                    remapping: localEntityId
                        ? { localId: localEntityId, serverId: quotation.id }
                        : undefined,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "QUOTATION",
                    entityLocalId: localEntityId,
                    serverEntityId: quotation.id,
                    status: "APPLIED",
                    serverSequence: changeEntry.sequence,
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "RETURN" || normalizedType === "RETURN_CREATE") {
                const p = op.payload || {};
                const returnItems = Array.isArray(p.items) ? p.items : [p];
                let lastLogId = operationId;
                for (const rItem of returnItems) {
                    const qty = Math.max(1, Number(rItem.quantity || 1));
                    const moveRes = await (0, stockMovementLedger_1.applyAuthoritativeStockMovement)({
                        companyId,
                        storeId: opStoreId,
                        deviceId: opDeviceId,
                        operationId: `${operationId}_${rItem.marketplaceListingId || rItem.productId || "item"}`,
                        marketplaceListingId: rItem.marketplaceListingId || rItem.listingId || null,
                        productId: rItem.productId || null,
                        delta: qty,
                        movementType: "ORDER_RETURN",
                        reason: rItem.reason || p.reason || "Customer Return (Offline POS)",
                        relatedOrderId: p.orderId || null,
                        referenceId: idempotencyKey,
                        actorId: effectiveActorId,
                        offlinePolicy,
                        isOfflineSync: true,
                    });
                    if (moveRes.inventoryLogId) {
                        lastLogId = moveRes.inventoryLogId;
                    }
                }
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: lastLogId,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "RETURN",
                    entityLocalId: localEntityId,
                    serverEntityId: lastLogId,
                    status: "APPLIED",
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "SESSION_OPEN") {
                const sessPayload = op.payload || {};
                const createdSession = await prismadb_1.default.posSession.create({
                    data: {
                        companyId,
                        operatorId: effectiveActorId && /^[0-9a-fA-F]{24}$/.test(effectiveActorId)
                            ? effectiveActorId
                            : companyId,
                        terminalId: sessPayload.terminalId || opDeviceId,
                        status: "OPEN",
                        shiftStatus: "OPEN",
                        openingBalance: Number(sessPayload.openingBalance || 0),
                        notes: `Opened offline on ${opDeviceId}`,
                    },
                });
                if (localEntityId) {
                    remappings.set(localEntityId, createdSession.id);
                }
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: createdSession.id,
                    remapping: localEntityId
                        ? { localId: localEntityId, serverId: createdSession.id }
                        : undefined,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "SESSION_OPEN",
                    entityLocalId: localEntityId,
                    serverEntityId: createdSession.id,
                    status: "APPLIED",
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else if (normalizedType === "SESSION_CLOSE") {
                const sessPayload = op.payload || {};
                const rawSessId = sessPayload.serverId || sessPayload.posSessionId || localEntityId;
                const resolvedSessId = rawSessId && remappings.has(rawSessId)
                    ? remappings.get(rawSessId)
                    : rawSessId;
                if (resolvedSessId && /^[0-9a-fA-F]{24}$/.test(resolvedSessId)) {
                    await prismadb_1.default.posSession
                        .updateMany({
                        where: { id: resolvedSessId, companyId },
                        data: {
                            status: "CLOSED",
                            shiftStatus: "CLOSED",
                            closedAt: new Date(sessPayload.closedAt || Date.now()),
                            closingBalance: Number(sessPayload.closingCash ?? sessPayload.closingBalance ?? 0),
                            countedCash: Number(sessPayload.closingCash ?? sessPayload.countedCash ?? 0),
                            expectedCash: Number(sessPayload.expectedCash ?? 0),
                            notes: `Closed offline from terminal ${opDeviceId}. Expected: ${sessPayload.expectedCash ?? 0}, Counted: ${sessPayload.closingCash ?? 0}`,
                        },
                    })
                        .catch(() => null);
                }
                const resObj = {
                    operationId,
                    idempotencyKey,
                    status: "SUCCESS",
                    serverEntityId: resolvedSessId || operationId,
                };
                await (0, changeLogService_1.recordOperationReceipt)({
                    companyId,
                    storeId: opStoreId,
                    deviceId: opDeviceId,
                    operationId,
                    idempotencyKey,
                    entityType: "SESSION_CLOSE",
                    entityLocalId: localEntityId,
                    serverEntityId: resolvedSessId || operationId,
                    status: "APPLIED",
                    responsePayload: resObj,
                });
                results.push(resObj);
            }
            else {
                results.push({
                    operationId,
                    idempotencyKey,
                    status: "FAILED",
                    error: `Unsupported sync entityType: ${op.entityType}`,
                });
            }
        }
        catch (opErr) {
            console.error(`[SYNC_OP_ERROR] Operation ${operationId} failed:`, opErr.message);
            const isConflict = opErr.message?.includes("Insufficient stock") ||
                opErr.message?.includes("no longer available") ||
                opErr.message?.includes("conflict");
            if (isConflict) {
                await prismadb_1.default.syncConflictRecord
                    .create({
                    data: {
                        companyId,
                        storeId: opStoreId,
                        deviceId: opDeviceId,
                        operationId,
                        entityType: normalizedType,
                        entityId: localEntityId || null,
                        conflictType: "OVERSELL_DISCREPANCY",
                        severity: "HIGH",
                        status: "OPEN",
                        clientPayload: op.payload || {},
                        details: opErr.message,
                    },
                })
                    .catch(() => null);
            }
            results.push({
                operationId,
                idempotencyKey,
                status: isConflict ? "CONFLICT" : "FAILED",
                error: opErr.message || "Failed to process operation",
            });
        }
    }
    return {
        results,
        remappings: Object.fromEntries(remappings.entries()),
    };
}
exports.processSyncOperationsBatch = processSyncOperationsBatch;
