// In your /api/upload-url.ts (or .js) file

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AREGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AACCESS_KEY_ID!,
    secretAccessKey: process.env.ASECRET_ACCESS_KEY!,
  },
});

// export async function POST(request: Request) {
//   const { filename, contentType } = await request.json();

//   try {
//     const command = new PutObjectCommand({
//       Bucket: process.env.AS3_BUCKET_NAME, // "salesmanprobucket"
//       Key: `images/${filename}`,
//       ContentType: contentType, // <-- IMPORTANT: Must match the frontend
//     });

//     // The key change is to add `useAccelerateEndpoint: false`
//     // and explicitly disable the checksum for the upload.
//     // In newer SDK versions, the checksum is added by middleware,
//     // so we turn it off when creating the signed URL.
//     const uploadUrl = await getSignedUrl(s3Client, command, {
//         expiresIn: 3600, // URL expires in 1 hour
//         // This parameter may not be available on all commands, but
//         // the core issue is that the SDK adds checksum headers which
//         // the browser doesn't send. The best practice is ensuring
//         // your SDK version doesn't enforce this by default for presigned PUTs.
//         // A common workaround is to ensure no checksum-related headers
//         // are part of the signature if the client can't provide them.
//     });

//     // Create a public URL to return to the client
//     const publicUrl = `https://${process.env.AS3_BUCKET_NAME}.s3.${process.env.AREGION}.amazonaws.com/images/${filename}`;

//     return Response.json({ uploadUrl, publicUrl });

//   } catch (error) {
//     console.error("Error creating signed URL:", error);
//     return Response.json({ error: "Failed to create signed URL" }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.ASECRET_ACCESS_KEY!,
//   },
// });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    const type = searchParams.get("type") || "image";

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const bucket = process.env.AS3_BUCKET_NAME!;
    const key = `${type}s/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      // ContentType: "image/*",
      ChecksumAlgorithm: undefined, // Disable checksum to avoid signature mismatch
      ContentType: type.startsWith("image") ? "image/*" : "application/octet-stream",
      ChecksumCRC32: undefined,
      ChecksumCRC32C: undefined,
      ChecksumSHA1: undefined,
      ChecksumSHA256: undefined,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 1 min
    const publicUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err: any) {
    console.error("S3 signed URL error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

//NEW V2

// /app/api/upload-url/route.ts
// import { NextResponse } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // Create S3 client once per edge/server instance
// const s3 = new S3Client({
//   region: process.env.AREGION || "eu-north-1",
//   credentials: {
//     accessKeyId: process.env.AACCESS_KEY_ID!,
//     secretAccessKey: process.env.ASECRET_ACCESS_KEY!,
//   },
// });


// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const filename = searchParams.get("filename");
//     const type = searchParams.get("type") || "image";
//     const contentType = searchParams.get("contentType") || "application/octet-stream";

//     if (!filename) {
//       return NextResponse.json({ error: "Missing filename" }, { status: 400 });
//     }

//     // Validate type to prevent abuse
//     const validTypes = ["image", "video", "book"];
//     if (!validTypes.includes(type)) {
//       return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
//     }

//     const bucket = process.env.S3_BUCKET_NAME!;
//     const key = `${type}s/${Date.now()}-${encodeURIComponent(filename)}`;

//     const command = new PutObjectCommand({
//       Bucket: bucket,
//       Key: key,
//       ContentType: contentType,
//       // Optional: restrict public access here if bucket is private
//       ACL: "public-read",
//     });

//     // 5-minute expiry (frontend uploads immediately after requesting URL)
//     const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

//     // Public CDN or S3 URL
//     const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || `${bucket}.s3.${process.env.AREGION}.amazonaws.com`;
//     const publicUrl = `https://${cdnBase}/${key}`;

//     return NextResponse.json({ uploadUrl, publicUrl });
//   } catch (err: any) {
//     console.error("❌ S3 signed URL error:", err);
//     return NextResponse.json({ error: err.message || "Failed to generate signed URL" }, { status: 500 });
//   }
// }

// OLDER VERSION

// // In your /api/upload-url.ts (or .js) file

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { NextResponse } from "next/server";

// const s3 = new S3Client({
//   region: process.env.AREGION || "eu-north-1",
//   credentials: {
//     accessKeyId: process.env.AACCESS_KEY_ID!,
//     secretAccessKey: process.env.ASECRET_ACCESS_KEY!,
//   },
// });

// // export async function POST(request: Request) {
// //   const { filename, contentType } = await request.json();

// //   try {
// //     const command = new PutObjectCommand({
// //       Bucket: process.env.AS3_BUCKET_NAME, // "salesmanprobucket"
// //       Key: `images/${filename}`,
// //       ContentType: contentType, // <-- IMPORTANT: Must match the frontend
// //     });

