import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ agentId: string }> | { agentId: string };
}

// =====================
// PUT /api/sales-agents/[agentId]
// =====================
export const PUT = withAuthAndRateLimit(
  async (request, context: RouteContext) => {
    // Safe resolution handling for modern Next.js async parameters
    const resolvedParams = await context.params;
    const { agentId } = resolvedParams;

    if (!agentId) {
      return formatResponse(
        false,
        null,
        "Agent identifier parameter is required",
        400,
      );
    }

    try {
      const body = await request.json();
      const { name, email, phoneNumber, companyId } = body;

      if (!companyId) {
        return formatResponse(
          false,
          null,
          "Company verification context parameter is missing",
          400,
        );
      }

      // Single atomic operation updates the profile and nested user concurrently
      const updatedAgent = await prisma.salesAgent.update({
        where: {
          id: agentId,
          companyId: companyId, // Scope isolation security constraint
        },
        data: {
          phoneNumber,
          user: {
            update: {
              name,
              email: email ? email.toLowerCase().trim() : undefined,
              phone: phoneNumber,
            },
          },
        },
        select: {
          id: true,
          phoneNumber: true,
          companyId: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });

      // Target the precise key created by your GET route
      try {
        await cacheDel(`admin:agents:${updatedAgent.companyId}:all`);
      } catch (e) {}

      return formatResponse(
        true,
        updatedAgent,
        "Agent profile updated successfully",
        200,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return formatResponse(
          false,
          null,
          "Agent profile not found within this company",
          404,
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return formatResponse(
          false,
          null,
          "Email address conflict occurred",
          409,
        );
      }
      return formatResponse(
        false,
        null,
        "Internal modification transaction error",
        500,
      );
    }
  },
);

// =====================
// DELETE /api/sales-agents/[agentId]
// =====================
export const DELETE = withAuthAndRateLimit(
  async (request, context: RouteContext) => {
    const resolvedParams = await context.params;
    const { agentId } = resolvedParams;

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!agentId) {
      return formatResponse(
        false,
        null,
        "Agent identifier parameter is required",
        400,
      );
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company context verification query is missing",
        400,
      );
    }

    try {
      // Transactional block ensures parent and child profiles are wiped atomically
      const result = await prisma.$transaction(async (tx) => {
        // 1. Verify existence and retrieve internal user lookup key inside tenant sandbox boundary
        const agentProfile = await tx.salesAgent.findFirst({
          where: { id: agentId, companyId },
          select: { userId: true },
        });

        if (!agentProfile) {
          throw new Error("NOT_FOUND");
        }

        // 2. Drop profile record
        await tx.salesAgent.delete({
          where: { id: agentId },
        });

        // 3. Drop primary authenticating account user profile if schema cascading isn't present
        if (agentProfile.userId) {
          await tx.user.delete({
            where: { id: agentProfile.userId },
          });
        }

        return { deletedId: agentId };
      });

      try {
        await cacheDel(`admin:agents:${companyId}:all`);
      } catch (e) {}

      return formatResponse(
        true,
        result,
        "Agent records purged successfully",
        200,
      );
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return formatResponse(
          false,
          null,
          "Agent profile not found within this company",
          404,
        );
      }
      return formatResponse(
        false,
        null,
        "Atomic deletion process chain failed",
        500,
      );
    }
  },
);
