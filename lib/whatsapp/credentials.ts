import { decrypt } from "@/lib/crypto";

export function decryptWhatsAppAccessToken(account: {
  accessTokenEncrypted?: string | null;
  accessTokenIv?: string | null;
  accessTokenTag?: string | null;
}): string {
  if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
    return decrypt({
      value: account.accessTokenEncrypted,
      iv: account.accessTokenIv,
      tag: account.accessTokenTag,
    });
  }
  return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
}

export function decryptWhatsAppAppSecret(account: {
  appSecretEncrypted?: string | null;
  appSecretIv?: string | null;
  appSecretTag?: string | null;
}): string {
  if (account.appSecretEncrypted && account.appSecretIv && account.appSecretTag) {
    return decrypt({
      value: account.appSecretEncrypted,
      iv: account.appSecretIv,
      tag: account.appSecretTag,
    });
  }
  return process.env.WHATSAPP_APP_SECRET ?? "";
}

export function looksLikePlaceholderSecret(value?: string | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\*+$/.test(trimmed) || trimmed === "unchanged" || trimmed === "[REDACTED]";
}
