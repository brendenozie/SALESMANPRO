/**
 * lib/social/socialCrypto.ts
 *
 * Secure Hardware-Grade Token Encryption and Decryption for Social Media Platform
 * OAuth access and refresh tokens using AES-256-GCM.
 *
 * CRITICAL SECURITY INVARIANT:
 * Plaintext tokens must NEVER be logged, sent to the browser, or exposed in AI prompts.
 */

import { encrypt, decrypt } from "../crypto";

export interface EncryptedSecretBundle {
  encrypted: string;
  iv: string;
  tag: string;
}

export const socialCrypto = {
  /**
   * Encrypts an OAuth access token or refresh token.
   */
  encryptToken(token: string): EncryptedSecretBundle {
    if (!token) {
      throw new Error("Cannot encrypt empty social token");
    }
    const result = encrypt(token);
    return {
      encrypted: result.value,
      iv: result.iv,
      tag: result.tag,
    };
  },

  /**
   * Decrypts an encrypted token bundle safely on the server.
   */
  decryptToken(bundle: { encrypted?: string | null; iv?: string | null; tag?: string | null }): string {
    if (!bundle.encrypted || !bundle.iv || !bundle.tag) {
      throw new Error("Invalid or incomplete encrypted token bundle");
    }
    return decrypt({
      value: bundle.encrypted,
      iv: bundle.iv,
      tag: bundle.tag,
    });
  },

  /**
   * Masks sensitive IDs or tokens for safe display in UI/telemetry.
   * e.g., "EAABw...3kL9"
   */
  maskSecret(secret?: string | null): string {
    if (!secret) return "••••••••";
    if (secret.length <= 8) return "••••••••";
    return `${secret.substring(0, 4)}••••${secret.substring(secret.length - 4)}`;
  },
};
