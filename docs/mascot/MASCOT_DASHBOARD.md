# SalesmanPro — Unified Operations Dashboards

**Author:** Senior Next.js Engineer & UI/UX Specialist  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** Store Admin Mascot Dashboard, Super Admin Control Center, Navigation & Role Isolation

---

## 1. Overview & Strict Role Separation

SalesmanPro strictly separates the operational experiences for **Store Administrators** and the **Platform Super Admin**:

```
                              ┌────────────────────────────────────────┐
                              │          SalesmanPro Platform          │
                              └───────────────────┬────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌─────────────────────────────────┐                               ┌─────────────────────────────────┐
│     Store Admin Mascot Hub      │                               │   Super Admin Control Center    │
│    (/admin/[slug]/mascot)       │                               │      (/super-admin/mascot)      │
├─────────────────────────────────┤                               ├─────────────────────────────────┤
│ • Tenant-isolated (single store)│                               │ • Global platform oversight     │
│ • Connect store Facebook/IG/WA  │                               │ • Platform OAuth app keys       │
│ • Store-level task execution    │                               │ • BullMQ queue telemetry        │
│ • Local action approvals        │                               │ • Cross-tenant worker health    │
│ • Zero platform secrets exposed │                               │ • Zero store customer leakage   │
└─────────────────────────────────┘                               └─────────────────────────────────┘
```

---

## 2. Store Admin Mascot Operations Hub (`/admin/[slug]/mascot`)

### 2.1 Sub-Panels
1. **Overview:** High-level operational KPIs (Active Tasks, Pending Approvals, Connected Integrations, AI Credit balance), interactive quick-prompt triggers, and recent activity stream.
2. **Tasks (`/mascot/tasks`):** Real-time filterable task table with progress percentages, status badges (`RUNNING`, `QUEUED`, `AWAITING_APPROVAL`, `COMPLETED`, `FAILED`), and task action links.
3. **Integrations (`/mascot/integrations`):** Visual card grid of Facebook, Instagram, WhatsApp Cloud API, Google, M-Pesa, Stripe. Shows connected asset names, health check probe buttons, and disconnect controls.
4. **Approvals (`/mascot/approvals`):** Human-in-the-loop review cards with clear risk indicators, affected record previews, and Authorize / Reject buttons.
5. **Activity (`/mascot/activity`):** Chronological event timeline of mascot operations and worker executions.
6. **Settings:** Publishing mode toggles (`DRAFT_ONLY`, `APPROVAL_REQUIRED`, `PREAPPROVED`).

---

## 3. Super Admin Mascot Control Center (`/super-admin/mascot`)

### 3.1 Sub-Panels
1. **Platform Overview:** Global task counters, BullMQ Redis status, active PM2 workers (`mascot-task-worker`, `ai-job-worker`, `whatsapp-worker`).
2. **Cross-Tenant Task Stream:** Sanitized real-time feed of tasks across all stores. Customer names, phone numbers, and secrets are strictly redacted.
3. **Worker & Queue Infrastructure:** BullMQ queue concurrency, latency metrics, and failure rates.
4. **Platform OAuth Applications:** Status of global Meta App, Google Client, and WhatsApp platform credentials in `PlatformSocialAppConfig`.
