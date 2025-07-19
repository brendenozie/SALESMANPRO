import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

/**
 * GET handler to fetch all sales agents for a given company.
 * Aggregates sales, commissions, and recent activity data.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  try {
    const salesAgents = await prisma.salesAgent.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        user: true, // Include the related User model to get name and email
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
        commissions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Map the data to the format expected by the frontend 'Agent' type
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

    return NextResponse.json(formattedAgents);
  } catch (error) {
    console.error("[AGENTS_GET] Error fetching agents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * POST handler to create a new Sales Agent.
 * This involves creating a User first, then the associated SalesAgent profile.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phoneNumber, password, companyId } = body;

    if (!name || !email || !phoneNumber || !companyId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

   
    let loginCode: string;
    let isUnique = false;
    do {
      // Generate a random 6-digit code
      loginCode = Math.floor(100000 + Math.random() * 900000).toString();
      // Check if the code already exists
      const existingAgentWithCode = await prisma.salesAgent.findUnique({
        where: { loginCode },
      });
      if (!existingAgentWithCode) {
        isUnique = true;
      }
    } while (!isUnique);
    

    // Hash the password - using a default if none is provided
    const hashedPassword = password || "defaultPassword123";//await bcrypt.hash(password || "defaultPassword123", 12);

    // Create the User and SalesAgent in a single transaction
    const newAgent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "AGENT", // Set the role to AGENT
        salesAgentProfile: {
          create: {
            companyId: companyId,
            phoneNumber: phoneNumber,
            loginCode: loginCode,
          },
        },
      },
      include: {
        salesAgentProfile: true, // Include the profile in the response
      },
    });

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("[AGENTS_POST] Error creating agent:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}