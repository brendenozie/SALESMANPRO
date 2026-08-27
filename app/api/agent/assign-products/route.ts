// app/api/admin/agents/assign/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const POST = withApiHandler(async (request: Request) => {
const auth = await verifyAuth(request);
if (!auth.success) return formatResponse(false, null, auth.error, 401);

const body = await request.json();
const { agentInventoryId, clientId, quantity } = body;

// Enhanced validation
if (
!agentInventoryId ||
typeof agentInventoryId !== "string" ||
!clientId ||
typeof clientId !== "string" ||
!quantity ||
quantity <= 0 ||
!Number.isInteger(quantity)
) {
return formatResponse(
false,
null,
"Invalid input data. Please verify all fields.",
400
);
}

try {
const transaction = await prisma.$transaction(async (prisma) => {
const agentInventory = await prisma.agentInventory.findUnique({
where: { id: agentInventoryId },
include: {
inventoryItem: { include: { product: true } },
salesAgent: true,
},
});


  if (!agentInventory) throw new Error("Agent inventory item not found.");
  if (agentInventory.quantity < quantity)
    throw new Error("Insufficient stock.");

  // Reduce stock from agent
  await prisma.agentInventory.update({
    where: { id: agentInventoryId },
    data: { quantity: { decrement: quantity } },
  });

  // Assign inventory to client
  const clientInventory = await prisma.clientInventory.upsert({
    where: {
      clientId_inventoryItemId: {
        clientId,
        inventoryItemId: agentInventory.inventoryItemId,
      },
    },
    update: { quantity: { increment: quantity } },
    create: {
      clientId,
      inventoryItemId: agentInventory.inventoryItemId,
      agentInventoryId,
      salesAgentId: agentInventory.salesAgentId,
      quantity,
    },
  });

  // Calculate commissions
  const product = agentInventory.inventoryItem.product;
  const commissions: any[] = [];
  const productCommissions = await prisma.commission.findMany({
    where: { productId: product.id },
  });

  // Safely resolve a numeric sales price from the product (handle different possible field names)
  const resolvedSalesPrice = Number(
    (product as any).salesPrice ?? (product as any).salePrice ?? (product as any).price ?? 0
  );

  for (const pc of productCommissions) {
    const { commissionRate = 0, basedOn } = pc;
    const finalPrice = resolvedSalesPrice;
    const commissionEarned = commissionRate * finalPrice * quantity;

    if (commissionEarned > 0) {
      commissions.push(
        await prisma.commission.create({
          data: {
            salesAgentId: agentInventory.salesAgentId,
            productId: product.id,
            commissionRate,
            commissionEarned,
            basedOn,
          },
        })
      );
    }
  }

  return { clientInventory, commissions };
});

return formatResponse(
  true,
  transaction,
  "Product successfully assigned to client.",
  200
);


} catch (error: any) {
console.error("Error:", error.message || error);
return formatResponse(
false,
null,
error.message || "An error occurred.",
500
);
}
});
