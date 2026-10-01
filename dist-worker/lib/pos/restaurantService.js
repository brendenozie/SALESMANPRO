"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderToKitchen = exports.transferOrderItems = exports.splitBill = exports.mergeBills = exports.transferTable = exports.closeTableSession = exports.updateTableSession = exports.openTableSession = exports.updateTableStatus = exports.createRestaurantTable = exports.listRestaurantTables = exports.createRestaurantArea = exports.listRestaurantAreas = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
/* -------------------------------------------------------------------------- */
/* AREA MANAGEMENT                                                            */
/* -------------------------------------------------------------------------- */
async function listRestaurantAreas(companyId) {
    if (!companyId)
        return [];
    // Seed default areas if company has none
    const existing = await prismadb_1.default.restaurantArea.findMany({
        where: { companyId },
        include: {
            _count: { select: { tables: true } },
        },
        orderBy: { sortOrder: "asc" },
    });
    if (existing.length === 0) {
        const defaults = [
            { name: "Main Dining", slug: "main-dining", sortOrder: 1 },
            { name: "Terrace / Outdoor", slug: "terrace", sortOrder: 2 },
            { name: "Bar & Lounge", slug: "bar", sortOrder: 3 },
            { name: "VIP / Private", slug: "vip", sortOrder: 4 },
        ];
        for (const d of defaults) {
            await prismadb_1.default.restaurantArea.create({
                data: {
                    companyId,
                    name: d.name,
                    slug: d.slug,
                    sortOrder: d.sortOrder,
                    isActive: true,
                },
            }).catch(() => null);
        }
        return listRestaurantAreas(companyId);
    }
    return existing.map((a) => ({
        id: a.id,
        companyId: a.companyId,
        name: a.name,
        slug: a.slug,
        description: a.description,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
        tablesCount: a._count.tables,
    }));
}
exports.listRestaurantAreas = listRestaurantAreas;
async function createRestaurantArea(companyId, name, description) {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return prismadb_1.default.restaurantArea.create({
        data: {
            companyId,
            name: name.trim(),
            slug,
            description,
            isActive: true,
        },
    });
}
exports.createRestaurantArea = createRestaurantArea;
/* -------------------------------------------------------------------------- */
/* TABLE MANAGEMENT                                                           */
/* -------------------------------------------------------------------------- */
async function listRestaurantTables(companyId, areaId) {
    if (!companyId)
        return [];
    // Seed default tables if none exist
    const count = await prismadb_1.default.restaurantTable.count({ where: { companyId } });
    if (count === 0) {
        const areas = await listRestaurantAreas(companyId);
        const mainAreaId = areas[0]?.id;
        const terraceAreaId = areas[1]?.id || mainAreaId;
        const defaultTables = [
            { number: "T1", capacity: 2, areaId: mainAreaId },
            { number: "T2", capacity: 4, areaId: mainAreaId },
            { number: "T3", capacity: 4, areaId: mainAreaId },
            { number: "T4", capacity: 6, areaId: mainAreaId },
            { number: "T5", capacity: 8, areaId: mainAreaId },
            { number: "B1", capacity: 2, areaId: terraceAreaId },
            { number: "B2", capacity: 4, areaId: terraceAreaId },
            { number: "B3", capacity: 4, areaId: terraceAreaId },
        ];
        for (const dt of defaultTables) {
            await prismadb_1.default.restaurantTable.create({
                data: {
                    companyId,
                    tableNumber: dt.number,
                    name: `Table ${dt.number}`,
                    capacity: dt.capacity,
                    areaId: dt.areaId,
                    status: client_1.TableStatus.AVAILABLE,
                },
            }).catch(() => null);
        }
    }
    const whereClause = { companyId, isActive: true };
    if (areaId && areaId !== "all") {
        whereClause.areaId = areaId;
    }
    const tables = await prismadb_1.default.restaurantTable.findMany({
        where: whereClause,
        include: {
            area: { select: { id: true, name: true } },
            sessions: {
                where: { status: "ACTIVE" },
                take: 1,
                orderBy: { openedAt: "desc" },
                include: {
                    openedBy: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { tableNumber: "asc" },
    });
    // Fetch active orders for occupied tables
    const orderIds = tables
        .map((t) => t.currentOrderId || t.sessions[0]?.orderId)
        .filter(Boolean);
    const orders = orderIds.length > 0
        ? await prismadb_1.default.customerOrder.findMany({
            where: { id: { in: orderIds } },
            include: {
                items: {
                    include: {
                        marketplaceListing: {
                            select: { id: true, name: true, sellingPrice: true, images: true },
                        },
                    },
                },
            },
        })
        : [];
    const orderMap = new Map(orders.map((o) => [o.id, o]));
    return tables.map((t) => {
        const activeSession = t.sessions[0];
        const activeOrder = (t.currentOrderId && orderMap.get(t.currentOrderId)) ||
            (activeSession?.orderId && orderMap.get(activeSession.orderId)) ||
            null;
        const openedDate = activeSession?.openedAt || (activeOrder?.createdAt ? new Date(activeOrder.createdAt) : null);
        const elapsedMinutes = openedDate
            ? Math.max(0, Math.floor((Date.now() - openedDate.getTime()) / 60000))
            : undefined;
        return {
            id: t.id,
            companyId: t.companyId,
            areaId: t.areaId,
            areaName: t.area?.name,
            tableNumber: t.tableNumber,
            name: t.name || `Table ${t.tableNumber}`,
            capacity: t.capacity,
            status: t.status,
            currentOrderId: activeOrder?.id || t.currentOrderId || null,
            currentSessionId: activeSession?.id || t.currentSessionId || null,
            currentOrder: activeOrder,
            currentSession: activeSession
                ? {
                    id: activeSession.id,
                    guestCount: activeSession.guestCount,
                    serviceMode: activeSession.serviceMode,
                    openedByName: activeSession.openedBy?.name,
                    notes: activeSession.notes,
                }
                : null,
            isActive: t.isActive,
            guestCount: activeSession?.guestCount || activeOrder?.guestCount || undefined,
            openedAt: openedDate ? openedDate.toISOString() : null,
            elapsedMinutes,
        };
    });
}
exports.listRestaurantTables = listRestaurantTables;
async function createRestaurantTable(input) {
    const { companyId, tableNumber, name, capacity = 4, areaId } = input;
    return prismadb_1.default.restaurantTable.create({
        data: {
            companyId,
            tableNumber: tableNumber.trim(),
            name: name?.trim() || `Table ${tableNumber.trim()}`,
            capacity: Number(capacity) || 4,
            areaId: areaId || undefined,
            status: client_1.TableStatus.AVAILABLE,
        },
    });
}
exports.createRestaurantTable = createRestaurantTable;
async function updateTableStatus(companyId, tableId, status) {
    return prismadb_1.default.restaurantTable.update({
        where: { id: tableId },
        data: { status },
    });
}
exports.updateTableStatus = updateTableStatus;
/* -------------------------------------------------------------------------- */
/* TABLE SESSIONS                                                             */
/* -------------------------------------------------------------------------- */
async function openTableSession(input) {
    const { companyId, tableId, openedById, guestCount = 2, serviceMode = "DINE_IN", notes, } = input;
    const table = await prismadb_1.default.restaurantTable.findFirst({
        where: { id: tableId, companyId },
    });
    if (!table)
        throw new Error("Table not found in this company");
    // Create active session
    const session = await prismadb_1.default.tableSession.create({
        data: {
            companyId,
            tableId,
            openedById,
            guestCount: Number(guestCount) || 1,
            serviceMode,
            notes: notes || undefined,
            status: "ACTIVE",
            openedAt: new Date(),
        },
    });
    // Mark table occupied
    await prismadb_1.default.restaurantTable.update({
        where: { id: tableId },
        data: {
            status: client_1.TableStatus.OCCUPIED,
            currentSessionId: session.id,
        },
    });
    return session;
}
exports.openTableSession = openTableSession;
async function updateTableSession(input) {
    const { companyId, sessionId, guestCount, notes } = input;
    return prismadb_1.default.tableSession.update({
        where: { id: sessionId },
        data: {
            ...(guestCount !== undefined ? { guestCount: Number(guestCount) } : {}),
            ...(notes !== undefined ? { notes } : {}),
        },
    });
}
exports.updateTableSession = updateTableSession;
async function closeTableSession(companyId, sessionId) {
    const session = await prismadb_1.default.tableSession.findFirst({
        where: { id: sessionId, companyId },
    });
    if (!session)
        throw new Error("Table session not found");
    await prismadb_1.default.tableSession.update({
        where: { id: sessionId },
        data: {
            status: "CLOSED",
            closedAt: new Date(),
        },
    });
    await prismadb_1.default.restaurantTable.update({
        where: { id: session.tableId },
        data: {
            status: client_1.TableStatus.AVAILABLE,
            currentOrderId: null,
            currentSessionId: null,
        },
    });
    return { success: true };
}
exports.closeTableSession = closeTableSession;
/* -------------------------------------------------------------------------- */
/* MOVE / TRANSFER TABLE                                                      */
/* -------------------------------------------------------------------------- */
async function transferTable(input) {
    const { companyId, fromTableId, toTableId, staffId, staffName, reason } = input;
    if (fromTableId === toTableId) {
        throw new Error("Source and target tables cannot be the same");
    }
    const [fromTable, toTable] = await Promise.all([
        prismadb_1.default.restaurantTable.findFirst({
            where: { id: fromTableId, companyId },
            include: {
                sessions: { where: { status: "ACTIVE" }, take: 1 },
            },
        }),
        prismadb_1.default.restaurantTable.findFirst({
            where: { id: toTableId, companyId },
            include: {
                sessions: { where: { status: "ACTIVE" }, take: 1 },
            },
        }),
    ]);
    if (!fromTable)
        throw new Error("Source table not found");
    if (!toTable)
        throw new Error("Target table not found");
    if (toTable.status === client_1.TableStatus.OCCUPIED && toTable.sessions.length > 0) {
        throw new Error(`Target table ${toTable.tableNumber} is currently occupied. Please choose an available table or merge the orders.`);
    }
    const activeSession = fromTable.sessions[0];
    const orderId = fromTable.currentOrderId || activeSession?.orderId;
    // Perform atomic transfer
    await prismadb_1.default.$transaction(async (tx) => {
        // 1. Move active session to new table
        if (activeSession) {
            await tx.tableSession.update({
                where: { id: activeSession.id },
                data: { tableId: toTableId },
            });
        }
        // 2. Update CustomerOrder table references
        if (orderId) {
            await tx.customerOrder.update({
                where: { id: orderId },
                data: {
                    tableId: toTableId,
                    tableNumber: toTable.tableNumber,
                },
            });
        }
        // 3. Mark fromTable as AVAILABLE
        await tx.restaurantTable.update({
            where: { id: fromTableId },
            data: {
                status: client_1.TableStatus.AVAILABLE,
                currentOrderId: null,
                currentSessionId: null,
            },
        });
        // 4. Mark toTable as OCCUPIED
        await tx.restaurantTable.update({
            where: { id: toTableId },
            data: {
                status: client_1.TableStatus.OCCUPIED,
                currentOrderId: orderId || null,
                currentSessionId: activeSession?.id || null,
            },
        });
        // 5. Create audit record
        if (orderId) {
            await tx.tableTransferAudit.create({
                data: {
                    companyId,
                    fromTableNumber: fromTable.tableNumber,
                    toTableNumber: toTable.tableNumber,
                    orderId,
                    staffId,
                    staffName,
                    reason: reason || "Customer request to relocate",
                    timestamp: new Date(),
                },
            });
        }
    });
    return {
        success: true,
        message: `Transferred successfully from Table ${fromTable.tableNumber} to Table ${toTable.tableNumber}`,
    };
}
exports.transferTable = transferTable;
/* -------------------------------------------------------------------------- */
/* MERGE BILLS / ORDERS                                                       */
/* -------------------------------------------------------------------------- */
async function mergeBills(input) {
    const { companyId, sourceOrderId, targetOrderId, staffId, staffName, reason } = input;
    if (sourceOrderId === targetOrderId) {
        throw new Error("Cannot merge an order into itself");
    }
    const [sourceOrder, targetOrder] = await Promise.all([
        prismadb_1.default.customerOrder.findFirst({
            where: { id: sourceOrderId, companyId },
            include: { items: true },
        }),
        prismadb_1.default.customerOrder.findFirst({
            where: { id: targetOrderId, companyId },
            include: { items: true },
        }),
    ]);
    if (!sourceOrder)
        throw new Error("Source order not found");
    if (!targetOrder)
        throw new Error("Target order not found");
    if (sourceOrder.status === "PAID" || sourceOrder.status === "COMPLETED") {
        throw new Error("Cannot merge an order that has already been paid/finalized");
    }
    await prismadb_1.default.$transaction(async (tx) => {
        // 1. Move all items from sourceOrder to targetOrder
        for (const item of sourceOrder.items) {
            await tx.orderItem.update({
                where: { id: item.id },
                data: { orderId: targetOrderId },
            });
        }
        // 2. Recalculate targetOrder totals
        const newTotalPrice = (targetOrder.totalPrice || 0) + (sourceOrder.totalPrice || 0);
        const newTotalDiscount = (targetOrder.totalDiscount || 0) + (sourceOrder.totalDiscount || 0);
        const newTotalTax = (targetOrder.totalTax || 0) + (sourceOrder.totalTax || 0);
        const newFinalPrice = (targetOrder.totalFinalPrice || 0) + (sourceOrder.totalFinalPrice || 0);
        const mergedFrom = Array.isArray(targetOrder.mergedFromIds) ? targetOrder.mergedFromIds : [];
        mergedFrom.push(sourceOrderId);
        await tx.customerOrder.update({
            where: { id: targetOrderId },
            data: {
                totalPrice: newTotalPrice,
                totalDiscount: newTotalDiscount,
                totalTax: newTotalTax,
                totalFinalPrice: newFinalPrice,
                mergedFromIds: mergedFrom,
            },
        });
        // 3. Close out sourceOrder non-destructively
        await tx.customerOrder.update({
            where: { id: sourceOrderId },
            data: {
                status: "CANCELLED",
                mergedIntoId: targetOrderId,
                notes: `Merged into Order #${targetOrderId}. Staff: ${staffName}. ${reason || ""}`,
            },
        });
        // 4. Release source table if linked
        if (sourceOrder.tableId) {
            await tx.restaurantTable.update({
                where: { id: sourceOrder.tableId },
                data: {
                    status: client_1.TableStatus.AVAILABLE,
                    currentOrderId: null,
                    currentSessionId: null,
                },
            }).catch(() => null);
            if (sourceOrder.tableSessionId) {
                await tx.tableSession.update({
                    where: { id: sourceOrder.tableSessionId },
                    data: { status: "CLOSED", closedAt: new Date() },
                }).catch(() => null);
            }
        }
        // 5. Audit record
        await tx.billMergeAudit.create({
            data: {
                companyId,
                sourceOrderId,
                targetOrderId,
                staffId,
                staffName,
                reason: reason || "Table bill consolidation",
                timestamp: new Date(),
            },
        });
    });
    return {
        success: true,
        message: `Merged Order #${sourceOrderId} into #${targetOrderId}`,
    };
}
exports.mergeBills = mergeBills;
/* -------------------------------------------------------------------------- */
/* SPLIT BILLS                                                                */
/* -------------------------------------------------------------------------- */
async function splitBill(input) {
    const { companyId, orderId, splitType, splits } = input;
    const order = await prismadb_1.default.customerOrder.findFirst({
        where: { id: orderId, companyId },
        include: { items: true },
    });
    if (!order)
        throw new Error("Order not found");
    if (!Array.isArray(splits) || splits.length < 2) {
        throw new Error("Splitting a bill requires at least 2 split shares");
    }
    const totalBill = order.totalFinalPrice || 0;
    const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    // Strict check: sum(splits) must match original bill (tolerance 0.05 for rounding)
    if (Math.abs(splitTotal - totalBill) > 0.05) {
        throw new Error(`Sum of split amounts (${splitTotal.toFixed(2)}) must equal the order total (${totalBill.toFixed(2)})`);
    }
    // Delete previous split drafts for this order if unpaid
    await prismadb_1.default.billSplitRecord.deleteMany({
        where: { companyId, originalOrderId: orderId, paymentStatus: "PENDING" },
    });
    const records = await prismadb_1.default.$transaction(splits.map((s, idx) => prismadb_1.default.billSplitRecord.create({
        data: {
            companyId,
            originalOrderId: orderId,
            splitIndex: idx + 1,
            splitType,
            amount: s.amount,
            items: s.items ?? undefined,
            paymentStatus: "PENDING",
        },
    })));
    return {
        success: true,
        splitRecords: records,
        totalBill,
        totalSplits: splits.length,
    };
}
exports.splitBill = splitBill;
/* -------------------------------------------------------------------------- */
/* TRANSFER ITEMS BETWEEN TABLES                                              */
/* -------------------------------------------------------------------------- */
async function transferOrderItems(input) {
    const { companyId, sourceOrderId, targetOrderId, itemIds, staffName } = input;
    if (sourceOrderId === targetOrderId) {
        throw new Error("Source and target order must be different");
    }
    const [sourceOrder, targetOrder] = await Promise.all([
        prismadb_1.default.customerOrder.findFirst({
            where: { id: sourceOrderId, companyId },
            include: { items: true },
        }),
        prismadb_1.default.customerOrder.findFirst({
            where: { id: targetOrderId, companyId },
            include: { items: true },
        }),
    ]);
    if (!sourceOrder || !targetOrder)
        throw new Error("Orders not found");
    const itemsToMove = sourceOrder.items.filter((i) => itemIds.includes(i.id));
    if (itemsToMove.length === 0) {
        throw new Error("No matching items found to transfer");
    }
    const moveSum = itemsToMove.reduce((sum, i) => sum + (i.totalPrice || (i.price * i.quantity)), 0);
    await prismadb_1.default.$transaction(async (tx) => {
        // 1. Move items to targetOrder
        for (const item of itemsToMove) {
            await tx.orderItem.update({
                where: { id: item.id },
                data: { orderId: targetOrderId },
            });
        }
        // 2. Decrement sourceOrder totals
        const newSourceTotal = Math.max(0, (sourceOrder.totalFinalPrice || 0) - moveSum);
        await tx.customerOrder.update({
            where: { id: sourceOrderId },
            data: {
                totalPrice: Math.max(0, (sourceOrder.totalPrice || 0) - moveSum),
                totalFinalPrice: newSourceTotal,
            },
        });
        // 3. Increment targetOrder totals
        const newTargetTotal = (targetOrder.totalFinalPrice || 0) + moveSum;
        await tx.customerOrder.update({
            where: { id: targetOrderId },
            data: {
                totalPrice: (targetOrder.totalPrice || 0) + moveSum,
                totalFinalPrice: newTargetTotal,
            },
        });
    });
    return {
        success: true,
        movedItemsCount: itemsToMove.length,
        movedAmount: moveSum,
    };
}
exports.transferOrderItems = transferOrderItems;
/* -------------------------------------------------------------------------- */
/* KITCHEN DISPATCH                                                           */
/* -------------------------------------------------------------------------- */
async function sendOrderToKitchen(companyId, orderId, staffName) {
    const order = await prismadb_1.default.customerOrder.findFirst({
        where: { id: orderId, companyId },
    });
    if (!order)
        throw new Error("Order not found");
    await prismadb_1.default.$transaction([
        prismadb_1.default.customerOrder.update({
            where: { id: orderId },
            data: {
                kitchenStatus: "SENT",
                kitchenSentAt: new Date(),
            },
        }),
        prismadb_1.default.orderItem.updateMany({
            where: { orderId, kitchenStatus: "PENDING" },
            data: { kitchenStatus: "COOKING" },
        }),
    ]);
    return { success: true, orderId, kitchenStatus: "SENT" };
}
exports.sendOrderToKitchen = sendOrderToKitchen;
