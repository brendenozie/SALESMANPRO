import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { generateDocument } from "@/lib/documents/engine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ paymentId?: string; recordId?: string }> | { paymentId?: string; recordId?: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const identifier = resolvedParams.paymentId || resolvedParams.recordId || "";
    const { searchParams } = new URL(req.url);
    const specificPaymentId = searchParams.get("paymentId") || undefined;
    const templateId = searchParams.get("templateId") || undefined;
    const isThermal = searchParams.get("thermal") === "true";
    const isDownload = searchParams.get("download") === "true";

    // 1. Try finding feeRecord directly by ID
    let feeRecord = await prisma.studentFeeRecord.findUnique({
      where: { id: identifier },
      include: {
        student: { select: { companyId: true } },
      },
    });

    let resolvedPaymentId = specificPaymentId;

    // 2. If not found, identifier might be a paymentId inside payments array
    if (!feeRecord) {
      const records = await prisma.studentFeeRecord.findMany({
        where: {
          payments: {
            isEmpty: false,
          },
        },
        include: {
          student: { select: { companyId: true } },
        },
        take: 100,
      });

      const matched = records.find((r) =>
        (r.payments as any[]).some((p) => p.paymentId === identifier || p.receiptNumber === identifier)
      );

      if (matched) {
        feeRecord = matched;
        resolvedPaymentId = identifier;
      }
    }

    if (!feeRecord) {
      return NextResponse.json({ error: "Fee payment record not found" }, { status: 404 });
    }

    const companyId = feeRecord.student?.companyId || "default";
    const sourceId = resolvedPaymentId ? `${feeRecord.id}:${resolvedPaymentId}` : feeRecord.id;

    const result = await generateDocument({
      type: "STUDENT_FEE_RECEIPT",
      companyId,
      sourceId,
      templateId,
      pageSize: isThermal ? "THERMAL_80MM" : "A4",
    });

    const disposition = isDownload ? "attachment" : "inline";

    return new NextResponse(result.buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${result.fileName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error: any) {
    console.error("Receipt PDF Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate fee receipt" },
      { status: 500 }
    );
  }
}
