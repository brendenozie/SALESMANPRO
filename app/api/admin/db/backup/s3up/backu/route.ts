// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { verifyBackupSecret } from "@/lib/verifyBackupSecret";

// import { S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";
// import { PassThrough } from "stream";

// export const runtime = "nodejs";

// // ---------- S3 CLIENT ----------
// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// // ---------- MAIN API ----------
// export const POST = withApiHandler(async (req) => {
//   verifyBackupSecret(req);

//   const since = req.nextUrl.searchParams.get("since");
//   const lastBackupAt = since ? new Date(since) : null;

//   const models = Object.keys(
//     (prisma as any)._runtimeDataModel.models
//   );

//   const passThrough = new PassThrough();
//   const fileKey = `backups/backup-${Date.now()}.json`;

//   const upload = new Upload({
//     client: s3,
//     params: {
//       Bucket: process.env.AWS_BUCKET_NAME!,
//       Key: fileKey,
//       Body: passThrough,
//       ContentType: "application/json",
//     },
//   });

//   const write = (chunk: string) =>
//     passThrough.write(Buffer.from(chunk));

//   const issues: any[] = [];
//   const errorMap: Record<string, string> = {};

//   // ---------- START STREAM ----------
//   (async () => {
//     write(
//       JSON.stringify({
//         meta: {
//           version: "v2",
//           timestamp: Date.now(),
//           type: lastBackupAt ? "incremental" : "full",
//         },
//       }).replace(/}$/, ', "data": {')
//     );

//     // ---------- PARALLEL DUMP ----------
//     const limit = pLimit(5);

//     await Promise.all(
//       models.map((modelName, index) =>
//         limit(() =>
//           dumpModel({
//             modelName,
//             lastBackupAt,
//             write,
//             issues,
//             errorMap,
//             isLast: index === models.length - 1,
//           })
//         )
//       )
//     );

//     // ---------- CLOSE JSON ----------
//     write(`}, "errors": ${JSON.stringify(errorMap)}}`);

//     passThrough.end();
//   })();

//   await upload.done();

//   return Response.json({
//     success: true,
//     fileKey,
//     url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
//     issuesCount: issues.length,
//   });
// });

// // ---------- MODEL DUMP ----------
// async function dumpModel({
//   modelName,
//   lastBackupAt,
//   write,
//   issues,
//   errorMap,
//   isLast,
// }: any) {
//   const modelMeta =
//     (prisma as any)._runtimeDataModel.models[modelName];

//   write(`"${modelName}":{"upserts":[`);

//   let offset = 0;
//   const batchSize = 1000;
//   let first = true;

//   try {
//     while (true) {
//       const whereClause = lastBackupAt
//         ? `WHERE "updatedAt" > '${lastBackupAt.toISOString()}'`
//         : "";

//       const rows = await prisma.$queryRawUnsafe(
//         `SELECT * FROM "${modelName}" ${whereClause}
//          LIMIT ${batchSize} OFFSET ${offset}`
//       );

//       if (!rows.length) break;

//       for (const row of rows) {
//         try {
//           const repaired = repairRecord(
//             row,
//             modelMeta,
//             issues,
//             modelName
//           );

//           if (!first) write(",");
//           write(JSON.stringify(repaired));
//           first = false;
//         } catch {
//           // skip bad row
//         }
//       }

//       offset += batchSize;
//     }
//   } catch (err: any) {
//     errorMap[modelName] = err.message;
//   }

//   write("],");

//   // ---------- DELETES ----------
//   write(`"deletes":[`);

//   try {
//     const deleted = await prisma.$queryRawUnsafe(
//       `SELECT id FROM "${modelName}"
//        WHERE "deletedAt" IS NOT NULL`
//     );

//     write(JSON.stringify(deleted.map((d: any) => d.id)));
//   } catch {
//     write("[]");
//   }

//   write("]}");

//   if (!isLast) write(",");
// }

// // ---------- SCHEMA-AWARE REPAIR ----------
// function repairRecord(
//   record: any,
//   modelMeta: any,
//   issues: any[],
//   modelName: string
// ) {
//   const repaired: any = {};

//   for (const field of modelMeta.fields) {
//     const key = field.name;
//     let value = record[key];

//     if (value === undefined) continue;

//     try {
//       switch (field.type) {
//         case "String":
//           if (value === null) {
//             issues.push({ modelName, key, value });
//             value = "";
//           }
//           value = String(value);
//           break;

//         case "Boolean":
//           if (typeof value !== "boolean") {
//             issues.push({ modelName, key, value });
//             value = Boolean(value);
//           }
//           break;

//         case "DateTime":
//           if (!value) {
//             issues.push({ modelName, key, value });
//             value = new Date().toISOString();
//           } else {
//             value = new Date(value).toISOString();
//           }
//           break;

//         case "Int":
//         case "Float":
//           value = Number(value) || 0;
//           break;

//         case "Json":
//           if (typeof value === "string") {
//             try {
//               value = JSON.parse(value);
//             } catch {
//               value = null;
//             }
//           }

//           if (value?.create) {
//             issues.push({ modelName, key, value });
//             value = [];
//           }
//           break;
//       }

//       // Fix BigInt
//       if (typeof value === "bigint") {
//         value = value.toString();
//       }

//       repaired[key] = value;

//     } catch {
//       // skip broken field
//     }
//   }

//   return repaired;
// }

// // ---------- PARALLEL LIMITER ----------
// function pLimit(limit: number) {
//   let active = 0;
//   const queue: any[] = [];

//   const next = () => {
//     if (queue.length && active < limit) {
//       active++;
//       queue.shift()();
//     }
//   };

//   return (fn: any) =>
//     new Promise((resolve) => {
//       queue.push(async () => {
//         const result = await fn();
//         resolve(result);
//         active--;
//         next();
//       });
//       next();
//     });
// }
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
