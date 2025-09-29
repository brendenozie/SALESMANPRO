// app/api/admin/products/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse, verifyAuth } from "@/lib/verifyAuth";

// GET /api/admin/products - Get all products with stock summary
export const GET = withApiHandler(async (request: Request) => {
const auth = await verifyAuth(request);
if (!auth.success) return formatResponse(false, null, auth.error, 401);

const products = await prisma.product.findMany({
include: {
productCategory: true,
inventoryItems: {
include: {
AgentInventory: true,
},
},
},
});

const formattedProducts = products.map((product) => {
const inventoryId = product.inventoryItems.map((item) => item.id);


// Company stock
const companyStock = product.inventoryItems.reduce(
  (sum, item) => sum + item.quantity,
  0
);

// Agent stock
const agentStock = product.inventoryItems.reduce((sum, item) => {
  const agentStockSum = item.AgentInventory.reduce(
    (agentSum, agentItem) => agentSum + agentItem.quantity,
    0
  );
  return sum + agentStockSum;
}, 0);

return {
  id: product.id,
  name: product.name,
  companyId: product.companyId,
  inventoryId,
  category: product.productCategory?.name || "Uncategorized",
  companyStock,
  agentStock,
  salesPrice: product.salesPrice,
};

});

return formatResponse(true, formattedProducts, "Products fetched successfully", 200);
});
