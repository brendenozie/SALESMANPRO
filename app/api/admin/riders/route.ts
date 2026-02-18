import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/sales-agents/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import bcrypt from "bcryptjs";

// GET /api/sales-agents
// Fetch all sales agents for a company, including sales/commission aggregates
export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  
    const cacheKey = `admin:riders:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const salesAgents = await prisma.salesAgent.findMany({
    where: { 
      companyId,
      user: { role: 'RIDER' }
    },
    include: {
      user: true,
      transactions: { orderBy: { date: "desc" } },
      commissions: { orderBy: { createdAt: "desc" } },
    },
  });

  try {
    if (salesAgents) {
      await cacheSet(cacheKey, salesAgents, 60);
    }
  } catch (e) {}

  const formattedAgents = salesAgents.map((agent) => {
    const totalSales = agent.transactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );
    const totalCommissions = agent.commissions.reduce(
      (sum, comm) => sum + comm.commissionEarned,
      0
    );

    const recentTransaction = agent.transactions[0] || null;
    const recentCommission = agent.commissions[0] || null;

    return {
      id: agent.id,
      name: agent.user?.name ?? "N/A",
      email: agent.user?.email ?? "N/A",
      phoneNumber: agent.phoneNumber ?? "",
      totalSales,
      totalCommissions,
      recentTransaction: {
        amount: recentTransaction?.amount ?? 0,
        date: recentTransaction?.date?.toISOString() ?? null,
      },
      recentCommission: {
        amount: recentCommission?.commissionEarned ?? 0,
        date: recentCommission?.createdAt?.toISOString() ?? null,
        status: recentCommission?.status ?? "N/A",
      },
    };
  });

  return formatResponse(true, formattedAgents, "Fetched agents successfully", 200);
});

// POST /api/sales-agents
// Creates a new sales agent (User + SalesAgent profile)
export const POST = withAuthAndRateLimit(async (request) => {
  const body = await request.json();
  const { name, email, phoneNumber, password, companyId, specialties, regions, profileImageUrl } = body;

  if (!name || !email || !phoneNumber || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return formatResponse(false, null, "User with this email already exists", 409);
  }

  // Generate unique loginCode
  let loginCode: string;
  do {
    loginCode = Math.floor(100000 + Math.random() * 900000).toString();
  } while (await prisma.salesAgent.findUnique({ where: { loginCode } }));

  // ⚠️ TODO: hash password with bcrypt in production
  const newpassword = password || "defaultPassword123";

  // Hash the password (use bcrypt in production)
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

  const newAgent = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      image: profileImageUrl || null,
      role: "RIDER",
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
          companyId, jobTitle: "Sales Agent", department: "Sales",
        },
      },
    },
    include: { salesAgentProfile: true },
  });

  
    try { await cacheDel(`admin:riders:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newAgent, "Agent created successfully", 201);
});
