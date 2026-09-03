import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/get-all-agents/route.ts
import prisma from "@/server/db/prismadb"; 
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function fetchAllAgents(request: Request) {

    // 1. Get companyId from search
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        // Use formatResponse to return a 400 error
        return formatResponse(false, null, 'Missing companyId query parameter', 400);
    }

  // NOTE: Authentication and `try/catch` are handled by `withApiHandler`.

  // --- Data Fetching ---
  // Fetch all agents and their AgentInventory entries (with product details)
  
    const cacheKey = buildTenantCacheKey(companyId, "get-all-inventory-agents", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const agents = await prisma.salesAgent.findMany({
    where: {
      AgentInventory: {
        some: {
          inventoryItem: {
            product: {
              is: {}, // ✅ means "relation must exist" (i.e. not null)
            },
          },
        },
      },
    },
    include: {
      AgentInventory: {
        where: {
          inventoryItem: {
            product: {
              is: {}, // ✅ again, ensures product is present
            },
          },
        },
        include: {
          inventoryItem: {
            include: {
              product: true,
            },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // --- Data Transformation ---
  // Format the data for the client

  const formatted = agents.map((agent) => {
    // Build an inventory list of { productId, productName, quantity }
    const inventory = agent.AgentInventory.map((entry) => {
    const product = entry.inventoryItem.product;
        return {
          productId: product?.id ?? null,
          productName: product?.name ?? "Unknown Product",
          quantity: entry.quantity,
        };
      });

    // Sum up total quantity assigned to this agent
    const totalAssigned = inventory.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: agent.id,
      name: agent.user?.name ?? "No name",
      email: agent.user?.email ?? "No email",
      totalAssigned,
      inventory,
    };
  });

  try {
    if (formatted) {
      await cacheSet(cacheKey, formatted, 60);
    }
  } catch (e) {}

  // --- Success Response ---
  // Return the raw data structure. `withApiHandler` will wrap this in a 200 OK NextResponse.
  return formatResponse(true, formatted, 'All sales agents fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchAllAgents);