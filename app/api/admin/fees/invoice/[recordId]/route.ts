import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { generateDocument } from "@/lib/documents/engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> | { recordId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { recordId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId") || undefined;
    const isDownload = searchParams.get("download") === "true";

    const record = await prisma.studentFeeRecord.findUnique({
      where: { id: recordId },
      select: {
        id: true,
        invoiceNumber: true,
        student: { select: { companyId: true } },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const companyId = record.student?.companyId || "default";

    const result = await generateDocument({
      type: "STUDENT_FEE_INVOICE",
      companyId,
      sourceId: recordId,
      templateId,
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
    console.error("Invoice PDF Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate school fee invoice" },
      { status: 500 }
    );
  }
}
