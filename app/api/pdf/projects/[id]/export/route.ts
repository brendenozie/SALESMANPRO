import { NextRequest } from "next/server";
import { pdfProjectStorage } from "@/lib/pdf-editor/storage/project-storage";
import { exportPDF } from "@/lib/pdf-editor/engine/exporter";
import { validateExportedPDF, ValidationExpectations } from "@/lib/pdf-editor/engine/validator";
import { formatResponse } from "@/lib/formatResponse";
import { getPDFSessionIdentity, ownsPDFProject } from "@/lib/pdf-editor/storage/access";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const identity = await getPDFSessionIdentity();
    if (!identity) return formatResponse(false, null, "Authentication required", 401);
    const project = await pdfProjectStorage.getProject(id);
    if (!project) {
      return formatResponse(false, null, "PDF project not found", 404);
    }
    if (!ownsPDFProject(project, identity)) return formatResponse(false, null, "PDF project not found", 404);

    const originalBytes = await pdfProjectStorage.getOriginalPdf(id);
    if (!originalBytes) {
      return formatResponse(false, null, "Original PDF asset not found", 404);
    }

    const body = await req.json().catch(() => ({}));
    const { validate = true, expectations, document: clientDocument } = body;

    // CRITICAL: use client-submitted document (contains all live user edits).
    // Fall back to the stored snapshot only if the client didn't send one.
    const documentModel = clientDocument ?? project.currentDocument;

    // 1. Reconstruct PDF from original bytes + live model
    const exportedBytes = await exportPDF(originalBytes, documentModel, { validate });

    // 2. Optionally validate exported PDF
    const defaultExpectations: ValidationExpectations = {
      expectedPageCount: documentModel.pages.length,
      expectedTextsPresent: [],
      expectedDimensions: documentModel.pages[0]
        ? { width: documentModel.pages[0].width, height: documentModel.pages[0].height }
        : undefined,
    };

    const finalExpectations: ValidationExpectations = expectations
      ? { ...defaultExpectations, ...expectations }
      : defaultExpectations;

    let validationReport = null;
    if (validate) {
      validationReport = await validateExportedPDF(exportedBytes, finalExpectations);
    }

    // 3. Persist the live edits and exported snapshot (non-fatal)
    try {
      const exportedKey = await pdfProjectStorage.saveExportedPdf(id, exportedBytes);
      project.exportedPdfKey = exportedKey;
      project.currentDocument = documentModel;
      project.updatedAt = new Date().toISOString();
      await pdfProjectStorage.saveProject(project);
    } catch (_) {
      // Non-fatal — the binary response still proceeds
    }

    // 4. Stream binary PDF bytes directly for download
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="exported_document.pdf"`,
      "Content-Length": String(exportedBytes.length),
      "X-Validation-Pass": validationReport
        ? validationReport.overallPass
          ? "true"
          : "false"
        : "skipped",
    });
    if (validationReport) {
      // Truncate if too large for a header (limit: ~8 KB)
      const reportStr = JSON.stringify(validationReport);
      if (reportStr.length < 8000) {
        headers.set("X-Validation-Report", reportStr);
      }
    }

    return new Response(exportedBytes, { status: 200, headers });
  } catch (err: any) {
    console.error("Export error:", err);
    return formatResponse(false, null, err.message || "Failed to export PDF", 500);
  }
}
