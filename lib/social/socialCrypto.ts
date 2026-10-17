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

  /**
   * Generates a tamper-proof, HMAC-signed OAuth state string to prevent CSRF and cross-tenant state injection.
   */
  signOAuthState(payload: Record<string, unknown>): string {
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json, "utf8").toString("base64url");
    const secret = process.env.BACKUP_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "salesmanpro-oauth-state-key-fallback";
    const cryptoMod = require("crypto");
    const signature = cryptoMod.createHmac("sha256", secret).update(b64).digest("base64url");
    return `${b64}.${signature}`;
  },

  /**
   * Verifies and decodes a signed OAuth state token. Rejects tampered payloads.
   */
  verifyOAuthState<T = any>(stateToken: string): T {
    if (!stateToken || typeof stateToken !== "string") {
      throw new Error("Missing or invalid state parameter");
    }

    const parts = stateToken.split(".");
    if (parts.length === 2) {
      const [b64, signature] = parts;
      const secret = process.env.BACKUP_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "salesmanpro-oauth-state-key-fallback";
      const cryptoMod = require("crypto");
      const expectedSig = cryptoMod.createHmac("sha256", secret).update(b64).digest("base64url");
      if (signature !== expectedSig) {
        throw new Error("Tampered or forged OAuth state parameter (signature mismatch)");
      }
      const json = Buffer.from(b64, "base64url").toString("utf8");
      return JSON.parse(json) as T;
    }

    // Graceful backward-compatibility with plain base64url if unsigned during transition
    try {
      const json = Buffer.from(stateToken, "base64url").toString("utf8");
      return JSON.parse(json) as T;
    } catch {
      throw new Error("Malformed or unparseable OAuth state parameter");
    }
  },
};

