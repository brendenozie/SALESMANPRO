import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { formatResponse } from "@/lib/formatResponse";
import { analyzePDF } from "@/lib/pdf-editor/engine/analyzer";
import { pdfProjectStorage, PDFProjectRecord } from "@/lib/pdf-editor/storage/project-storage";
import { getPDFSessionIdentity } from "@/lib/pdf-editor/storage/access";

export const maxDuration = 60; // 60 seconds max timeout for large uploads

export async function POST(req: NextRequest) {
  try {
    let pdfBytes: Uint8Array;
    let name = "Untitled Document.pdf";
    let requestedCompanyId =
      req.headers.get("x-company-id") ||
      req.nextUrl.searchParams.get("companyId") ||
      null;

    const fixtureParam = req.nextUrl.searchParams.get("fixture");
    const contentType = req.headers.get("content-type") || "";

    const isAurumFixture =
      fixtureParam === "aurum-offer" ||
      (contentType.includes("application/json") && req.nextUrl.searchParams.get("fixture") === "aurum-offer");

    const isTestExecution =
      process.env.NODE_ENV === "test" ||
      req.headers.get("x-pdf-test-mode") === "true" ||
      Boolean(process.env.TS_NODE_PROJECT || process.env.npm_lifecycle_event?.includes("test"));

    if (isAurumFixture) {
      if (!isTestExecution) {
        return formatResponse(
          false,
          null,
          "Default sample fixture loading is disabled for store workspaces. Please upload your PDF document directly.",
          403
        );
      }
      const fs = await import("fs/promises");
      const path = await import("path");
      const candidates = [
        path.join(process.cwd(), "public", "fixtures", "aurum-offer.pdf"),
        path.join(process.cwd(), "tests", "fixtures", "pdf-editor", "aurum-offer.pdf"),
        path.resolve(process.cwd(), ".next", "standalone", "public", "fixtures", "aurum-offer.pdf"),
      ];

      let loadedBuf: Buffer | null = null;
      for (const p of candidates) {
        try {
          const b = await fs.readFile(p);
          if (b && b.length > 0) {
            loadedBuf = b;
            break;
          }
        } catch {}
      }

      if (loadedBuf) {
        pdfBytes = new Uint8Array(loadedBuf);
      } else {
        // Fallback: generate a starter 4-page test PDF dynamically with pdf-lib
        const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        for (let i = 1; i <= 4; i++) {
          const page = doc.addPage([595.28, 841.89]);
          page.drawText(`Aurum Corporate Offer - Page ${i}`, {
            x: 50,
            y: 780,
            size: 24,
            font,
            color: rgb(0.1, 0.15, 0.25),
          });
          page.drawText("Gold Trading and Transaction Procedure", {
            x: 50,
            y: 740,
            size: 14,
            font,
            color: rgb(0.79, 0.64, 0.15),
          });
        }
        pdfBytes = await doc.save();
      }
      name = "Aurum Full Corporate Offer.pdf";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      name = (formData.get("name") as string) || file?.name || "Untitled Document.pdf";
      const formCompanyId = formData.get("companyId") as string | null;
      if (formCompanyId) requestedCompanyId = formCompanyId;

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
        if (body.companyId) requestedCompanyId = body.companyId;
        if (body.sampleName === "aurum-offer") {
          if (!isTestExecution) {
            return formatResponse(
              false,
              null,
              "Default sample fixture loading is disabled for store workspaces. Please upload your PDF document directly.",
              403
            );
          }
          const fs = await import("fs/promises");
          const path = await import("path");
          const candidates = [
            path.join(process.cwd(), "public", "fixtures", "aurum-offer.pdf"),
            path.join(process.cwd(), "tests", "fixtures", "pdf-editor", "aurum-offer.pdf"),
            path.resolve(process.cwd(), ".next", "standalone", "public", "fixtures", "aurum-offer.pdf"),
          ];

          let loadedBuf: Buffer | null = null;
          for (const p of candidates) {
            try {
              const b = await fs.readFile(p);
              if (b && b.length > 0) {
                loadedBuf = b;
                break;
              }
            } catch {}
          }

          if (loadedBuf) {
            pdfBytes = new Uint8Array(loadedBuf);
          } else {
            const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
            const doc = await PDFDocument.create();
            const font = await doc.embedFont(StandardFonts.HelveticaBold);
            for (let i = 1; i <= 4; i++) {
              const page = doc.addPage([595.28, 841.89]);
              page.drawText(`Aurum Corporate Offer - Page ${i}`, {
                x: 50,
                y: 780,
                size: 24,
                font,
                color: rgb(0.1, 0.15, 0.25),
              });
            }
            pdfBytes = await doc.save();
          }
          name = "Aurum Full Corporate Offer.pdf";
        } else {
          return formatResponse(false, null, "No PDF file provided", 400);
        }
      } catch (_) {
        return formatResponse(false, null, "Invalid request body", 400);
      }
    }

    const identity = await getPDFSessionIdentity(requestedCompanyId);
    if (!identity) return formatResponse(false, null, "Authentication required", 401);
    const { userId, companyId } = identity;

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
      revision: 0,
    };

    await pdfProjectStorage.saveProject(projectRecord);

    return formatResponse(
      true,
      {
        projectId,
        revision: projectRecord.revision,
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
