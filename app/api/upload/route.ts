// File: app/api/upload/route.ts
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Tell Next.js to run this route in a Node.js runtime
export const runtime = "nodejs";

// Disable Next.js’s default bodyParser to handle multipart via formData()
export const config = { api: { bodyParser: false } };

// Initialize AWS S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AACCESS_KEY_ID,
  secretAccessKey: process.env.ASECRET_ACCESS_KEY,
  region: process.env.AREGION,
});

export const POST = withApiHandler(async (request: Request) => {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    // 1️⃣ Parse formData
    const formData = await request.formData();
    const typeField = formData.get("type");
    const fileField = formData.get("file");

    // 2️⃣ Validate “type”
    if (typeof typeField !== "string" || !["image", "video", "file"].includes(typeField)) {
      return formatResponse(false, null, 'Invalid or missing "type". Must be "image", "video", or "file".', 400);
    }

    // 3️⃣ Ensure a file is uploaded
    if (!(fileField instanceof File)) {
      return formatResponse(false, null, 'No file uploaded under field "file".', 400);
    }

    // 4️⃣ Convert file to Buffer
    const arrayBuffer = await fileField.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 5️⃣ Derive file extension & content type
    const mimeParts = fileField.type.split("/");
    const fileExtension = mimeParts[1] ?? "";

    // 6️⃣ Determine S3 key prefix
    const bucketName = process.env.AS3_BUCKET_NAME || "default-bucket-name";
    const keyPrefix = typeField === "image" ? "images/"
                    : typeField === "video" ? "videos/"
                    : "files/";

    // 7️⃣ Build unique filename
    const fileKey = `${keyPrefix}${uuidv4()}.${fileExtension}`;

    // 8️⃣ Upload to S3
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: fileField.type,
    };
    const uploadResult = await s3.upload(uploadParams).promise();

    // 9️⃣ Return public URL
    return formatResponse(true, { url: uploadResult.Location });

  } catch (err: any) {
    console.error("Upload error:", err);
    return formatResponse(false, null, err.message || "Upload failed", 500);
  }
});
