import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { pdfProjectStorage } from "@/lib/pdf-editor/storage/project-storage";
import { runPageOCR } from "@/lib/pdf-editor/engine/ocr";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await pdfProjectStorage.getProject(id);
    if (!project) {
      return formatResponse(false, null, "PDF project not found", 404);
    }

    const body = await req.json();
    const { pageId, pageIndex, imageBase64 } = body;

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
      return formatResponse(
        true,
        {
          confidence: 0,
          textElements: [],
          rawText: "",
          document: project.currentDocument,
          message: "No image layer available on this page to OCR",
        },
        "OCR skipped - no image content",
        200
      );
    }

    const ocrResult = await runPageOCR(
      imageSrc,
      targetPage.id,
      targetPage.width,
      targetPage.height
    );

    // Merge detected OCR text elements into target page
    if (ocrResult.textElements.length > 0) {
      targetPage.elements.push(...ocrResult.textElements);
      targetPage.ocrStatus = "completed";
      project.updatedAt = new Date().toISOString();
      await pdfProjectStorage.saveProject(project);
    }

    return formatResponse(
      true,
      {
        ...ocrResult,
        document: project.currentDocument,
      },
      "OCR completed successfully",
      200
    );
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}
