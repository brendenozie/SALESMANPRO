import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * PUT handler to update an existing Sales Agent's details.
 */
export async function PUT(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const body = await request.json();
    const { name, email, phoneNumber } = body;

    if (!agentId) {
      return new NextResponse("Agent ID is required", { status: 400 });
    }

    // Fetch the agent to get the related userId
    const existingAgent = await prisma.salesAgent.findUnique({
      where: { id: agentId },
    });

    if (!existingAgent) {
      return new NextResponse("Agent not found", { status: 404 });
    }

    // Update the SalesAgent profile and the related User record
    const updatedAgent = await prisma.salesAgent.update({
      where: { id: agentId },
      data: {
        phoneNumber,
        user: {
          update: {
            where: { id: existingAgent.userId },
            data: {
              name,
              email,
            },
          },
        },
      },
      include: {
        user: true, // Include user details in the response
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("[AGENT_PUT] Error updating agent:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * DELETE handler to remove a Sales Agent.
 * This also removes the associated User record.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;

    if (!agentId) {
      return new NextResponse("Agent ID is required", { status: 400 });
    }

    // Find the agent to get the userId for deletion
    const agentToDelete = await prisma.salesAgent.findUnique({
      where: { id: agentId },
    });

    if (!agentToDelete) {
      return new NextResponse("Agent not found", { status: 404 });
    }

    // Use a transaction to delete the SalesAgent and the associated User
    await prisma.$transaction([
      prisma.salesAgent.delete({
        where: { id: agentId },
      }),
      prisma.user.delete({
        where: { id: agentToDelete.userId },
      }),
    ]);

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error("[AGENT_DELETE] Error deleting agent:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}