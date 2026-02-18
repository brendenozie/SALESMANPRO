import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { Prisma } from "@prisma/client";

export const PUT = withAuthAndRateLimit(async (request, { params }) => {
  const { agentId } = params;
  const body = await request.json();
  const { name, email, phoneNumber } = body;

  try {
    // OPTIMIZATION: Update directly. Prisma handles the join internally.
    // This reduces 2 DB calls down to 1.
    const updatedAgent = await prisma.salesAgent.update({
      where: { id: agentId },
      data: {
        phoneNumber,
        user: {
          update: { name, email },
        },
      },
      select: { 
        id: true, 
        phoneNumber: true,
        user: { select: { name: true, email: true } } 
      },
    });

    
    try { await cacheDel(`admin:agents:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedAgent, "Updated", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Agent not found", 404);
    }
    throw error;
  }
});

export const DELETE = withAuthAndRateLimit(async (_request, { params }) => {
  const { agentId } = params;

  try {
    // OPTIMIZATION: Atomic Delete. 
    // We target the SalesAgent and use 'include' to find the userId in one go
    // if not using Schema-level Cascades.
    const deletedAgent = await prisma.salesAgent.delete({
      where: { id: agentId },
      select: { userId: true }
    });

    // If your schema doesn't have Cascade Delete, delete the user second.
    // Note: It's better to set up 'onDelete: Cascade' in schema.prisma
    if (deletedAgent.userId) {
      await prisma.user.delete({ where: { id: deletedAgent.userId } });
    }

    
    try { await cacheDel(`admin:agents:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { deletedId: agentId }, "Deleted", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Agent not found", 404);
    }
    throw error;
  }
});
// import prisma from "@/server/db/prismadb";
// import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
// import { formatResponse } from "@/lib/formatResponse";

// // PUT /api/sales-agents/[agentId]
// // Updates a sales agent (and their related user record).
// export const PUT = withAuthAndRateLimit(async (request, { params }) => {
//   const { agentId } = params;
//   if (!agentId) {
//     return formatResponse(false, null, "Agent ID is required", 400);
//   }

//   const body = await request.json();
//   const { name, email, phoneNumber } = body;

//   // Fetch agent to get userId
//   const existingAgent = await prisma.salesAgent.findUnique({
//     where: { id: agentId },
//   });

//   if (!existingAgent) {
//     return formatResponse(false, null, "Agent not found", 404);
//   }

//   // Update agent + related user
//   const updatedAgent = await prisma.salesAgent.update({
//     where: { id: agentId },
//     data: {
//       phoneNumber,
//       user: {
//         update: {
//           name,
//           email,
//         },
//       },
//     },
//     include: { user: true },
//   });

//   return formatResponse(true, updatedAgent, "Agent updated successfully", 200);
// });

// // DELETE /api/sales-agents/[agentId]
// // Deletes a sales agent and their related user.
// export const DELETE = withAuthAndRateLimit(async (_request, { params }) => {
//   const { agentId } = params;
//   if (!agentId) {
//     return formatResponse(false, null, "Agent ID is required", 400);
//   }

//   const agentToDelete = await prisma.salesAgent.findUnique({
//     where: { id: agentId },
//   });

//   if (!agentToDelete) {
//     return formatResponse(false, null, "Agent not found", 404);
//   }

//   // Delete agent + user in a transaction
//   await prisma.$transaction([
//     prisma.salesAgent.delete({ where: { id: agentId } }),
//     prisma.user.delete({ where: { id: agentToDelete.userId! } }),
//   ]);

//   return formatResponse(true, { deletedId: agentId }, "Agent deleted successfully", 200);
// });
