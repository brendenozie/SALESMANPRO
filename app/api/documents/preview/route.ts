import { NextResponse } from "next/server";
import { generateDocument } from "@/lib/documents/engine";
import { DocumentType } from "@/lib/documents/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, templateId, companyId = "preview-company", sampleData } = body;

    if (!type || !templateId) {
      return NextResponse.json({ error: "type and templateId are required" }, { status: 400 });
    }

    const result = await generateDocument({
      type: type as DocumentType,
      companyId,
      sourceId: "preview-id",
      templateId,
      isPreview: true,
      sampleData,
    });

    return new NextResponse(result.buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview-${templateId}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Document preview error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate document preview" },
      { status: 500 }
    );
  }
}
