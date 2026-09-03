import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";


import prisma from "@/server/db/prismadb"; 
// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Define the logic for fetching sales agents
const getAgentsLogic = async (req: Request) => {
    // 1. Get companyId from search parameters
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        // Use formatResponse to return a 400 error
        return formatResponse(false, null, 'Missing companyId query parameter', 400);
    }

    // 2. Fetch the agents
    
    const cacheKey = buildTenantCacheKey(companyId, "get-all-agents", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const agents = await prisma.salesAgent.findMany({
        where: { companyId },
        include: { user: {
            select: { id: true, name: true, email: true }
        } } // Include related user data
    });

    try {
      if (agents) {
        await cacheSet(cacheKey, agents, 60);
      }
    } catch (e) {}

    // 3. Return the successful response
    return formatResponse(true, agents, 'Sales agents fetched successfully', 200);
};

// Export the wrapped GET function
// Authentication and generic error handling are now centralized by withApiHandler.
export const GET = withApiHandler(getAgentsLogic);
