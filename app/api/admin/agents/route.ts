import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/route.ts
// app/api/sales-agents/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import bcrypt from "bcryptjs";

// =====================
// GET /api/sales-agents
// =====================
export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  
    const cacheKey = `admin:agents:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const agents = await prisma.salesAgent.findMany({
    where: { companyId },
    select: {
      id: true,
      phoneNumber: true,
      user: {
        select: { name: true, email: true },
      },
      transactions: {
        select: { amount: true, date: true },
        orderBy: { date: "desc" },
        take: 1,
      },
      commissions: {
        select: { commissionEarned: true, createdAt: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          transactions: true,
          commissions: true,
        },
      },
    },
  });

  try {
    if (agents) {
      await cacheSet(cacheKey, agents, 60);
    }
  } catch (e) {}

  const totals = await prisma.salesAgent.findMany({
    where: { companyId },
    select: {
      id: true,
      transactions: { select: { amount: true } },
      commissions: { select: { commissionEarned: true } },
    },
  });

  const totalsMap = new Map(
    totals.map((a) => [
      a.id,
      {
        totalSales: a.transactions.reduce((s, t) => s + t.amount, 0),
        totalCommissions: a.commissions.reduce((s, c) => s + c.commissionEarned, 0),
      },
    ])
  );

  const formatted = agents.map((agent) => {
    const total = totalsMap.get(agent.id) || { totalSales: 0, totalCommissions: 0 };

    return {
      id: agent.id,
      name: agent.user?.name ?? "N/A",
      email: agent.user?.email ?? "N/A",
      phoneNumber: agent.phoneNumber ?? "",
      totalSales: total.totalSales,
      totalCommissions: total.totalCommissions,
      recentTransaction: agent.transactions[0]
        ? {
            amount: agent.transactions[0].amount,
            date: agent.transactions[0]?.date?.toISOString(),
          }
        : null,
      recentCommission: agent.commissions[0]
        ? {
            amount: agent.commissions[0].commissionEarned,
            date: agent.commissions[0]?.createdAt?.toISOString(),
            status: agent.commissions[0].status,
          }
        : null,
    };
  });

  return formatResponse(true, formatted, "Fetched agents successfully", 200);
});

// =====================
// POST /api/sales-agents
// =====================
export const POST = withAuthAndRateLimit(async (request) => {
  const body = await request.json();
  let { name, email, phoneNumber, password, companyId, specialties, regions, profileImageUrl } = body;

  if (!name || !email || !phoneNumber || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  email = email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return formatResponse(false, null, "User with this email already exists", 409);
  }

  const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await bcrypt.hash(password || "defaultPassword123", 10);

  const agent = await prisma.$transaction(async (tx) => {
    return tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: profileImageUrl || null,
        role: "AGENT",
        salesAgentProfile: {
          create: {
            companyId,
            phoneNumber,
            loginCode,
            specialties,
            regions,
          },
        },
        staffProfile: {
          create: {
            companyId,
            jobTitle: "Sales Agent",
            department: "Sales",
          },
        },
      },
      include: {
        salesAgentProfile: true,
        staffProfile: true,
      },
    });
  });

  return formatResponse(true, agent, "Agent created successfully", 201);
});


//   // OPTIMIZATION: Get totals in a single batch aggregate query 
//   // instead of fetching all records.
//   const totals = await prisma.transaction.groupBy({
//     by: ['salesAgentId'],
//     where: { salesAgentId: { in: salesAgents.map(a => a.id) } },
//     _sum: { amount: true }
//   });

//   const commissionTotals = await prisma.commission.groupBy({
//     by: ['salesAgentId'],
//     where: { salesAgentId: { in: salesAgents.map(a => a.id) } },
//     _sum: { commissionEarned: true }
//   });

//   const formattedAgents = salesAgents.map((agent) => {
//     const sumSales = totals.find(t => t.salesAgentId === agent.id)?._sum.amount || 0;
//     const sumComm = commissionTotals.find(c => c.salesAgentId === agent.id)?._sum.commissionEarned || 0;
//     const recentTx = agent.transactions[0] || null;
//     const recentComm = agent.commissions[0] || null;

//     return {
//       id: agent.id,
//       name: agent.user?.name ?? "N/A",
//       email: agent.user?.email ?? "N/A",
//       phoneNumber: agent.phoneNumber ?? "",
//       totalSales: sumSales,
//       totalCommissions: sumComm,
//       recentTransaction: recentTx ? { amount: recentTx.amount, date: recentTx.date } : null,
//       recentCommission: recentComm ? { amount: recentComm.commissionEarned, status: recentComm.status } : null,
//     };
//   });

//   return formatResponse(true, formattedAgents, "Fetched", 200);
// });

// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const { name, email, phoneNumber, password, companyId, specialties, regions } = body;

//   // 1. Hash password immediately to run in parallel with DB checks if needed
//   const hashedPassword = await bcrypt.hash(password || "defaultPassword123", 10);

//   // 2. Optimized loginCode: Try-catch with a unique constraint is faster than a do-while check
//   const loginCode = Math.floor(100000 + Math.random() * 900000).toString();

//   try {
//     const newAgent = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: "AGENT",
//         salesAgentProfile: {
//           create: { companyId, phoneNumber, loginCode, specialties, regions },
//         },
//         staffProfile: {
//           create: { companyId, jobTitle: "Sales Agent", department: "Sales" },
//         },
//       },
//       // Only select what the frontend needs to confirm creation
//       select: { id: true, name: true, email: true }
//     });

//     return formatResponse(true, newAgent, "Agent created", 201);
//   } catch (error: any) {
//     if (error.code === 'P2002') return formatResponse(false, null, "Email or Login Code already exists", 409);
//     throw error;
//   }
// });


//   const formattedAgents = salesAgents.map((agent) => {
//     const totalSales = agent.transactions.reduce(
//       (sum, txn) => sum + txn.amount,
//       0
//     );
//     const totalCommissions = agent.commissions.reduce(
//       (sum, comm) => sum + comm.commissionEarned,
//       0
//     );

//     const recentTransaction = agent.transactions[0] || null;
//     const recentCommission = agent.commissions[0] || null;

//     return {
//       id: agent.id,
//       name: agent.user?.name ?? "N/A",
//       email: agent.user?.email ?? "N/A",
//       phoneNumber: agent.phoneNumber ?? "",
//       totalSales,
//       totalCommissions,
//       recentTransaction: {
//         amount: recentTransaction?.amount ?? 0,
//         date: recentTransaction?.date?.toISOString() ?? null,
//       },
//       recentCommission: {
//         amount: recentCommission?.commissionEarned ?? 0,
//         date: recentCommission?.createdAt?.toISOString() ?? null,
//         status: recentCommission?.status ?? "N/A",
//       },
//     };
//   });

//   return formatResponse(true, formattedAgents, "Fetched agents successfully", 200);
// });

// // POST /api/sales-agents
// // Creates a new sales agent (User + SalesAgent profile)
// export const POST = withAuthAndRateLimit(async (request) => {
//   const body = await request.json();
//   const { name, email, phoneNumber, password, companyId, specialties, regions, profileImageUrl } = body;

//   if (!name || !email || !phoneNumber || !companyId) {
//     return formatResponse(false, null, "Missing required fields", 400);
//   }

//   const existingUser = await prisma.user.findUnique({ where: { email } });
//   if (existingUser) {
//     return formatResponse(false, null, "User with this email already exists", 409);
//   }

//   // Generate unique loginCode
//   let loginCode: string;
//   do {
//     loginCode = Math.floor(100000 + Math.random() * 900000).toString();
//   } while (await prisma.salesAgent.findUnique({ where: { loginCode } }));

//   // ⚠️ TODO: hash password with bcrypt in production
//   const newpassword = password || "defaultPassword123";

//   // Hash the password (use bcrypt in production)
  
//   const saltRounds = 10;
//   const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

//   const newAgent = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//       image: profileImageUrl || null,
//       role: "AGENT",
//       salesAgentProfile: {
//         create: {
//           companyId,
//           phoneNumber,
//           loginCode,
//           specialties,
//           regions,
//         },
//       },
//       staffProfile: {
//         create: {
//           companyId, jobTitle: "Sales Agent", department: "Sales",
//         },
//       },
//     },
//     include: { salesAgentProfile: true, staffProfile: true },
//   });

//   return formatResponse(true, newAgent, "Agent created successfully", 201);
// });
