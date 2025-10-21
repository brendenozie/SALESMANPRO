// app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";

// PUT /api/sales-agents/[agentId]
// Updates a sales agent (and their related user record).
export const PUT = withAuthAndRateLimit(async (request, { params }) => {
  const { agentId } = params;
  if (!agentId) {
    return formatResponse(false, null, "Agent ID is required", 400);
  }

  const body = await request.json();
  const { name, email, phoneNumber } = body;

  // Fetch agent to get userId
  const existingAgent = await prisma.salesAgent.findUnique({
    where: { id: agentId },
  });

  if (!existingAgent) {
    return formatResponse(false, null, "Agent not found", 404);
  }

  // Update agent + related user
  const updatedAgent = await prisma.salesAgent.update({
    where: { id: agentId },
    data: {
      phoneNumber,
      user: {
        update: {
          name,
          email,
        },
      },
    },
    include: { user: true },
  });

  return formatResponse(true, updatedAgent, "Agent updated successfully", 200);
});

// DELETE /api/sales-agents/[agentId]
// Deletes a sales agent and their related user.
export const DELETE = withAuthAndRateLimit(async (_request, { params }) => {
  const { agentId } = params;
  if (!agentId) {
    return formatResponse(false, null, "Agent ID is required", 400);
  }

  const agentToDelete = await prisma.salesAgent.findUnique({
    where: { id: agentId },
  });

  if (!agentToDelete) {
    return formatResponse(false, null, "Agent not found", 404);
  }

  // Delete agent + user in a transaction
  await prisma.$transaction([
    prisma.salesAgent.delete({ where: { id: agentId } }),
    prisma.user.delete({ where: { id: agentToDelete.userId || "" } }),
  ]);

  return formatResponse(true, { deletedId: agentId }, "Agent deleted successfully", 200);
});
