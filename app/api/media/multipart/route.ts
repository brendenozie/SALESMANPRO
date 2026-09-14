/**
 * app/api/media/multipart/route.ts
 *
 * Resumable S3 Multipart Upload API for larger videos and media assets in Ghuba Commerce.
 * Supports:
 * - action: "INIT": Initiates S3 multipart upload, returns uploadId and tenant-scoped key
 * - action: "SIGN_PART": Generates presigned URL for a specific partNumber (allows chunked retries)
 * - action: "COMPLETE": Finalizes multipart upload with ETags, returns public CDN URL
 * - action: "ABORT": Cancels multipart upload to prevent dangling S3 storage charges
 */

import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuth } from "@/lib/verifyAuth";
import { sanitizeFilename } from "@/app/api/upload-url/route";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AREGION || process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.ASECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucket = process.env.AS3_BUCKET_NAME || process.env.S3_BUCKET_NAME || "tulivuappsbucket";
const cdnDomain = process.env.NEXT_PUBLIC_CDN_URL || `${bucket}.s3.${process.env.AREGION || "eu-north-1"}.amazonaws.com`;

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const body = await req.json().catch(() => ({}));
    const { action, filename, type = "video", contentType = "video/mp4", uploadId, key, partNumber, parts, companyId: explicitCompanyId } = body;

    let companyScope = "public";
    if (auth.success && auth.user) {
      companyScope = (auth.user.companyId || explicitCompanyId || auth.user.id || "seller").toString();
    } else if (explicitCompanyId) {
      companyScope = explicitCompanyId.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    // 1. INITIATE MULTIPART UPLOAD
    if (action === "INIT") {
      if (!filename) {
        return NextResponse.json({ success: false, error: "Missing filename" }, { status: 400 });
      }

      const sanitized = sanitizeFilename(filename);
      const datePrefix = new Date().toISOString().slice(0, 7);
      const randomSuffix = crypto.randomBytes(6).toString("hex");
      const ext = sanitized.ext || (type === "video" ? "mp4" : "bin");
      const targetKey = `companies/${companyScope}/videos/${datePrefix}/${Date.now()}-${randomSuffix}-${sanitized.safeName}.${ext}`;

      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: targetKey,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      });

      const res = await s3.send(command);
      return NextResponse.json({
        success: true,
        uploadId: res.UploadId,
        key: targetKey,
      });
    }

    // 2. SIGN INDIVIDUAL PART FOR CHUNKED UPLOAD
    if (action === "SIGN_PART") {
      if (!uploadId || !key || !partNumber) {
        return NextResponse.json({ success: false, error: "Missing uploadId, key, or partNumber" }, { status: 400 });
      }

      const partNumInt = parseInt(partNumber, 10);
      if (isNaN(partNumInt) || partNumInt < 1 || partNumInt > 10000) {
        return NextResponse.json({ success: false, error: "Invalid partNumber (1-10000)" }, { status: 400 });
      }

      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumInt,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
      return NextResponse.json({
        success: true,
        partNumber: partNumInt,
        signedUrl,
      });
    }

    // 3. COMPLETE MULTIPART UPLOAD
    if (action === "COMPLETE") {
      if (!uploadId || !key || !Array.isArray(parts)) {
        return NextResponse.json({ success: false, error: "Missing uploadId, key, or parts array" }, { status: 400 });
      }

      const command = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p: any) => ({
            PartNumber: p.partNumber,
            ETag: p.eTag,
          })),
        },
      });

      await s3.send(command);
      const publicUrl = `https://${cdnDomain}/${key}`;

      return NextResponse.json({
        success: true,
        publicUrl,
        cdnUrl: publicUrl,
        key,
      });
    }

    // 4. ABORT MULTIPART UPLOAD
    if (action === "ABORT") {
      if (!uploadId || !key) {
        return NextResponse.json({ success: false, error: "Missing uploadId or key" }, { status: 400 });
      }

      await s3.send(
        new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
        })
      );

      return NextResponse.json({ success: true, aborted: true });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[MULTIPART_UPLOAD_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message || "Multipart operation failed" }, { status: 500 });
  }
}
