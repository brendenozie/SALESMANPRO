import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    const type = searchParams.get("type") || "image";

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const bucket = process.env.S3_BUCKET_NAME!;
    const key = `${type}s/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "image/*",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min
    const publicUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err: any) {
    console.error("S3 signed URL error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