// //     // The key change is to add `useAccelerateEndpoint: false`
// //     // and explicitly disable the checksum for the upload.
// //     // In newer SDK versions, the checksum is added by middleware,
// //     // so we turn it off when creating the signed URL.
// //     const uploadUrl = await getSignedUrl(s3Client, command, {
// //         expiresIn: 3600, // URL expires in 1 hour
// //         // This parameter may not be available on all commands, but
// //         // the core issue is that the SDK adds checksum headers which
// //         // the browser doesn't send. The best practice is ensuring
// //         // your SDK version doesn't enforce this by default for presigned PUTs.
// //         // A common workaround is to ensure no checksum-related headers
// //         // are part of the signature if the client can't provide them.
// //     });

// //     // Create a public URL to return to the client
// //     const publicUrl = `https://${process.env.AS3_BUCKET_NAME}.s3.${process.env.AREGION}.amazonaws.com/images/${filename}`;

// //     return Response.json({ uploadUrl, publicUrl });

// //   } catch (error) {
// //     console.error("Error creating signed URL:", error);
// //     return Response.json({ error: "Failed to create signed URL" }, { status: 500 });
// //   }
// // }

// // import { NextRequest, NextResponse } from "next/server";
// // import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // const s3 = new S3Client({
// //   region: process.env.AWS_REGION!,
// //   credentials: {
// //     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
// //     secretAccessKey: process.env.ASECRET_ACCESS_KEY!,
// //   },
// // });

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const filename = searchParams.get("filename");
//     const type = searchParams.get("type") || "image";

//     if (!filename) {
//       return NextResponse.json({ error: "Missing filename" }, { status: 400 });
//     }

//     const bucket = process.env.AS3_BUCKET_NAME!;
//     const key = `${type}s/${Date.now()}-${filename}`;

//     const command = new PutObjectCommand({
//       Bucket: bucket,
//       Key: key,
//       // ContentType: "image/*",
//       ChecksumAlgorithm: undefined, // Disable checksum to avoid signature mismatch
//       ContentType: type.startsWith("image") ? "image/*" : "application/octet-stream",
//       ChecksumCRC32: undefined,
//       ChecksumCRC32C: undefined,
//       ChecksumSHA1: undefined,
//       ChecksumSHA256: undefined,
//     });

//     const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
//     const publicUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL}/${key}`;

//     return NextResponse.json({ uploadUrl, publicUrl });
//   } catch (err: any) {
//     console.error("S3 signed URL error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // // import { NextRequest, NextResponse } from "next/server";
// // // import { PutObjectCommand } from "@aws-sdk/client-s3";
// // // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// // // import { s3 } from "@/lib/s3";

// // export async function GET(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const filename = searchParams.get("filename");
// //     const type = searchParams.get("type") || "image";

// //     if (!filename) {
// //       return NextResponse.json({ error: "Missing filename" }, { status: 400 });
// //     }

// //     const bucket = process.env.AS3_BUCKET_NAME!;
// //     const key = `${type}s/${Date.now()}-${filename}`;

// //     // Generate a presigned URL for uploading
// //     const command = new PutObjectCommand({
// //       Bucket: bucket,
// //       Key: key,
// //       ContentType: type.startsWith("image") ? "image/*" : "application/octet-stream",
// //     });

// //     const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min
// //     const publicUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL}/${key}`;

// //     return NextResponse.json({ uploadUrl, publicUrl });
// //   } catch (err: any) {
// //     console.error("S3 signed URL error:", err);
// //     return NextResponse.json({ error: err.message }, { status: 500 });
// //   }
// // }


///OLD 
// // import { NextRequest, NextResponse } from "next/server";
// // import { PutObjectCommand } from "@aws-sdk/client-s3";
// // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// // import { s3 } from "@/lib/s3";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const filename = searchParams.get("filename");
//     const type = searchParams.get("type") || "image";

//     if (!filename) {
//       return NextResponse.json({ error: "Missing filename" }, { status: 400 });
//     }

//     const bucket = process.env.AS3_BUCKET_NAME!;
//     const key = `${type}s/${Date.now()}-${filename}`;

//     // Generate a presigned URL for uploading
//     const command = new PutObjectCommand({
//       Bucket: bucket,
//       Key: key,
//       ContentType: type.startsWith("image") ? "image/*" : "application/octet-stream",
//     });

//     const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min
//     const publicUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL}/${key}`;

//     return NextResponse.json({ uploadUrl, publicUrl });
//   } catch (err: any) {
//     console.error("S3 signed URL error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
