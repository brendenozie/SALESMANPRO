import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  action: z.enum(["NEWSTOCK", "RESTOCK", "ASSIGN", "RETURN", "REQUEST"]),
  damaged: z.boolean().optional(),
  companyId: z.string().optional(),
  salesAgentId: z.string().optional(),
  reason: z.string().optional(),
  adminId: z.string().optional(),
  commissionRate: z.number().optional(),
  commissionType: z.string().optional(),
  target: z
    .object({
      type: z.string(),
      value: z.number(),
    })
    .optional(),
});

async function handleNewStock(data: { productId: string; quantity: number; action: "NEWSTOCK" | "RESTOCK" | "ASSIGN" | "RETURN" | "REQUEST"; damaged?: boolean | undefined; companyId?: string | undefined; salesAgentId?: string | undefined; reason?: string | undefined; adminId?: string | undefined; commissionRate?: number | undefined; commissionType?: string | undefined; target?: { value: number; type: string; } | undefined; }) {
  const { productId, quantity, companyId, damaged } = data;

  const inventoryItem = await prisma.inventoryItem.create({
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
      damaged: damaged ? 1 : 0,
      quantity,
    },
  });

  return { message: "New inventory item added.", inventory: inventoryItem };
}

async function handleRestock(data: { productId: string; quantity: number; action: "NEWSTOCK" | "RESTOCK" | "ASSIGN" | "RETURN" | "REQUEST"; damaged?: boolean | undefined; companyId?: string | undefined; salesAgentId?: string | undefined; reason?: string | undefined; adminId?: string | undefined; commissionRate?: number | undefined; commissionType?: string | undefined; target?: { value: number; type: string; } | undefined; }) {
  const { productId, quantity, damaged } = data;

  const inventoryItem = await prisma.inventoryItem.findFirst({ where: { productId } });
  if (!inventoryItem) throw new Error("Inventory item not found.");

  const updatedInventory = await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { quantity: inventoryItem.quantity + quantity, updatedAt: new Date() },
  });

  await prisma.inventoryLog.create({
    data: {
      inventoryId: inventoryItem.id,
      action: "RESTOCK",
      damaged,
      quantity,
    },
  });

  return { message: "Product restocked successfully.", inventory: updatedInventory };
}

async function handleAssign(data: { productId: string; quantity: number; action: "NEWSTOCK" | "RESTOCK" | "ASSIGN" | "RETURN" | "REQUEST"; damaged?: boolean | undefined; companyId?: string | undefined; salesAgentId?: string | undefined; reason?: string | undefined; adminId?: string | undefined; commissionRate?: number | undefined; commissionType?: string | undefined; target?: { value: number; type: string; } | undefined; }) {
  const { productId, quantity, salesAgentId, commissionRate, commissionType, target } = data;

  const inventoryItem = await prisma.inventoryItem.findFirst({ where: { productId } });
  if (!inventoryItem || inventoryItem.quantity < quantity) throw new Error("Insufficient inventory quantity.");

  const updatedInventory = await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { quantity: inventoryItem.quantity - quantity, updatedAt: new Date() },
  });

  if (!salesAgentId || !productId || !commissionRate || !commissionType) throw new Error("Sales agent ID and product ID must be provided.");

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
    where: { salesAgentId_productId: { salesAgentId, productId } },
    update: { achievedValue: { increment: quantity }, updatedAt: new Date() },
    create: {
      salesAgentId,
      productId,
      targetType: target?.type || '',
      targetValue: target?.value || 0,
      achievedValue: quantity,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  return { message: "Product assigned successfully.", inventory: updatedInventory, commission, target: targetP };
}

async function handleReturn(data: { productId: string; quantity: number; action: "NEWSTOCK" | "RESTOCK" | "ASSIGN" | "RETURN" | "REQUEST"; damaged?: boolean | undefined; companyId?: string | undefined; salesAgentId?: string | undefined; reason?: string | undefined; adminId?: string | undefined; commissionRate?: number | undefined; commissionType?: string | undefined; target?: { value: number; type: string; } | undefined; }) {
  const { productId, quantity, salesAgentId, reason, adminId } = data;

  const inventoryItem = await prisma.inventoryItem.findFirst({ where: { productId } });
  const agentInventoryItem = await prisma.agentInventory.findFirst({
    where: { inventoryItemId: inventoryItem?.id },
  });

  if (!inventoryItem || !agentInventoryItem || agentInventoryItem.quantity < quantity)
    throw new Error("Insufficient agent inventory quantity.");

  const updatedInventory = await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { quantity: inventoryItem.quantity + quantity, updatedAt: new Date() },
  });

  await prisma.agentInventory.update({
    where: { id: agentInventoryItem.id },
    data: { quantity: agentInventoryItem.quantity - quantity, updatedAt: new Date() },
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

  return { message: "Product returned successfully.", inventory: updatedInventory };
}

async function handleRequest(data: { productId: string; quantity: number; action: "NEWSTOCK" | "RESTOCK" | "ASSIGN" | "RETURN" | "REQUEST"; damaged?: boolean | undefined; companyId?: string | undefined; salesAgentId?: string | undefined; reason?: string | undefined; adminId?: string | undefined; commissionRate?: number | undefined; commissionType?: string | undefined; target?: { value: number; type: string; } | undefined; }) {
  const { productId, quantity, salesAgentId, adminId } = data;

  const request = await prisma.request.create({
    data: {
      requestedById: salesAgentId,
      ApprovedById: adminId,
      productId,
      quantity,
      status: "PENDING",
    },
  });

  return { message: "Request submitted successfully.", request };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const data = schema.parse(req.body);

    let result;
    switch (data.action) {
      case "NEWSTOCK":
        result = await handleNewStock(data);
        break;
      case "RESTOCK":
        result = await handleRestock(data);
        break;
      case "ASSIGN":
        result = await handleAssign(data);
        break;
      case "RETURN":
        result = await handleReturn(data);
        break;
      case "REQUEST":
        result = await handleRequest(data);
        break;
      default:
        throw new Error("Invalid action.");
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(400).json({ error: error.message || "Internal Server Error" });
  }
}
