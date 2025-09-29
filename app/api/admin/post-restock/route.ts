// app/api/inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { TargetStatus } from "@prisma/client";

export const POST = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  const body = await req.json();
  const {
    productId,
    quantity,
    damaged,
    action,
    companyId,
    salesAgentId,
    reason,
    adminId,
    commissionRate,
    commissionType,
    target,
  } = body;

  if (!productId || !action || !quantity || quantity <= 0) {
    return formatResponse(false, null, "Invalid product ID or quantity.", 400);
  }

  // Find existing inventory item
  let inventoryItem = await prisma.inventoryItem.findFirst({ where: { productId } });

  // --- NEWSTOCK / RESTOCK when item missing ---
  if (!inventoryItem && (action === "RESTOCK" || action === "NEWSTOCK")) {
    inventoryItem = await prisma.inventoryItem.create({
      data: {
        product: { connect: { id: productId } },
        company: { connect: { id: companyId } },
        quantity,
        reorderThreshold: 10,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        inventoryId: inventoryItem.id,
        action: "NEWSTOCK",
        damaged,
        quantity,
      },
    });

    return formatResponse(true, { inventory: inventoryItem }, "New inventory item added.", 201);
  }

  if (!inventoryItem) {
    return formatResponse(false, null, "Inventory item not found.", 404);
  }

  // --- RESTOCK ---
  if (action === "RESTOCK") {
    const updatedInventory = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: inventoryItem.quantity + quantity, updatedAt: new Date() },
    });

    await prisma.inventoryLog.create({
      data: { inventoryId: inventoryItem.id, action, damaged, quantity },
    });

    return formatResponse(true, { inventory: updatedInventory }, "Product restocked successfully.", 200);
  }

  // --- ASSIGN ---
  if (action === "ASSIGN") {
    if (inventoryItem.quantity < quantity) {
      return formatResponse(false, null, "Insufficient inventory quantity.", 400);
    }

    const updatedInventory = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: inventoryItem.quantity - quantity, updatedAt: new Date() },
    });

    const commission = await prisma.commission.upsert({
      where: { salesAgentId_productId: { salesAgentId, productId } },
      update: { commissionEarned: { increment: quantity * commissionRate }, updatedAt: new Date() },
      create: {
        salesAgentId,
        productId,
        commissionRate,
        commissionEarned: quantity * commissionRate,
        basedOn: commissionType,
      },
    });

    const targetP = await prisma.target.upsert({
      where: { 
        
      },
      update: { achievedValue: { increment: quantity }, updatedAt: new Date() },
      create: {
        salesAgent: { connect: { id: salesAgentId } },
        productId,
        targetType: target.type, //  COST or QUANTITY
        targetValue: target.value,
        achievedValue: quantity,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        metricType: target.metricType, //, "SALES_VOLUME", "NUMBER_OF_CLIENTS"
        periodStart: new Date(),
        periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: "ONGOING" as TargetStatus,
      },
    });

    let agentInventory = await prisma.agentInventory.findFirst({
      where: { inventoryItemId: inventoryItem.id, salesAgentId },
    });

    if (!agentInventory) {
      agentInventory = await prisma.agentInventory.create({
        data: { salesAgentId, inventoryItemId: inventoryItem.id, quantity },
      });
    } else {
      agentInventory = await prisma.agentInventory.update({
        where: { id: agentInventory.id },
        data: { quantity: agentInventory.quantity + quantity, updatedAt: new Date() },
      });
    }

    await prisma.inventoryLog.create({ data: { inventoryId: inventoryItem.id, action: "ASSIGN", damaged, quantity } });
    await prisma.agentInventoryLog.create({
      data: { agentInventoryId: agentInventory.id, action: "ASSIGN", damaged, quantity, totalPrice: 100 },
    });

    return formatResponse(
      true,
      { inventory: updatedInventory, commission, target: targetP },
      "Product assigned successfully.",
      200
    );
  }

  // --- RETURN ---
  if (action === "RETURN") {
    const agentInventory = await prisma.agentInventory.findFirst({
      where: { inventoryItemId: inventoryItem.id, salesAgentId },
    });

    if (!agentInventory || agentInventory.quantity < quantity) {
      return formatResponse(false, null, "Insufficient agent inventory quantity.", 400);
    }

    const updatedInventory = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: inventoryItem.quantity + quantity, updatedAt: new Date() },
    });

    await prisma.agentInventory.update({
      where: { id: agentInventory.id },
      data: { quantity: agentInventory.quantity - quantity, updatedAt: new Date() },
    });

    await prisma.agentInventoryLog.create({
      data: { agentInventoryId: agentInventory.id, action: "RETURN", damaged, quantity, totalPrice: 100 },
    });

    await prisma.return.create({
      data: {
        inventoryItem: { connect: { id: inventoryItem.id } },
        returnedBy: { connect: { id: salesAgentId } },
        quantity,
        reason,
        ReturnApprovedBy: { connect: { id: adminId } },
      },
    });

    await prisma.inventoryLog.create({ data: { inventoryId: inventoryItem.id, action: "RETURN", damaged, quantity } });

    return formatResponse(true, { inventory: updatedInventory }, "Product returned successfully.", 200);
  }

  return formatResponse(false, null, "Invalid action.", 400);
});
