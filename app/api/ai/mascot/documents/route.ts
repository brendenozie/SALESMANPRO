/**
 * app/api/ai/mascot/documents/route.ts
 *
 * Scoped API endpoint for Document Intelligence Upload & Multimodal Extraction.
 * Validates MIME types, file size, tenant scope, extracts structured data,
 * checks for duplicates, and generates proposed business actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotDocumentExtractor } from "@/lib/ai/mascot/documentExtractor";
import { MascotDocumentActionEngine } from "@/lib/ai/mascot/documentActionEngine";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let fileName = "document.jpg";
    let fileBase64 = "";
    let mimeType = "image/jpeg";
    let extractedRawText = "";
    let companyIdParam: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      companyIdParam = (formData.get("companyId") as string) || undefined;

      if (!file) {
        return NextResponse.json({ success: false, error: "No document file provided" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: "File exceeds 10MB limit" }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Unsupported file type (${file.type}). Please upload JPEG, PNG, WEBP, or PDF.` },
          { status: 400 }
        );
      }

      fileName = file.name;
      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      fileBase64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      const body = await req.json();
      companyIdParam = body.companyId;
      fileName = body.fileName || "receipt.jpg";
      fileBase64 = body.fileBase64 || "";
      mimeType = body.mimeType || "image/jpeg";
      extractedRawText = body.extractedRawText || "";
    }

    // 1. Resolve authentic tenant context & role
    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId: companyIdParam,
    });

    if (!context.mascotEnabled) {
      return NextResponse.json(
        { success: false, error: "AI Mascot is disabled for this store." },
        { status: 403 }
      );
    }

    // 2. Multimodal Extraction & Classification
    const extracted = await MascotDocumentExtractor.extractFromDocument({
      fileName,
      fileBase64,
      mimeType,
      extractedRawText,
    });

    // 3. Plan Document-to-Action with Duplicate Detection
    const suggestedAction = await MascotDocumentActionEngine.planAction({
      companyId: context.companyId,
      storeSlug: context.storeSlug,
      storeCategory: context.storeCategory,
      userRole: context.userRole,
      extracted,
      fileUrl: fileBase64 ? `data:${mimeType};base64,${fileBase64.slice(0, 100)}...` : undefined,
    });

    const previewUrl = fileBase64 ? `data:${mimeType};base64,${fileBase64}` : undefined;

    return NextResponse.json({
      success: true,
      extracted,
      extractedData: extracted,
      duplicateWarning: suggestedAction.duplicateWarning,
      suggestedAction,
      actionDraft: suggestedAction,
      previewUrl,
    });
  } catch (error: any) {
    console.error("[MASCOT_DOCUMENT_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process document" },
      { status: error.message?.includes("Authentication") ? 401 : 400 }
    );
  }
}
