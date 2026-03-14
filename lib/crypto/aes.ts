import crypto from "crypto";

function getMasterKey(): Buffer {
  const key =
    process.env.MASTER_ENCRYPTION_KEY ??
    process.env.NEXT_PUBLIC_MASTER_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("MASTER_ENCRYPTION_KEY is missing");
  }

  const buffer = Buffer.from(key, "hex");

  if (buffer.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY must be 32 bytes (hex-encoded 64 chars).");
  }

  return buffer;
}

export function encrypt(value: string) {
  const MASTER_KEY = getMasterKey();

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    value: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(payload: { iv: string; value: string; tag: string }) {
  const MASTER_KEY = getMasterKey();

  const iv = Buffer.from(payload.iv, "hex");
  const encrypted = Buffer.from(payload.value, "hex");
  const tag = Buffer.from(payload.tag, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
// export function encrypt(value: string) {
//   const iv = crypto.randomBytes(12); // GCM recommended 96-bit IV
//   const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);

//   const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
//   const tag = cipher.getAuthTag();

//   return {
//     iv: iv.toString("hex"),
//     value: encrypted.toString("hex"),
//     tag: tag.toString("hex"),
//   };
// }

// export function decrypt(payload: { iv: string; value: string; tag: string }) {
//   const iv = Buffer.from(payload.iv, "hex");
//   const encrypted = Buffer.from(payload.value, "hex");
//   const tag = Buffer.from(payload.tag, "hex");

//   const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
//   decipher.setAuthTag(tag);

//   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//   return decrypted.toString("utf8");
// }
