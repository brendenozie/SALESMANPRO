// File: app/api/upload/route.ts

import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Tell Next.js to run this route in a Node.js runtime
export const runtime = "nodejs";

// Disable Next.js’s default bodyParser so we can read multipart via formData()
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize AWS S3 client (AWS SDK v2—still supported but in maintenance mode)
const s3 = new AWS.S3({
  accessKeyId: process.env.AACCESS_KEY_ID,
  secretAccessKey: process.env.ASECRET_ACCESS_KEY,
  region: process.env.AREGION,
});

/**
 * POST /api/upload (App-Router style)
 * Expects a multipart/form-data request with:
 *   • a field named “type” (“image”, “video”, or “file”)
 *   • a single file under the field name “file”
 */
export async function POST(request: Request) {
  try {
    // 1️⃣ Use the Web-Request formData() API to retrieve fields + file blob
    const formData = await request.formData();
    const typeField = formData.get("type");
    const fileField = formData.get("file");

    // 2️⃣ Validate “type”
    if (typeof typeField !== "string" || !["image", "video", "file"].includes(typeField)) {
      return NextResponse.json(
        { error: 'Invalid or missing “type”. Must be "image", "video", or "file".' },
        { status: 400 }
      );
    }

    // 3️⃣ Ensure we have a file upload
    if (!(fileField instanceof File)) {
      return NextResponse.json({ error: "No file uploaded under field “file”." }, { status: 400 });
    }

    // 4️⃣ Read the file’s ArrayBuffer → convert to Buffer for S3
    const arrayBuffer = await fileField.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 5️⃣ Derive file extension & content type
    //     (e.g. fileField.type === "image/png", so split "/" → ["image", "png"])
    const mimeParts = fileField.type.split("/");
    const fileExtension = mimeParts[1] ?? ""; // e.g., "png", "pdf", "epub"

    // 6️⃣ Choose your S3 bucket & key prefix
    const bucketName = process.env.AS3_BUCKET_NAME || "default-bucket-name";

    let keyPrefix: string;
    switch (typeField) {
      case "image":
        keyPrefix = "images/";
        break;
      case "video":
        keyPrefix = "videos/";
        break;
      case "file":
        keyPrefix = "files/";
        break;
      default:
        // (This should never happen because we validated above.)
        return NextResponse.json({ error: "Unsupported type." }, { status: 400 });
    }

    // 7️⃣ Build a unique filename (UUID + extension)
    const fileKey = `${keyPrefix}${uuidv4()}.${fileExtension}`;

    // 8️⃣ Upload to S3
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: fileField.type,
    };
    const uploadResult = await s3.upload(uploadParams).promise();

    // 9️⃣ Return the public URL
    return NextResponse.json({ url: uploadResult.Location }, { status: 201 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: `Upload failed: ${err.message}` }, { status: 500 });
  }
}
