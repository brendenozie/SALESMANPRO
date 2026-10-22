/**
 * app/api/media/verify-upload/route.ts
 *
 * Direct Object Storage Verification Gateway.
 * Validates uploaded object directly against S3 (HeadObject), ensures tenant boundaries,
 * triggers responsive WebP generation, and transitions MediaAsset to READY status.
 */

import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { verifyAndProcessUpload } from "@/lib/media/centralMediaService";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const body = await req.json().catch(() => ({}));

    const {
      mediaId,
      companyId: explicitCompanyId,
      processVariants = true,
    } = body;

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter 'mediaId'" },
        { status: 400 }
      );
    }

    let companyId = "public";
    let userId: string | null = null;

    if (auth.success && auth.user) {
      userId = auth.user.id || null;
      companyId = (auth.user.companyId || explicitCompanyId || auth.user.id || "seller").toString();
    } else if (explicitCompanyId) {
      companyId = explicitCompanyId.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    const result = await verifyAndProcessUpload({
      mediaId,
      companyId,
      userId,
      processVariants: Boolean(processVariants),
    });

    return NextResponse.json({
      success: true,
      media: result.media,
      variants: result.variants,
    });
  } catch (err: any) {
    console.error("[MEDIA_VERIFY_UPLOAD_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify media upload" },
      { status: 400 }
    );
  }
}
