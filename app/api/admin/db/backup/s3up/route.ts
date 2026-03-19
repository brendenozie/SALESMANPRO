// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { verifyBackupSecret } from "@/lib/verifyBackupSecret";

// import { S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";
// import { PassThrough } from "stream";

// export const runtime = "nodejs";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export const POST = withApiHandler(async (req) => {
//   verifyBackupSecret(req);

//   const models = Object.keys(
//     (prisma as any)._runtimeDataModel.models
//   );

//   const passThrough = new PassThrough();

//   const fileKey = `backups/backup-${Date.now()}.json`;

//   // 🔥 Start upload immediately (streaming)
//   const upload = new Upload({
//     client: s3,
//     params: {
//       Bucket: process.env.AWS_BUCKET_NAME!,
//       Key: fileKey,
//       Body: passThrough,
//       ContentType: "application/json",
//     },
//   });

//   const encoder = new TextEncoder();

//   (async () => {
//     const write = (chunk: string) => {
//       passThrough.write(Buffer.from(chunk));
//     };

//     const errorMap: Record<string, string> = {};

//     // META
//     write(
//       JSON.stringify({
//         meta: {
//           version: "v1",
//           timestamp: Date.now(),
//         },
//         data: {},
//       }).replace(/}$/, ', "data": {')
//     );

//     for (let i = 0; i < models.length; i++) {
//       const modelName = models[i];
//       const prismaKey =
//         modelName.charAt(0).toLowerCase() + modelName.slice(1);

//       const modelClient = (prisma as any)[prismaKey];
//       if (!modelClient) continue;

//       write(`"${modelName}":[`);

//       let first = true;
//       let skip = 0;
//       const batchSize = 1000;
//       let batch: any[] = [];

//       try {
//         do {
//           batch = await modelClient.findMany({
//             skip,
//             take: batchSize,
//           });

//           for (const record of batch) {
//             try {
//               const clean = sanitize(record);
//               const json = JSON.stringify(clean);

//               if (!first) write(",");
//               write(json);
//               first = false;
//             } catch {
//               // skip bad row
//             }
//           }

//           skip += batchSize;
//         } while (batch.length === batchSize);
//       } catch (err: any) {
//         errorMap[modelName] = err.message;
//       }

//       write("]");

//       if (i !== models.length - 1) {
//         write(",");
//       }
//     }

//     // CLOSE JSON
//     write(`}, "errors": ${JSON.stringify(errorMap)}}`);

//     passThrough.end();
//   })();

//   await upload.done();

//   return Response.json({
//     success: true,
//     fileKey,
//     url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
//   });
// });

// // --------- SANITIZER
// function sanitize(record: any) {
//   const cleaned: any = {};

//   for (const key in record) {
//     const value = record[key];

//     if (value === null || value === undefined) continue;

//     if (
//       typeof value === "object" &&
//       value !== null &&
//       value.create
//     ) {
//       continue;
//     }

//     cleaned[key] = value;
//   }

//   return cleaned;
// }

// // upload is a readable stream, so we can track progress if needed
// // upload.on("httpUploadProgress", (progress) => {
// //   console.log(
// //     `Uploaded ${progress.loaded} / ${progress.total}`
// //   );
// // });

// // ===============================
// // In case we want to generate signed URLs for direct download from S3 instead of streaming through our server
// // ===============================
// // import { GetObjectCommand } from "@aws-sdk/client-s3";
// // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // const command = new GetObjectCommand({
// //   Bucket: process.env.AWS_BUCKET_NAME!,
// //   Key: fileKey,
// // });

// // const signedUrl = await getSignedUrl(s3, command, {
// //   expiresIn: 3600, // 1 hour
// // });

// curl -X POST https://yourdomain.com/api/admin/db/backup/s3up \
  // -H "x-backup-secret: YOUR_SECRET"
// curl -X POST https://yourdomain.com/api/backup \
//   -H "Authorization: Bearer SECRET"