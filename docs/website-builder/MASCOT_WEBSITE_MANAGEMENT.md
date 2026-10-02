# SalesmanPro AI Mascot — Website Management Capabilities

## 1. Mascot Architecture & Website Module
The SalesmanPro AI Mascot operates as an authoritative business copilot. With the addition of the `website` module, the mascot can inspect, modify, and publish storefronts using the same server-side service (`lib/website-builder/website-service.ts`) as the visual builder.

### Authoritative Website Capabilities:
1. `website:view_config`:
   - Inspects active theme key, display name, shell layout, body component, page count, and draft status.
   - Low-risk read (`SAFE_READ`), credit cost: 0.2.
2. `website:update_theme`:
   - Modifies `primaryColor`, `secondaryColor`, `headingFont`, `bodyFont` in the tenant's draft.
   - Safe write (`SAFE_WRITE`), credit cost: 0.8.
3. `website:update_section`:
   - Updates headline, subline, title, CTA text, CTA link, or custom content for a page section in the draft.
   - Safe write (`SAFE_WRITE`), credit cost: 1.0.
4. `website:reorder_sections`:
   - Changes section ordering array or toggles section visibility.
   - Safe write (`SAFE_WRITE`), credit cost: 0.5.
5. `website:generate_content`:
   - Formulates proposed promotional copy and About Us stories tailored to the store category.
   - Action type: `PREPARE`, credit cost: 1.0.
6. `website:publish_website`:
   - Atomically publishes the working draft to the live public storefront and clears cache.
   - Sensitive write (`SENSITIVE_WRITE`), requires admin approval ticket (`requiresApproval: true`), credit cost: 1.5.

---

## 2. Security, Tenant Isolation & Auditing
- **Server-Side Validation:** All actions execute through `MascotActionEngine` which verifies session, company ownership, role, and permission.
- **Audit Logs:** Every update is recorded in `prisma.aIAuditLog` with actor ID, timestamp, and entity payload.
- **Approval Gate:** The mascot cannot publish changes live without human approval from an authorized store administrator.
