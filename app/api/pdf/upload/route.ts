import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatResponse } from "@/lib/formatResponse";
import { analyzePDF } from "@/lib/pdf-editor/engine/analyzer";
import { pdfProjectStorage, PDFProjectRecord } from "@/lib/pdf-editor/storage/project-storage";

export const maxDuration = 60; // 60 seconds max timeout for large uploads

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    const userId = session?.user?.id || "guest_editor";
    const companyId = session?.user?.companyId || "default_store";

    let pdfBytes: Uint8Array;
    let name = "Untitled Document.pdf";

    const fixtureParam = req.nextUrl.searchParams.get("fixture");
    const contentType = req.headers.get("content-type") || "";

    if (fixtureParam === "aurum-offer" || (contentType.includes("application/json") && req.nextUrl.searchParams.get("fixture"))) {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fixturePath = path.join(process.cwd(), "tests/fixtures/pdf-editor/aurum-offer.pdf");
      const buf = await fs.readFile(fixturePath);
      pdfBytes = new Uint8Array(buf);
      name = "Aurum Full Corporate Offer.pdf";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      name = (formData.get("name") as string) || file?.name || "Untitled Document.pdf";

      if (!file) {
        return formatResponse(false, null, "No PDF file provided", 400);
      }

      if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        return formatResponse(false, null, "Uploaded file must be a valid PDF document", 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      pdfBytes = new Uint8Array(arrayBuffer);
    } else {
      // Check if JSON body with sampleName
      try {
        const body = await req.json();
        if (body.sampleName === "aurum-offer") {
          const fs = await import("fs/promises");
          const path = await import("path");
          const fixturePath = path.join(process.cwd(), "tests/fixtures/pdf-editor/aurum-offer.pdf");
          const buf = await fs.readFile(fixturePath);
          pdfBytes = new Uint8Array(buf);
          name = "Aurum Full Corporate Offer.pdf";
        } else {
          return formatResponse(false, null, "No PDF file provided", 400);
        }
      } catch (_) {
        return formatResponse(false, null, "Invalid request body", 400);
      }
    }

    // Validate PDF magic header %PDF-
    const header = new TextDecoder().decode(pdfBytes.slice(0, 5));
    if (!header.startsWith("%PDF-")) {
      return formatResponse(false, null, "Malformed PDF: missing %PDF- header", 400);
    }

    const projectId = `proj_${crypto.randomBytes(8).toString("hex")}`;
    const sha256 = crypto.createHash("sha256").update(pdfBytes).digest("hex");

    // Save untouched original PDF in storage
    const originalKey = await pdfProjectStorage.saveOriginalPdf(projectId, pdfBytes);

    // Deep structural analysis
    const documentModel = await analyzePDF(pdfBytes);

    const projectRecord: PDFProjectRecord = {
      id: projectId,
      userId,
      companyId,
      name,
      originalPdfKey: originalKey,
      originalPdfSha256: sha256,
      currentDocument: documentModel,
      operations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await pdfProjectStorage.saveProject(projectRecord);

    return formatResponse(
      true,
      {
        projectId,
        name,
        sha256,
        document: documentModel,
      },
      "PDF uploaded and analyzed successfully",
      200
    );
  } catch (err: any) {
    console.error("PDF upload/analysis error:", err);
    return formatResponse(false, null, err.message || "Failed to analyze PDF", 500);
  }
}
