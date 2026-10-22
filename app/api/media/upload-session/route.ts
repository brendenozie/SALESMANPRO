/**
 * app/api/media/upload-session/route.ts
 *
 * Centralized direct-to-storage upload authorization gateway.
 * Verifies tenant authorization, enforces MIME whitelist and size limits,
 * registers a PENDING MediaAsset, and issues a short-lived signed S3 PUT URL.
 */

import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { createUploadSession, MediaCategory } from "@/lib/media/centralMediaService";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const body = await req.json().catch(() => ({}));

    const {
      filename,
      type = "image",
      contentType = "image/jpeg",
      fileSize,
      companyId: explicitCompanyId,
      metadata = {},
    } = body;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter 'filename'" },
        { status: 400 }
      );
    }

    // Tenant resolution & authorization guard
    let companyId = "public";
    let userId: string | null = null;

    if (auth.success && auth.user) {
      userId = auth.user.id || null;
      companyId = (auth.user.companyId || explicitCompanyId || auth.user.id || "seller").toString();
    } else if (explicitCompanyId) {
      companyId = explicitCompanyId.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    const category: MediaCategory = type.startsWith("video")
      ? "video"
      : type === "book"
      ? "book"
      : type === "document"
      ? "document"
      : "image";

    const session = await createUploadSession({
      userId,
      companyId,
      filename,
      category,
      contentType,
      fileSize: fileSize ? Number(fileSize) : undefined,
      metadata,
    });

    return NextResponse.json({
      success: true,
      ...session,
    });
  } catch (err: any) {
    console.error("[MEDIA_UPLOAD_SESSION_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initialize upload session" },
      { status: 400 }
    );
  }
}
