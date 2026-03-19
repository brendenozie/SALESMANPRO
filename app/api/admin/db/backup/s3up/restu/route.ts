import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyBackupSecret } from "@/lib/verifyBackupSecret";
import { setProgress } from "@/lib/restoreProgress";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req) => {
  verifyBackupSecret(req);

  const restoreId = crypto.randomUUID();

  const body = await req.json();

  if (!body?.data) {
    return Response.json(
      { success: false, message: "Invalid backup format" },
      { status: 400 }
    );
  }

  const data = body.data;
  const results: Record<string, any> = {};
  const errors: Record<string, string> = {};

  const models = Object.keys(data);

  // ---------- PARALLEL LIMIT ----------
  const limit = pLimit(3);

  await Promise.all(
    models.map((modelName) =>
      limit(() =>
        restoreModel({
          modelName,
          modelData: data[modelName],
          results,
          errors,
          restoreId,
        })
      )
    )
  );

  return Response.json({
    success: Object.keys(errors).length === 0,
    restoreId,
    restored: results,
    errors: Object.keys(errors).length ? errors : undefined,
  });
});


// ---------- RESTORE MODEL ----------
async function restoreModel({
  modelName,
  modelData,
  results,
  errors,
  restoreId,
}: any) {
  const prismaKey =
    modelName.charAt(0).toLowerCase() + modelName.slice(1);

  const modelClient = (prisma as any)[prismaKey];
  if (!modelClient) {
    errors[modelName] = "Model not found";
    return;
  }

  const modelMeta =
    (prisma as any)._runtimeDataModel.models[modelName];

  const upserts = modelData?.upserts || [];
  const deletes = modelData?.deletes || [];

  let processed = 0;

  try {
    // ---------- UPSERTS ----------
    const batchSize = 200;

    for (let i = 0; i < upserts.length; i += batchSize) {
      const batch = upserts.slice(i, i + batchSize);

      // 🔥 Optimize: split create vs update
      const existing = await modelClient.findMany({
        where: {
          id: { in: batch.map((r: any) => r.id) },
        },
        select: { id: true },
      });

      const existingSet = new Set(existing.map((e: any) => e.id));

      const toCreate = [];
      const toUpdate = [];

      for (const record of batch) {
        const clean = sanitizeForRestore(record, modelMeta);

        if (!clean.id) continue;

        if (existingSet.has(clean.id)) {
          toUpdate.push(clean);
        } else {
          toCreate.push(clean);
        }
      }

      // ---------- BULK CREATE ----------
      if (toCreate.length) {
        try {
          await modelClient.createMany({
            data: toCreate,
            skipDuplicates: true,
          });
        } catch {
          // fallback row-by-row
          for (const record of toCreate) {
            try {
              await modelClient.create({ data: record });
            } catch {}
          }
        }
      }

      // ---------- BULK UPDATE ----------
      await Promise.all(
        toUpdate.map((record: any) =>
          modelClient
            .update({
              where: { id: record.id },
              data: record,
            })
            .catch(() => null)
        )
      );

      processed += batch.length;

      setProgress(restoreId, {
        currentModel: modelName,
        total: upserts.length,
        completed: processed,
      });
    }

    // ---------- DELETES ----------
    if (deletes.length) {
      await modelClient.deleteMany({
        where: {
          id: { in: deletes },
        },
      });
    }

    results[modelName] = `${upserts.length} upserts, ${deletes.length} deletes`;

  } catch (err: any) {
    errors[modelName] = err.message;
  }
}


// ---------- SANITIZE FOR RESTORE ----------
function sanitizeForRestore(record: any, modelMeta: any) {
  const cleaned: any = {};

  for (const field of modelMeta.fields) {
    const key = field.name;
    let value = record[key];

    if (value === undefined) continue;

    try {
      switch (field.type) {
        case "String":
          if (value === null) value = "";
          value = String(value);
          break;

        case "Boolean":
          value = Boolean(value);
          break;

        case "DateTime":
          value = value ? new Date(value) : new Date();
          break;

        case "Int":
        case "Float":
          value = Number(value) || 0;
          break;

        case "Json":
          if (typeof value === "string") {
            try {
              value = JSON.parse(value);
            } catch {
              value = null;
            }
          }
          break;
      }

      cleaned[key] = value;

    } catch {
      // skip bad field
    }
  }

  return cleaned;
}


// ---------- PARALLEL LIMIT ----------
function pLimit(limit: number) {
  let active = 0;
  const queue: any[] = [];

  const next = () => {
    if (queue.length && active < limit) {
      active++;
      queue.shift()();
    }
  };

  return (fn: any) =>
    new Promise((resolve) => {
      queue.push(async () => {
        const result = await fn();
        resolve(result);
        active--;
        next();
      });
      next();
    });
}