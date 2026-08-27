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


// import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_KEY as string; // Must be 32 characters
const IV_LENGTH = 12;

export function encryptKRA(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, "hex"),
    iv,
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptKRA(text: string): string {
  const [ivHex, tagHex, encrypted] = text.split(":");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, "hex"),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
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


