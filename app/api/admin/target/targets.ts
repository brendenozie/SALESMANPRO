import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/targets
async function handleGET(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const targets = await prisma.target.findMany({
      include: {
        salesAgent: true,
        product: true,
      },
    });

    return formatResponse(true, targets);
  } catch (error: any) {
    console.error("Error fetching targets:", error);
    return formatResponse(false, null, "Failed to fetch targets", 500);
  }
}

// Export the handler wrapped with withApiHandler
export const GET = withApiHandler(handleGET);
