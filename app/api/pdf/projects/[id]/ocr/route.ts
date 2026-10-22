import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { pdfProjectStorage } from "@/lib/pdf-editor/storage/project-storage";
import { runPageOCR } from "@/lib/pdf-editor/engine/ocr";
import { getPDFSessionIdentity, ownsPDFProject } from "@/lib/pdf-editor/storage/access";
import { PDFProjectConflictError } from "@/lib/pdf-editor/storage/project-storage";

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

    const body = await req.json();
    const { pageId, pageIndex, imageBase64, baseRevision } = body;
    if (!Number.isInteger(baseRevision) || baseRevision < 0) {
      return formatResponse(false, null, {
        code: "REVISION_REQUIRED",
        message: "baseRevision is required for OCR project updates",
        currentRevision: project.revision,
      }, 400);
    }

    let targetPage = pageId
      ? project.currentDocument.pages.find((p) => p.id === pageId)
      : typeof pageIndex === "number"
      ? project.currentDocument.pages[pageIndex]
      : null;

    if (!targetPage) {
      return formatResponse(false, null, "Target page not found", 404);
    }

    // Determine image data to OCR
    let imageSrc = imageBase64;
    if (!imageSrc) {
      const imgEl = targetPage.elements.find((e) => e.kind === "image" && (e as any).imageData);
      if (imgEl) {
        imageSrc = (imgEl as any).imageData;
      }
    }

    if (!imageSrc) {
      try {
        const origBytes = await pdfProjectStorage.getOriginalPdf(id);
        if (origBytes) {
          const { PDFDocument, PDFName, PDFRawStream, PDFStream, PDFDict } = await import("pdf-lib");
          const pdfDoc = await PDFDocument.load(origBytes, { ignoreEncryption: true });
          const pIdx = typeof pageIndex === "number" ? pageIndex : project.currentDocument.pages.findIndex((p) => p.id === pageId);
          if (pIdx >= 0 && pIdx < pdfDoc.getPageCount()) {
            const pageNode = pdfDoc.getPage(pIdx).node;
            const res = pageNode.Resources();
            const xobjRef = res?.get(PDFName.of("XObject"));
            const xobjDict = xobjRef ? pdfDoc.context.lookup(xobjRef) : undefined;
            if (xobjDict instanceof PDFDict) {
              for (const [, ref] of xobjDict.entries()) {
                const s = pdfDoc.context.lookup(ref);
                if (s instanceof PDFRawStream || s instanceof PDFStream) {
                  const b = typeof (s as any).getContents === "function" ? (s as any).getContents() : (s as any).asUint8Array();
                  if (b && b.length > 50) {
                    imageSrc = `data:image/jpeg;base64,${Buffer.from(b).toString("base64")}`;
                    break;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("OCR fallback original PDF stream extraction error:", e);
      }
    }

    if (!imageSrc) {
      return formatResponse(
        false,
        {
          success: false,
          confidence: 0,
          textElements: [],
          rawText: "",
          error: { code: "OCR_IMAGE_MISSING", message: "No image layer available on this page to OCR" },
        },
        "OCR skipped - no image content",
        422
      );
    }

    const ocrResult = await runPageOCR(
      imageSrc,
      targetPage.id,
      targetPage.width,
      targetPage.height
    );
    if (!ocrResult.success) {
      const error = ocrResult.error || {
        code: "OCR_FAILED",
        message: "OCR failed",
      };
      return formatResponse(false, ocrResult, error, error.code === "OCR_TIMEOUT" ? 504 : 422);
    }

    // Merge detected OCR text elements into target page
    if (ocrResult.textElements.length > 0) {
      targetPage.elements.push(...ocrResult.textElements);
      targetPage.ocrStatus = "completed";
      try {
        const saved = await pdfProjectStorage.updateProject(id, baseRevision, {
          currentDocument: project.currentDocument,
          operations: project.operations,
          updatedAt: new Date().toISOString(),
        });
        project.currentDocument = saved.currentDocument;
        project.revision = saved.revision;
      } catch (error) {
        if (error instanceof PDFProjectConflictError) {
          return formatResponse(false, {
            code: "REVISION_CONFLICT",
            currentRevision: error.currentProject.revision,
            currentProject: error.currentProject,
          }, error.message, 409);
        }
        throw error;
      }
    }

    return formatResponse(
      true,
      {
        ...ocrResult,
        document: project.currentDocument,
        revision: project.revision,
      },
      "OCR completed successfully",
      200
    );
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}
