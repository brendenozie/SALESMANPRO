import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * Core handler logic for updating a specific AMA (e.g., incrementing reactions).
 * This function handles the PUT request logic.
 * * * This function assumes:
 * 1. Authentication/Authorization is performed by `withApiHandler`.
 * 2. Automatic try/catch wrapping (for 500 errors) is performed by `withApiHandler`.
 */
async function updateAma(
  req: Request,
  { params }: { params: { id: string } }
) {
  // NOTE: Manual authentication (verifyAuth) is handled by withApiHandler.

  // Extract the ID from the URL parameters
  const amaId = params.id;

  // --- Validation ---
  if (!amaId) {
    return formatResponse(false, null, 'Missing required route parameter: id (amaId)', 400);
  }
  
  // The original route handler only included the PUT method logic.
  // We will assume the goal is a simple reaction increment update.

  // --- Update Logic ---
  // The original Prisma update logic was commented out, but we include it here
  // as the intended action for the PUT request.
  const ama = await prisma.booking.update({
    where: {
      id: amaId,
    },
    data: {
      reactions: {
        increment: 1,
      },
    },
    select: { id: true, reactions: true, status: true }
  });

  // --- Success Response ---
  // The response structure mimics the original handler's mock data.
  return formatResponse(true, { 
      id: ama.id, 
      reactions: ama.reactions, 
      status: ama.status 
  }, 'AMA reaction count incremented successfully', 200);

  // Note: Since `withApiHandler` only wraps the core function, there is no need
  // for an `else { return res.status(404).end() }` block; any method other than PUT
  // will be handled by Next.js's routing (which returns a 405 if PUT is the only export).
}

// Export the PUT method wrapped with the API handler.
export const PUT = withApiHandler(updateAma);

// If this route were also expected to handle a GET request using the search params,
// we would add an export const GET = withApiHandler(getAmaDetails); function.
