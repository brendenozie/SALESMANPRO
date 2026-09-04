import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { EmailDeliveryLogDTO } from "@/lib/email/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const companyId = auth.companyId;

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);

    const logs = await prisma.emailDeliveryLog.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const dtoList: EmailDeliveryLogDTO[] = logs.map((log) => ({
      id: log.id,
      scope: log.scope,
      companyId: log.companyId,
      recipient: log.recipient,
      template: log.template,
      provider: log.provider,
      fromAddress: log.fromAddress,
      status: log.status as any,
      providerMessageId: log.providerMessageId,
      error: log.error,
      attempts: log.attempts,
      createdAt: log.createdAt.toISOString(),
      sentAt: log.sentAt?.toISOString() || null,
    }));

    return formatResponse(true, { logs: dtoList }, "Email logs fetched successfully", 200);
  } catch (err: any) {
    console.error("[EmailLogs API] GET error:", err);
    return formatResponse(false, null, err.message || "Failed to fetch email logs", err.statusCode || 500);
  }
}
