typescript
// app/api/admin/agents/[id]/clients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET clients by agent ID
async function getClientsByAgent(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json({ message: "Invalid pagination parameters." }, { status: 400 });
  }

  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: "Agent ID is required and must be a string." }, { status: 400 });
  }

  try {
    const clients = await prisma.client.findMany({
      where: { salesAgentId: id },
      skip: offset,
      take: limit,
    });

    const formattedClients = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber,
      totalOrders: 100, // TODO: replace with actual count when orders relation is added
    }));

    return formatResponse(true, formattedClients, "Clients fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching clients by agent:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiHandler(getClientsByAgent);

