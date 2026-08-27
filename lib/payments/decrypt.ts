// lib/payments/decrypt.ts
import { decrypt } from "@/lib/crypto";

export function decryptSecret(
  encrypted?: string | null,
  iv?: string | null,
  tag?: string | null,
) {
  if (!encrypted || !iv || !tag) return undefined;
  return decrypt({ value: encrypted, iv, tag });
}
