# SalesmanPro — Mascot & AI Agent Architecture

**Author:** Principal Software Architect & AI Agent Engineer  
**Date:** October 2026  
**Status:** Approved Reference Architecture  
**Scope:** Mascot Execution Pipeline, Role Boundaries, Background Task Workers, and Tenant Isolation

---

## 1. Architectural Overview

The SalesmanPro Mascot is a role-aware, multi-tenant, enterprise AI operational assistant embedded directly across the web, Android, and Windows desktop platforms. It does **not** make arbitrary, unverified database modifications or invent synthetic actions. Instead, every user interaction flows through a deterministic, strictly guarded 7-stage pipeline:

```
[ User Text / Voice Query ]
          │
          ▼
1. Context & Scope Resolver (MascotContextResolver)
   ├── Authenticates active session via NextAuth
   ├── Enforces tenant boundary (targetCompanyId)
   ├── Blocks marketplace consumers & unverified accounts
   └── Derives enabled modules from CATEGORY_MENUS
          │
          ▼
2. Capability Filtering (MascotCapabilityRegistry)
   ├── Evaluates user role (SUPER_ADMIN, ADMIN, MANAGER, AGENT, STAFF)
   ├── Filters permitted actions by store category & module toggles
   └── Enforces required permission scopes
          │
          ▼
3. Intent Planner & Guardrail (MascotTaskPlanner)
   ├── Matches intent without hallucinating APIs
   ├── Assigns action type (READ, PREPARE, EXECUTE)
   └── Detects approval requirements & computes credit cost
          │
          ▼
4. Approval Checkpoint & Human-in-the-Loop (AIAgentApproval)
   ├── If sensitive/destructive: generates approval card & pauses
   └── If approved: proceeds to canonical service execution
          │
          ▼
5. Canonical Execution Engine (MascotActionEngine)
   ├── Invokes official business services (Prisma transactions, OAuth adapters)
   ├── Reserves & finalizes credits via AICreditLedger
   └── Writes permanent audit entry in AIAuditLog
          │
          ▼
6. Background Task Delegation (BullMQ & Redis)
   ├── Enqueues long-running jobs (reports, syncs, bulk audits)
   ├── Updates checkpoints, heartbeats, and progress percentages
   └── Retries with exponential backoff; refunds credits on fatal failure
          │
          ▼
7. Multi-Channel Notification & Operations Dashboard
   ├── Emits in-app, Android push, and Windows desktop notifications
   └── Updates Store Mascot Operations Hub (/admin/[slug]/mascot)
```

---

## 2. Core Subsystems

### 2.1 Context Resolver (`lib/ai/mascot/contextResolver.ts`)
* Resolves authentic session identity (`session.user.id`).
* Resolves store tenant scope (`companyId`), verifying that non-super-admins cannot target other stores.
* Evaluates consumer-only accounts (`isConsumerOnlyAccount`) and blocks public shoppers from business mascot access.
* Derives active modules from store business category (e.g. Retail, Restaurant, School, Property).

### 2.2 Capability Registry (`lib/ai/mascot/capabilityRegistry.ts`)
* Machine-readable, typed registry containing over 45 canonical actions.
* Classifies operations into risk levels: `SAFE_READ`, `SAFE_WRITE`, `SENSITIVE_WRITE`, `FINANCIAL`, `DESTRUCTIVE`.
* Maps each action to its required roles, permissions, credit costs, and suggested conversational prompts.

### 2.3 Task Planner (`lib/ai/mascot/taskPlanner.ts`)
* Deterministic natural language intent parser.
* Maps ordinary language ("Connect my Facebook page", "Why is my Facebook connection not working?", "Show active tasks") into registered capabilities.
* Injects entity parameters (e.g. provider names, date periods, stock thresholds).

### 2.4 Action Execution Engine (`lib/ai/mascot/actionEngine.ts`)
* Coordinates execution against canonical business models.
* Enforces atomic credit deduction through `AICreditLedger.reserveCredits()` and `finalizeCharge()`.
* On failure, automatically executes `refundCredits()`.

### 2.5 Background Worker (`workers/mascot-task-worker.ts`)
* Standalone BullMQ worker listening to `mascot-task-queue`.
* Manages task states (`QUEUED`, `RUNNING`, `WAITING_FOR_USER`, `WAITING_FOR_APPROVAL`, `COMPLETED`, `FAILED`, `CANCELLED`).
* Handles graceful PM2 shutdown and uncaught exception isolation.

---

## 3. Strict Separation of Dashboards

| Dimension | Store Admin Mascot Hub (`/admin/[slug]/mascot`) | Super Admin Mascot Console (`/super-admin/mascot`) |
| :--- | :--- | :--- |
| **Authentication** | Company Owner, Manager, or Staff with store access | Strictly `SUPER_ADMIN` or Platform Administrator |
| **Scope** | Single store tenant (`companyId`) | Global multi-tenant overview |
| **Integration Management** | Connect store Facebook Page, Instagram, WhatsApp number | Manage platform Meta App ID, Google Client ID, global rate limits |
| **Task Visibility** | Tasks initiated within current store | Platform-wide worker queues, backlog, latency, and error rates |
| **Approval Actions** | Authorize marketing posts, price changes, stock audits | Review platform integration policies and system-level actions |
| **Credential Security** | Decrypted only on server during API call; masked in UI | Credential vault access; store-level secrets are never exposed |

---

## 4. Cross-Platform Authoritative Sync

All platforms—Web (Next.js), Mobile (Android), and Desktop (Windows WebView2)—share a single source of truth in the central Prisma database and Redis queue:
* A task launched via mobile Android app is immediately visible on the Web dashboard.
* An approval granted on the desktop application instantly resumes the background worker.
* Push notifications route directly to `/admin/[slug]/mascot/tasks` or `/admin/[slug]/mascot/approvals` across all devices.
