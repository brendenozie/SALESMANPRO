# SalesmanPro — OAuth Security & Credential Protection

**Author:** OAuth Security Specialist & Application Security Architect  
**Date:** October 2026  
**Status:** Canonical Security Specification  
**Scope:** OAuth 2.0 Security, Token Encryption at Rest, CSRF & Replay Defenses, Tenant Isolation

---

## 1. Security Architecture Principles

All OAuth operations in SalesmanPro conform to the OAuth 2.0 Security Best Current Practice (BCP) and NIST SP 800-63B standards:
1. **Never Trust Client Account Claims:** Tenant ownership and user permissions are validated strictly server-side before initiating or completing any account connection.
2. **Cryptographically Signed Single-Use State:** All OAuth handshakes use HMAC-SHA256 signed `state` parameters bound to the specific `companyId`, `userId`, `provider`, and a random 128-bit cryptographic nonce.
3. **AES-256-GCM Encryption at Rest:** Every access token and refresh token is encrypted with Authenticated Encryption (`aes-256-gcm`) using dedicated initialization vectors (IVs) and authentication tags.
4. **Zero-Leakage Invariant:** Plaintext tokens, provider client secrets, and authentication tags are **never** returned in client JSON responses, printed to server stdout/stderr, written to markdown reports, or supplied to AI prompts.

---

## 2. OAuth State Token Structure

The state parameter sent to external providers is formatted as `<base64url(payload)>.<signature>`:

```json
{
  "companyId": "65a000000000000000000001",
  "userId": "65a000000000000000000002",
  "provider": "facebook",
  "nonce": "4f9b8c2e1a3d5e7f...",
  "timestamp": 1727878800000,
  "redirectPath": "/admin/store-slug/mascot/integrations"
}
```

### Signature & Validation Rules:
* Generated using HMAC-SHA256 keyed with the server's `MASTER_ENCRYPTION_KEY` or `NEXTAUTH_SECRET`.
* Enforces a strict 15-minute expiration limit (`ageMs <= 15 * 60 * 1000`).
* Any altered payload, invalid signature, or expired timestamp results in immediate rejection and an audit security alert.

---

## 3. Storage and Encryption at Rest

In `SocialAccount` and `PlatformSocialAppConfig`, credentials are split into three dedicated fields:
* `accessTokenEncrypted`: Hex-encoded ciphertext produced by AES-256-GCM.
* `accessTokenIv`: 12-byte random initialization vector per record.
* `accessTokenTag`: 16-byte GCM authentication tag verifying ciphertext integrity.

```typescript
// Server-side decryption occurs only when dispatching an authorized API call:
const accessToken = decrypt({
  value: account.accessTokenEncrypted,
  iv: account.accessTokenIv,
  tag: account.accessTokenTag,
});
```

---

## 4. Tenant Hijacking Prevention

When an OAuth callback returns from Meta or Google:
1. The server extracts the `companyId` and `userId` from the verified `state` token.
2. It verifies that the authenticated user currently holds `ADMIN` or `SUPER_ADMIN` rights over that `companyId`.
3. If an external account (e.g. Facebook Page ID) is already connected to another tenant, the system prevents silent reassignment without verified tenant transfer authorization.

---

## 5. Account Revocation & Disconnection

When a user clicks "Disconnect":
1. Associated scheduled tasks and background workers for that provider are halted.
2. Stored ciphertext, IVs, and tags are wiped (`accessTokenEncrypted = null`).
3. Account status transitions to `DISCONNECTED`.
4. A permanent record is logged in `AIAuditLog`.
