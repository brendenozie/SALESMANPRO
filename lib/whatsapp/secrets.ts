import crypto from "node:crypto";

function getMasterKey(): Buffer {
  const raw =
    process.env.MASTER_ENCRYPTION_KEY ??
    process.env.WHATSAPP_MASTER_ENCRYPTION_KEY;

  if (!raw) {
    throw new Error("MASTER_ENCRYPTION_KEY is not configured.");
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  const decoded = Buffer.from(raw, "base64");

  if (decoded.length === 32) {
    return decoded;
  }

  throw new Error("MASTER_ENCRYPTION_KEY must represent exactly 32 bytes.");
}

function decode(value: string): Buffer {
  if (/^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0) {
    return Buffer.from(value, "hex");
  }

  return Buffer.from(value, "base64");
}

export function decryptWhatsAppSecret(params: {
  encrypted: string;
  iv: string;
  tag: string;
}): string {
  const key = getMasterKey();

  const iv = decode(params.iv);

  const tag = decode(params.tag);

  const encrypted = decode(params.encrypted);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
