import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// POST handler for inventory actions in App Router
export async function POST(req: Request) {
  try {
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
      commissionType,
      target,
    } = body;

    if (!productId || !action || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID or quantity." },
        { status: 400 }
      );
    }

    // Find existing inventory item
    let inventoryItem = await prisma.inventoryItem.findFirst({ where: { productId } });

    // Create new inventory on RESTOCK/NEWSTOCK if missing
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

      return NextResponse.json(
        { message: "New inventory item added.", inventory: inventoryItem },
        { status: 201 }
      );
    }

    if (!inventoryItem) {
      return NextResponse.json(
        { error: "Inventory item not found." },
        { status: 404 }
      );
    }

    // RESTOCK
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

      return NextResponse.json(
        { message: "Product restocked successfully.", inventory: updatedInventory },
        { status: 200 }
      );
    }

    // ASSIGN
    if (action === "ASSIGN") {
      if (inventoryItem.quantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient inventory quantity." },
          { status: 400 }
        );
      }

      // Decrement main inventory
      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: inventoryItem.quantity - quantity, updatedAt: new Date() },
      });

      // Upsert commission record
      const commission = await prisma.commission.upsert({
        where: { salesAgentId_productId: { salesAgentId, productId } },
        update: {
          commissionEarned: { increment: quantity * commissionRate },
          updatedAt: new Date(),
        },
        create: {
          salesAgentId,
          productId,
          commissionRate,
          commissionEarned: quantity * commissionRate,
          basedOn: commissionType,
        },
      });

      // Upsert target record
      const targetP = await prisma.target.upsert({
        where: { salesAgentId_productId: { salesAgentId, productId } },
        update: {
          achievedValue: { increment: quantity },
          updatedAt: new Date(),
        },
        create: {
          salesAgentId,
          productId,
          targetType: target.type,
          targetValue: target.value,
          achievedValue: quantity,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      // Upsert agent inventory
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

      // Logs
      await prisma.inventoryLog.create({ data: { inventoryId: inventoryItem.id, action: "ASSIGN", damaged, quantity } });
      await prisma.agentInventoryLog.create({
        data: { agentInventoryId: agentInventory.id, action: "ASSIGN", damaged, quantity, totalPrice: 100 },
      });

      return NextResponse.json(
        { message: "Product assigned successfully.", inventory: updatedInventory, commission, targetP },
        { status: 200 }
      );
    }

    // RETURN
    if (action === "RETURN") {
      const agentInventory = await prisma.agentInventory.findFirst({
        where: { inventoryItemId: inventoryItem.id, salesAgentId },
      });

      if (!agentInventory || agentInventory.quantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient agent inventory quantity." },
          { status: 400 }
        );
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
          ApprovedBy: { connect: { id: adminId } },
        },
      });

      await prisma.inventoryLog.create({
        data: { inventoryId: inventoryItem.id, action: "RETURN", damaged, quantity },
      });

      return NextResponse.json(
        { message: "Product returned successfully.", inventory: updatedInventory },
        { status: 200 }
      );
    }

    // Unsupported action
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Inventory Handler Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
