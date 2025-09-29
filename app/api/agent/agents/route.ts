// app/api/admin/agents/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse, verifyAuth } from "@/lib/verifyAuth";

// GET /api/admin/agents - Get all sales agents
export const GET = withApiHandler(async (request: Request) => {
const auth = await verifyAuth(request);
if (!auth.success) return formatResponse(false, null, auth.error, 401);

const agents = await prisma.salesAgent.findMany({
select: {
id: true,
name: true,
email: true,
phoneNumber: true,
commissions: {
select: {
commissionEarned: true,
createdAt: true,
status: true,
},
orderBy: {
createdAt: "desc",
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
  name: agent.name,
  email: agent.email,
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
