// app/api/admin/agents/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/agents - Get all sales agents
export const GET = withApiHandler(async (request: Request) => {

const agents = await prisma.salesAgent.findMany({
  include: {
    commissions: {
      orderBy: { createdAt: "desc" },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});

// Example: compute aggregates or flatten structure
const processedAgents = agents.map((agent) => {
const totalCommissions = agent.commissions.reduce(
(sum, commission) =>
sum +
(commission.status === "COMPLETED"
? commission.commissionEarned
: 0),
0
);


const recentCommission = agent.commissions[0];
return {
  id: agent.id,
  name: agent.user?.name ?? "",
  email: agent.user?.email ?? "",
  phoneNumber: agent.phoneNumber,
  totalCommissions,
  recentCommission: {
    amount: recentCommission?.commissionEarned || 0,
    date: recentCommission?.createdAt || null,
    status: recentCommission?.status || "PENDING",
  },
};
});

return formatResponse(
true,
processedAgents,
"Sales agents fetched successfully",
200
);
});
