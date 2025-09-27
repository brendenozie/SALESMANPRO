import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET Handler: Fetches a paginated, filtered, and sorted list of inventory items.
 */
async function getInventoryItems(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  // Authentication, try/catch are handled by withApiHandler.
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  // --- Parameter Parsing ---
  const filterCategory = searchParams.get("category");
  const lowStockFilter = searchParams.get("lowStock"); // 'true' or 'false'
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "quantity", "updatedAt"];
  if (!validSortBy.includes(sortBy)) {
    return formatResponse(false, null, "Invalid sortBy parameter", 400);
  }
  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return formatResponse(false, null, "Invalid sortOrder parameter", 400);
  }

  // 1. Find Company
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // 2. Build Where Clause
  const whereClause: any = {
    companyId: company.id,
  };

  if (filterCategory && filterCategory !== 'All') {
    whereClause.product = {
      productCategory: {
        name: filterCategory
      }
    };
  }

  // Note: Low Stock check must use the native Prisma field reference for comparison
  if (lowStockFilter === 'true') {
    whereClause.quantity = {
      lte: prisma.inventoryItem.fields.reorderThreshold
    };
  }

  if (searchKeyword) {
    whereClause.product = {
      ...whereClause.product, // Preserve existing product filters
      OR: [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ]
    };
  }

  // Determine OrderBy configuration (requires a check for 'name' which is a relation)
  let orderByClause: any = {};

  if (sortBy === 'name') {
    orderByClause = { product: { name: sortOrder } };
  } else if (sortBy === 'lastUpdated') {
    // Assuming 'lastUpdated' maps to the `updatedAt` field
    orderByClause = { updatedAt: sortOrder };
  } else {
    orderByClause = { [sortBy]: sortOrder };
  }


  // 3. Fetch Data in Transaction
  const [inventoryItems, totalItems] = await prisma.$transaction([
    prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        quantity: true,
        reorderThreshold: true,
        updatedAt: true,
        product: {
          select: {
            name: true,
            productCategory: { select: { name: true } }
          }
        }
      },
    }),
    prisma.inventoryItem.count({ where: whereClause }),
  ]);

  // 4. Format Response Data
  const formattedInventory = inventoryItems.map(item => ({
    id: item.id,
    name: item.product?.name || 'N/A Product',
    category: item.product?.productCategory?.name || 'Uncategorized',
    stock: item.quantity,
    minStock: item.reorderThreshold || 0,
    lastUpdated: new Date(item.updatedAt || '').toISOString().split('T')[0],
  }));

  return formatResponse(true, {
    inventory: formattedInventory,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  }, "Inventory items fetched successfully", 200);
}

/**
 * POST Handler: Adds a new product to inventory or restocks an existing one.
 */
async function createOrRestockItem(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { productId, quantity, reorderThreshold, userId } = body; // userId of the admin for logging

  // --- Input Validation ---
  if (!productId || quantity === undefined) {
    return formatResponse(false, null, "Missing required fields: productId, quantity", 400);
  }
  const parsedQuantity = parseInt(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity < 0) {
    return formatResponse(false, null, "Quantity must be a non-negative number.", 400);
  }

  // 1. Find Company
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // 2. Verify Product Existence and Ownership
  const product = await prisma.product.findUnique({
    where: { id: productId, companyId: company.id },
    select: { id: true, name: true }
  });
  if (!product) {
    return formatResponse(false, null, "Product not found or not associated with this company", 404);
  }

  // 3. Check for existing InventoryItem
  let inventoryItem = await prisma.inventoryItem.findFirst({
    where: { productId: product.id, companyId: company.id },
  });

  let logEntry;
  let responseMessage = "";

  if (inventoryItem) {
    // A. RESTOCK/UPDATE existing item
    const transactionResult = await prisma.$transaction(async (tx) => {
        const updatedItem = await tx.inventoryItem.update({
            where: { id: inventoryItem!.id },
            data: {
                quantity: { increment: parsedQuantity },
                reorderThreshold: reorderThreshold !== undefined ? parseInt(reorderThreshold) : inventoryItem!.reorderThreshold,
                updatedAt: new Date(),
            },
        });
        const log = await tx.inventoryLog.create({
            data: {
                inventoryId: updatedItem.id,
                action: "RESTOCK",
                quantity: parsedQuantity,
                userId: userId,
                details: `Stock increased by ${parsedQuantity}`
            }
        });
        return { updatedItem, log };
    });
    inventoryItem = transactionResult.updatedItem;
    logEntry = transactionResult.log;
    responseMessage = "Inventory item restocked successfully";

  } else {
    // B. CREATE new InventoryItem
    const transactionResult = await prisma.$transaction(async (tx) => {
        const newItem = await tx.inventoryItem.create({
            data: {
                productId: product.id,
                companyId: company.id,
                quantity: parsedQuantity,
                reorderThreshold: reorderThreshold !== undefined ? parseInt(reorderThreshold) : 0,
            },
        });
        const log = await tx.inventoryLog.create({
            data: {
                inventoryId: newItem.id,
                action: "INITIAL_ADD",
                quantity: parsedQuantity,
                userId: userId,
                details: "New product added to inventory"
            }
        });
        return { newItem, log };
    });
    inventoryItem = transactionResult.newItem;
    logEntry = transactionResult.log;
    responseMessage = "New inventory item added successfully";
  }

  return formatResponse(true, {
    item: inventoryItem,
    logId: logEntry.id,
  }, responseMessage, 201);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getInventoryItems);
export const POST = withApiHandler(createOrRestockItem);
