# SalesmanPro — Human-in-the-Loop Approval Engine

**Author:** Principal Software Architect & QA Lead  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** Action Authorizations, Approval Cards, Revalidation at Execution, and Audit Trails

---

## 1. Purpose

The Mascot Approval Engine guarantees that AI agents can never independently execute high-risk, financial, or destructive changes without human authorization. The mascot prepares the proposed operation, presents a structured preview, and halts execution until an authorized user approves.

---

## 2. Actions Requiring Approval

| Capability ID | Module | Risk Level | Description |
| :--- | :--- | :--- | :--- |
| `products:delete_product` | Products | `DESTRUCTIVE` | Archiving or deleting catalog items |
| `pricing:bulk_price_adjustment` | Pricing | `FINANCIAL` | Modifying pricing across categories |
| `finance:record_expense` | Finance | `FINANCIAL` | Recording operational expenses |
| `website:publish_website` | Website | `SENSITIVE_WRITE` | Publishing website builder changes live |
| `integrations:disconnect_account` | Integrations | `DESTRUCTIVE` | Revoking account connection and deleting tokens |
| `social:publish_post` | Marketing | `MARKETING` | Publishing to Facebook/Instagram (under Approval Required mode) |

---

## 3. Approval Request Lifecycle

```
[ Mascot Plans Action ] ──▶ [ capability.requiresApproval === true ]
                                            │
                                            ▼
                              [ Creates AIAgentApproval Ticket ]
                              [ Status: PENDING ]
                              [ Emits Approval Notification ]
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
             [ Store Admin Approves ]                   [ Store Admin Rejects ]
                      │                                           │
                      ▼                                           ▼
          [ Revalidate Permissions ]                   [ Status: REJECTED ]
          [ Execute Canonical Service ]                [ Credits Refunded ]
          [ Status: APPROVED ]                         [ Task Halts Safely ]
```

---

## 4. Revalidation at Execution Time

Approval is strictly bound to the exact parameters proposed. When an administrator clicks **Authorize Action**:
1. The server checks that the approval ticket is still in `PENDING` status and has not expired.
2. The server re-verifies that the approver has `ADMIN` or `SUPER_ADMIN` rights over the `companyId`.
3. The server executes the operation through the canonical business service (e.g. `Prisma.product.update`, Meta Graph API publish).
4. The result is permanently committed to `AIAuditLog`.
