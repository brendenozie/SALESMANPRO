/**
 * app/api/media/process/route.ts
 *
 * Media Processing & Responsive Variant Generator API for Ghuba Commerce.
 * Converts uploaded raw images into responsive, EXIF-stripped WebP variants
 * with blur placeholders, and stores them in S3 with immutable cache headers.
 */

import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import {
  optimizeListingImage,
  persistOptimizedVariantsToStorage,
  getMediaS3Client,
} from "@/lib/media-optimizer";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const body = await req.json().catch(() => ({}));
    const { key, url, companyId: explicitCompanyId, assetId: explicitAssetId } = body;

    let companyId = "public";
    if (auth.success && auth.user) {
      companyId = (auth.user.companyId || explicitCompanyId || auth.user.id || "seller").toString();
    } else if (explicitCompanyId) {
      companyId = explicitCompanyId.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    let imageBuffer: Buffer | null = null;

    // 1. Fetch from S3 directly if key is provided
    if (key) {
      const { s3, bucket } = getMediaS3Client();
      const s3Res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const byteArray = await s3Res.Body?.transformToByteArray();
      if (byteArray) {
        imageBuffer = Buffer.from(byteArray);
      }
    } else if (url) {
      // Fetch via URL
      const fetchRes = await fetch(url);
      if (!fetchRes.ok) {
        return NextResponse.json({ success: false, error: `Failed to fetch image from URL: ${fetchRes.statusText}` }, { status: 400 });
      }
      const arrayBuf = await fetchRes.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuf);
    }

    if (!imageBuffer) {
      return NextResponse.json({ success: false, error: "No image source found. Provide 'key' or 'url'" }, { status: 400 });
    }

    // 2. Run Sharp optimization engine
    const optimized = await optimizeListingImage(imageBuffer);

    // 3. Persist variants to S3
    const assetId = explicitAssetId || crypto.randomUUID();
    const stored = await persistOptimizedVariantsToStorage(companyId, assetId, optimized);

    return NextResponse.json({
      success: true,
      media: {
        ...stored,
        originalSizeBytes: optimized.originalSizeBytes,
        compressionRatio: optimized.compressionRatio,
      },
    });
  } catch (err: any) {
    console.error("[MEDIA_PROCESS_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message || "Media processing failed" }, { status: 500 });
  }
}
