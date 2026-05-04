import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getTargets(req: Request) {
  const { searchParams } = new URL(req.url);

  // 1. Parsing & Validation
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "PENDING";
  const skip = (page - 1) * limit;

  if (!companyId) return formatResponse(false, null, "companyId required", 400);

  try {
    const targets = await prisma.target.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        salesAgent: {
          include: { user: { select: { name: true } } },
        },
        product: { select: { name: true } },
      },
      orderBy: { endDate: "asc" },
    });

    const now = new Date();

    const formattedTargets = targets.map((t) => {
      // Logic to determine display status for UI
      let displayStatus: "Achieved" | "Pending" | "Failed" = "Pending";

      if (t.achievedValue >= t.targetValue) {
        displayStatus = "Achieved";
      } else if (new Date(t.endDate) < now) {
        displayStatus = "Failed";
      }

      return {
        id: t.id,
        salesAgent: {
          name:
            t.salesAgent.user?.name ||
            t.salesAgent.phoneNumber ||
            "Unknown Agent",
        },
        product: { name: t.product.name },
        targetValue: t.targetValue,
        achievedValue: t.achievedValue,
        status: displayStatus,
        startDate: t.startDate.toISOString(),
        endDate: t.endDate.toISOString(),
        targetType: t.targetType, // COST or QUANTITY
      };
    });

    return formatResponse(true, formattedTargets, "Targets fetched");
  } catch (error) {
    console.error("Target Fetch Error:", error);
    return formatResponse(false, null, "Failed to fetch targets", 500);
  }
}

export const GET = withApiHandler(getTargets);
