// // lib/crypto.ts
// lib/crypto.ts
import crypto from "crypto";

const algorithm = "aes-256-gcm";

// 1. Wrap the key generation in a function so it only runs when called
function getEncryptionKey() {
  const secret = process.env.BACKUP_ENCRYPTION_KEY;
  if (!secret) {
    // Fails safely with a clear error if the key is missing at runtime
    throw new Error("CRITICAL: BACKUP_ENCRYPTION_KEY is not defined in environment variables.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive secrets (API keys, tokens).
 * Returns components suitable for DB storage.
 */
export function encrypt(plainText: string) {
  const iv = crypto.randomBytes(12); // GCM standard
  
  // 2. Call getEncryptionKey() here
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    value: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

/**
 * Decrypts secrets from DB storage.
 */
export function decrypt({
  value,
  iv,
  tag,
}: {
  value: string;
  iv: string;
  tag: string;
}) {
  // 3. Call getEncryptionKey() here too
  const decipher = crypto.createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(value, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// import crypto from "crypto";

// const algorithm = "aes-256-gcm";
// const key = crypto
//   .createHash("sha256")
//   .update(process.env.BACKUP_ENCRYPTION_KEY!)
//   .digest();

// /**
//  * Encrypts sensitive secrets (API keys, tokens).
//  * Returns components suitable for DB storage.
//  */
// export function encrypt(plainText: string) {
//   const iv = crypto.randomBytes(12); // GCM standard
//   const cipher = crypto.createCipheriv(algorithm, key, iv);

//   const encrypted = Buffer.concat([
//     cipher.update(plainText, "utf8"),
//     cipher.final(),
//   ]);

//   const tag = cipher.getAuthTag();

//   return {
//     value: encrypted.toString("hex"),
//     iv: iv.toString("hex"),
//     tag: tag.toString("hex"),
//   };
// }

// /**
//  * Decrypts secrets from DB storage.
//  */
// export function decrypt({
//   value,
//   iv,
//   tag,
// }: {
//   value: string;
//   iv: string;
//   tag: string;
// }) {
//   const decipher = crypto.createDecipheriv(
//     algorithm,
//     key,
//     Buffer.from(iv, "hex"),
//   );

//   decipher.setAuthTag(Buffer.from(tag, "hex"));

//   const decrypted = Buffer.concat([
//     decipher.update(Buffer.from(value, "hex")),
//     decipher.final(),
//   ]);

//   return decrypted.toString("utf8");
// }
