import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { z } from "zod";

const transactionCreateSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  subscriptionPlanId: z.string().optional().nullable(),
  amount: z.number().positive("amount must be a positive number"),
  currency: z.string().min(2).max(10),
  status: z.string().min(1, "status is required"),
  startingAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "startingAt must be a valid ISO date string",
  }),
  endingAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "endingAt must be a valid ISO date string",
  }),
});

export const POST = withApiHandler(
  async (req: Request, context: any) => {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parseResult = transactionCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return formatResponse(
        false,
        null,
        parseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        400
      );
    }

    const {
      userId,
      subscriptionPlanId,
      amount,
      currency,
      status,
      startingAt,
      endingAt,
    } = parseResult.data;

    // Caller must be SUPER_ADMIN or ADMIN, or operating on their own account/company
    const authUser = context?.user;
    if (
      authUser?.role !== "SUPER_ADMIN" &&
      authUser?.role !== "ADMIN" &&
      authUser?.id !== userId
    ) {
      return formatResponse(false, null, "Forbidden: cannot record transactions for other accounts", 403);
    }

    // Verify user existence
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true },
    });
    if (!targetUser) {
      return formatResponse(false, null, "Target user not found", 404);
    }

    // If company admin, ensure user is within their company
    if (
      authUser?.role !== "SUPER_ADMIN" &&
      authUser?.companyId &&
      targetUser.companyId !== authUser.companyId
    ) {
      return formatResponse(false, null, "Forbidden: user belongs to another organization", 403);
    }

    const startDate = new Date(startingAt);
    const endDate = new Date(endingAt);

    const transactionData: any = {
      amount,
      currency,
      status,
      user: { connect: { id: userId } },
      startingAt: startDate,
      endingAt: endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (subscriptionPlanId) {
      transactionData.subscriptionPlan = { connect: { id: subscriptionPlanId } };
    }

    const transaction = await prisma.transaction.create({ data: transactionData });

    try {
      if (subscriptionPlanId) {
        await cacheDel(`tenant:${subscriptionPlanId}:post-transactions:*`);
      }
      await cacheDel(`admin:post-transactions:*`);
    } catch (e) {}

    return formatResponse(true, { transaction }, "Transaction created successfully", 201);
  },
  {
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN"],
  }
);
