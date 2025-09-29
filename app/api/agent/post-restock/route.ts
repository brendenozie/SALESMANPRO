typescript
// app/api/post/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function handleInventory(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

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
    target,
  } = body;

  // Validation
  if (!productId || !action || !quantity || quantity <= 0) {
    return formatResponse(false, null, "Invalid product ID or quantity", 400);
  }

  try {
    let inventoryItem = await prisma.inventoryItem.findFirst({
      where: { productId },
    });

    // Handle NEWSTOCK
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

      return formatResponse(true, inventoryItem, "New inventory item added", 201);
    }

    if (!inventoryItem) {
      return formatResponse(false, null, "Inventory item not found", 404);
    }

    // Handle RESTOCK
    if (action === "RESTOCK") {
      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: inventoryItem.quantity + quantity,
          updatedAt: new Date(),
        },
      });

      await prisma.inventoryLog.create({
        data: {
          inventoryId: inventoryItem.id,
          action,
          damaged,
          quantity,
        },
      });

      return formatResponse(true, updatedInventory, "Product restocked successfully", 200);
    }

    // Handle ASSIGN
    if (action === "ASSIGN") {
      if (inventoryItem.quantity < quantity) {
        return formatResponse(false, null, "Insufficient inventory quantity", 400);
      }

      let agentInventoryItem = await prisma.agentInventory.findFirst({
        where: { inventoryItemId: inventoryItem.id },
      });

      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: inventoryItem.quantity - quantity,
          updatedAt: new Date(),
        },
      });

      const commission = await prisma.commission.upsert({
        where: { salesAgentId_productId: { salesAgentId, productId: inventoryItem.productId } },
        update: {
          commissionEarned: { increment: quantity * commissionRate },
          updatedAt: new Date(),
        },
        create: {
          salesAgentId,
          productId: inventoryItem.productId,
          commissionRate,
          commissionEarned: quantity * commissionRate,
          basedOn: "QUANTITY",
        },
      });

      const targetP = await prisma.target.upsert({
        where: { salesAgentId_productId: { salesAgentId, productId: inventoryItem.productId } },
        update: { achievedValue: { increment: quantity }, updatedAt: new Date() },
        create: {
          salesAgentId,
          productId: inventoryItem.productId,
          targetType: target?.type,
          targetValue: target?.value,
          achievedValue: quantity,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      if (!agentInventoryItem) {
        agentInventoryItem = await prisma.agentInventory.create({
          data: { salesAgentId, inventoryItemId: inventoryItem.id, quantity },
        });

        await prisma.inventoryLog.create({
          data: { inventoryId: inventoryItem.id, action: "ASSIGN", damaged, quantity },
        });

        return formatResponse(
          true,
          { inventory: updatedInventory, commission, targetP },
          "Product assigned successfully",
          200
        );
      }

      await prisma.agentInventory.update({
        where: { id: agentInventoryItem.id },
        data: { quantity: agentInventoryItem.quantity + quantity, updatedAt: new Date() },
      });

      await prisma.agentInventoryLog.create({
        data: {
          agentInventoryId: agentInventoryItem.id,
          action,
          damaged,
          totalPrice: 100, // TODO: calculate actual total price
          quantity,
        },
      });

      return formatResponse(
        true,
        { inventory: updatedInventory, commission, targetP },
        "Product assigned successfully",
        200
      );
    }

    // Handle RETURN
    if (action === "RETURN") {
      const agentInventoryItem = await prisma.agentInventory.findFirst({
        where: { inventoryItemId: inventoryItem.id },
      });

      if (!agentInventoryItem || agentInventoryItem.quantity < quantity) {
        return formatResponse(false, null, "Insufficient agent inventory quantity", 400);
      }

      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: inventoryItem.quantity + quantity,
          updatedAt: new Date(),
        },
      });

      await prisma.agentInventory.update({
        where: { id: agentInventoryItem.id },
        data: { quantity: agentInventoryItem.quantity - quantity, updatedAt: new Date() },
      });

      await prisma.agentInventoryLog.create({
        data: {
          agentInventoryId: agentInventoryItem.id,
          action,
          damaged,
          totalPrice: 100,
          quantity,
        },
      });

      await prisma.return.create({
        data: {
          inventoryItem: { connect: { id: inventoryItem.id } },
          returnedBy: { connect: { id: salesAgentId } },
          quantity,
          reason,
          ApprovedBy: { connect: { id: adminId } },
        },
      });

      await prisma.inventoryLog.create({
        data: { inventoryId: inventoryItem.id, action, damaged, quantity },
      });

      return formatResponse(true, updatedInventory, "Product returned successfully", 200);
    }

    return formatResponse(false, null, "Invalid action or quantity", 400);
  } catch (error: any) {
    console.error("Inventory Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export const POST = withApiHandler(handleInventory);

