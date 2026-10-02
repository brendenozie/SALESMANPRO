# SalesmanPro — Security & Tenant Isolation Controls

**Author:** Application Security Architect & DevSecOps Lead  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** Tenant Boundaries, Server-Side Authorization, Input Sanitization, Prompt-Injection Protection, and Audit Logging

---

## 1. Multi-Tenant Resource Isolation

SalesmanPro enforces zero cross-tenant access at every layer:

```
[ Request with companyId / storeSlug ]
                 │
                 ▼
[ canAccessCompanyAdmin() Verification ]
  ├── Verifies caller's session.user.id holds ownership or staff membership
  ├── If caller is SUPER_ADMIN: platform access granted (store secrets masked)
  └── If unauthorized: returns 403 Forbidden immediately
```

### Critical Rules:
* **No Client Trust:** Client-supplied `companyId` or `userId` parameters in POST bodies or URLs are never trusted without cryptographic session verification.
* **Separation of Dashboards:** Store admins cannot access `/super-admin/mascot`. Super admins cannot inspect unmasked private customer communications or raw store tokens.
* **Database Isolation:** All queries filter on `companyId`. Compound unique constraints (`@@unique([companyId, platform, platformAccountId])`) prevent cross-tenant account overwrites.

---

## 2. Prompt-Injection & Untrusted Input Defenses

1. **Tool Parameter Typing:** The mascot uses strict TypeScript schemas. Text responses from external websites or documents are treated as untrusted data and cannot trigger unauthorized system calls.
2. **Deterministic Intent Routing:** Intent routing relies on `MascotCapabilityRegistry`. The AI cannot execute unregistered functions or synthesize arbitrary database mutations.
3. **Canonical Service Layer:** Financial transactions, order creations, and inventory updates are executed exclusively through canonical services, never raw AI SQL or arbitrary write operations.

---

## 3. Audit Trails & Compliance

Every sensitive action—task creation, approval decision, token exchange, account disconnection—records an immutable log entry in `AIAuditLog`:
* Timestamp (ISO 8601)
* Actor ID & Normalized Role
* Target Resource (`companyId`, `socialAccountId`, `taskId`)
* Action Name (`MASCOT_CONNECT_FACEBOOK`, `APPROVE_ACTION`, `DISCONNECT_INTEGRATION`)
* Contextual metadata (IP address, user agent, latency)
