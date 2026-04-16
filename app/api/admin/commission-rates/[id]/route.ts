import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
// Note: Removed NextApiRequest, NextApiResponse, and NextJs Response objects (NextResponse).


async function getTaskById(
  req: Request,
  { params }: { params: { id: string } }
) {
  // NOTE: Manual authentication (verifyAuth) and try/catch are removed.
  
  const amaId = params.id; // Renaming variable to be more domain-specific, matching your original code
  const { searchParams } = new URL(req.url);

  // --- Pagination Parameter Validation (Even though we only fetch one item) ---
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  
  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters.",
      400
    );
  }
  
  // --- Path Parameter Validation ---
  if (!amaId) {
    return formatResponse(false, null, 'Missing required route parameter: id (taskId)', 400);
  }

  const cacheKey = `admin:get-task:${amaId || 'global'}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  // --- Data Fetching ---
  const task = await prisma.task.findFirst({
    where: {
      id: amaId,
    },
  });

  if (!task) {
      return formatResponse(false, null, `Task with ID ${amaId} not found.`, 404);
  }

  try {
    if (task) {
      await cacheSet(cacheKey, task, 60);
    }
  } catch (e) {}

  // --- Success Response ---
  // formatResponse will return the 200 OK structure.
  return formatResponse(true, task, 'Task fetched successfully', 200);
}

// Export the GET method wrapped with the API handler for robust behavior.
export const GET = withApiHandler(getTaskById);
