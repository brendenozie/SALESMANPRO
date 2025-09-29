// app/api/admin/get-all-agents/route.ts
import prisma from "@/server/db/prismadb"; 
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * Core handler logic to fetch all sales agents and their inventory.
 * Authentication, authorization (e.g., admin check), try/catch, and
 * response wrapping (200 OK) are assumed to be handled by withApiHandler.
 * * NOTE: The original logic fetched ALL agents without pagination. This
 * should be reviewed for potential performance issues if you have many agents.
 */
async function fetchAllAgents() {
  // NOTE: Authentication and `try/catch` are handled by `withApiHandler`.

  // --- Data Fetching ---
  // Fetch all agents and their AgentInventory entries (with product details)
  const agents = await prisma.salesAgent.findMany({
    include: {
      AgentInventory: {
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
      }, // Include user details if needed
    },
  });

  // --- Data Transformation ---
  // Format the data for the client
  const formatted = agents.map((agent) => {
    // Build an inventory list of { productId, productName, quantity }
    const inventory = agent.AgentInventory.map((entry) => ({
      productId: entry.inventoryItem.product.id,
      productName: entry.inventoryItem.product.name,
      quantity: entry.quantity,
    }));

    // Sum up total quantity assigned to this agent
    const totalAssigned = inventory.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: agent.id,
      name: agent.user.name,
      email: agent.user.email,
      totalAssigned,
      inventory,
    };
  });

  // --- Success Response ---
  // Return the raw data structure. `withApiHandler` will wrap this in a 200 OK NextResponse.
  return formatResponse(true, formatted, 'All sales agents fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchAllAgents);