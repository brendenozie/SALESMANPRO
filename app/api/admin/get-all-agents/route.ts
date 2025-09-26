

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
    const agents = await prisma.salesAgent.findMany({
        where: { companyId },
        select: { id: true, 
            // name: true 

        }
    });

    // 3. Return the successful response
    return formatResponse(true, agents, 'Sales agents fetched successfully', 200);
};

// Export the wrapped GET function
// Authentication and generic error handling are now centralized by withApiHandler.
export const GET = withApiHandler(getAgentsLogic);
