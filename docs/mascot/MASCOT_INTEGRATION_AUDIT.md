# SalesmanPro — Mascot & Integration Architecture Audit

**Author:** Principal Software Architect & Application Security Engineer  
**Date:** October 2026  
**Status:** Canonical Architectural Audit Report  
**Scope:** SalesmanPro Mascot, AI Agent Orchestration, BullMQ Workers, OAuth/Integrations, Unified Dashboards & Tenant Isolation

---

## Executive Summary

SalesmanPro features an established AI Mascot framework located in `lib/ai/mascot/`, `components/ai/mascot/`, and `workers/mascot-task-worker.ts`. The system provides floating UI interaction, role-based contextual capability resolution, credit reservations via `creditLedger`, and task persistence against the Prisma database (`AIAgentTask`, `AIAgentApproval`).

However, several critical architectural gaps exist:
1. **Lack of Integration Onboarding Engine:** The mascot cannot natively guide users through OAuth connections (Facebook, Instagram, WhatsApp, Google, Payment gateways). Requests like *"Connect my Facebook page"* or *"Help me connect Instagram"* are not connected to official provider authentication flows.
2. **Missing Mascot Operations Dashboards:** While an initial task list exists under `/admin/[slug]/ai-tasks`, there is no unified operations dashboard encompassing Tasks, Live Account Connections, Pending Human-in-the-Loop Approvals, Activity Timelines, and Settings.
3. **No Separation for Super Admin Oversight:** Super Admins currently lack a dedicated platform-wide Mascot and Agent Control Center (`/super-admin/mascot`) to inspect worker health, queue bottlenecks, AI credit consumption, and platform integration policies, while preventing unauthorized exposure of store-level secrets.
4. **Disconnection from `category_menus.ts`:** Mascot operations, agent tasks, account connections, and pending approvals are absent from `constant/CATEGORY_MENUS.ts`.
5. **Absence of Unified Integration Registry:** Social accounts (`SocialAccount`), WhatsApp accounts (`WhatsAppAccount`), and platform configurations (`PlatformSocialAppConfig`) exist in Prisma, but lack a unified, extensible registry and lifecycle state machine (`NOT_CONNECTED`, `SETUP_REQUIRED`, `AUTHORIZATION_PENDING`, `CONNECTED`, `ACTIVE`, `ACTION_REQUIRED`, `REVOKED`, `DISCONNECTED`).

---

## 1. Audit of Current Mascot Implementation

| Component / Subsystem | Current Status | Strengths | Gaps & Deficiencies |
| :--- | :--- | :--- | :--- |
| **Mascot UI & Chat Panel** (`components/ai/mascot/`) | Fully functional React client (`SalesmanProMascot.tsx`, `MascotChatPanel.tsx`, `MascotAvatar.tsx`) | Draggable avatar, sound effects, voice synthesis, action cards, polling for active tasks. | Lacks embedded OAuth launch buttons, interactive form input cards for setup, and deep-link indicators. |
| **Context Resolver** (`lib/ai/mascot/contextResolver.ts`) | Implemented | Strict multi-tenant resolution, consumer-account blocking, dynamic module deduction by store category. | Needs detection of connected social and messaging accounts to advise users on missing prerequisites. |
| **Capability Registry** (`lib/ai/mascot/capabilityRegistry.ts`) | Implemented (847 lines) | 40+ canonical actions across catalog, orders, inventory, pricing, finance, website builder. | Missing integration management capabilities (`integrations:connect`, `integrations:status`, `integrations:test`, `integrations:disconnect`). |
| **Task Planner** (`lib/ai/mascot/taskPlanner.ts`) | Implemented | Rule-based intent parser preventing hallucinated execution; checks permissions and limits. | Does not parse account connection intents ("Connect Facebook", "Setup WhatsApp", "Check Instagram status"). |
| **Action Execution Engine** (`lib/ai/mascot/actionEngine.ts`) | Implemented (39KB) | Invokes canonical business services (e.g. Prisma queries, stock adjustments, PDF generators); reserves/refunds AI credits. | Does not handle OAuth handshake generation, verification probes, or integration state updates. |
| **Task Service & Worker** (`lib/ai/mascot/taskService.ts`, `workers/mascot-task-worker.ts`) | Implemented with BullMQ | Durable task persistence in `AIAgentTask`, concurrency limits, retry policies, Redis BullMQ. | Does not support intermediate user input pausing (`WAITING_FOR_USER`) or integration verification polling. |
| **Document Intelligence** (`lib/ai/mascot/document*`) | Implemented | Extracted invoice/receipt data matching against orders and stock. | Operating as a separate feature; should be coordinated through unified agent workflows. |

---

## 2. Audit of Roles and Access Permissions

SalesmanPro enforces strict role boundaries:
* **SUPER_ADMIN / Super Admin:** Root authority over platform-wide infrastructure, AI provider keys (`PlatformAIProvider`), OAuth applications (`PlatformSocialAppConfig`), and cross-tenant observability. Must NOT expose store-level customer communications or private store credentials.
* **ADMIN / Company Owner:** Full operational ownership of their specific tenant (`Company`). Can authorize social accounts, configure WhatsApp Business Cloud API, approve financial updates, and delegate tasks to staff.
* **MANAGER / Store Admin:** Can manage store operations, initiate marketing drafts, review inventory, but cannot alter company-level billing or platform credentials without explicit delegation.
* **SALES_AGENT / STAFF:** Can query catalog, create customer drafts, and trigger safe read operations; blocked from destructive changes, financial refunds, or connecting external business accounts.
* **CONSUMER / MARKETPLACE_BUYER:** Strictly prohibited from mascot business features. `isConsumerOnlyAccount()` throws immediately upon context resolution.

---

## 3. Database Schema Audit (`prisma/schema.prisma`)

Existing Prisma models already support multi-tenant integration architecture:
1. **`AIAgentTask`:** Tracks `agentId`, `companyId`, `userId`, `taskType`, `title`, `priority`, `status` (`AgentTaskStatus`), `input`, `output`, `toolCalls`, `creditsUsed`, `requiresApproval`, `approvedBy`, `approvedAt`, `failureReason`.
2. **`AIAgentApproval`:** Tracks `agentId`, `taskId`, `companyId`, `actionType`, `title`, `proposedAction` (JSON), `status` (`AgentApprovalStatus`), `reviewedBy`, `reviewedAt`, `rejectionReason`, `expiresAt`.
3. **`PlatformSocialAppConfig`:** Stores platform-level OAuth client IDs and AES-256-GCM encrypted secrets (`clientSecretEncrypted`, `clientSecretIv`, `clientSecretTag`) for Facebook, Instagram, TikTok, YouTube, WhatsApp.
4. **`SocialAccount`:** Stores tenant-level connected accounts (`companyId`, `platform`, `platformAccountId`, `accountName`, `accessTokenEncrypted`, `refreshTokenEncrypted`, `tokenExpiresAt`, `scopes`, `status`).
5. **`WhatsAppAccount`:** Stores WhatsApp Cloud API credentials (`phoneNumberId`, `businessAccountId`, `accessTokenEncrypted`, `environment`, `status`).
6. **`Notification`:** Multi-channel notification model with `companyId`, `storeId`, `eventType`, `severity`, `actionUrl`, `resourceType: "mascot_task"`, `recipients`.

**Conclusion:** No destructive schema migrations are needed. We extend and standardize the usage of these existing models with typed helper wrappers and services.

---

## 4. Separation of Dashboards: Super Admin vs Store Admin

| Feature | Store Admin Mascot Dashboard (`/admin/[slug]/mascot`) | Super Admin Mascot Control Center (`/super-admin/mascot`) |
| :--- | :--- | :--- |
| **Scope** | Single Tenant (`companyId` matching store slug) | Global Platform (All tenants & workers) |
| **Task Access** | Tasks initiated by or assigned to current store | Aggregate task statistics, worker latency, queue backlog |
| **Integrations** | Store's `SocialAccount`, `WhatsAppAccount`, email settings | `PlatformSocialAppConfig`, platform OAuth apps, API quotas |
| **Approvals** | Store-level approvals (marketing posts, price updates, bulk syncs) | Platform-level approvals (policy changes, provider migrations) |
| **Credentials** | Encrypted store tokens (decrypted only on server for API calls) | Platform secrets vault (AES-256-GCM); store tokens are masked |
| **Activity Feed** | Store operational event timeline | Cross-tenant security alerts and worker performance logs |

---

## 5. Implementation Roadmap

1. **Milestone 1 — Audit & Foundation:** Complete audit and establish architecture blueprints.
2. **Milestone 2 — Unified Integration Registry & Adapters:** Implement `lib/integrations/registry.ts`, `oauth.ts`, `verification.ts` with Meta (Facebook/Instagram), WhatsApp Cloud API, and Google.
3. **Milestone 3 — Mascot Conversational Onboarding:** Extend `taskPlanner.ts` and `actionEngine.ts` to parse and guide account connections with step-by-step instructions.
4. **Milestone 4 — Background Task State Machine:** Expand `taskService.ts` and `workers/mascot-task-worker.ts` with `WAITING_FOR_USER`, `WAITING_FOR_APPROVAL`, checkpoints, and recovery.
5. **Milestone 5 — Unified Approvals Engine:** Implement `lib/approvals/approvalService.ts` for human-in-the-loop validation.
6. **Milestone 6 — Dedicated Operations Dashboards:**
   - Store Admin Mascot Dashboard at `/admin/[slug]/mascot` and `/dashboards/mascot`.
   - Super Admin Mascot Oversight at `/super-admin/mascot`.
7. **Milestone 7 — Navigation & `category_menus.ts`:** Wire role-aware menu entries across store categories and Super Admin navigation.
8. **Milestone 8 — Notifications & Cross-Platform Sync:** Connect Mascot events to `lib/notifications/` with deep links and multi-channel delivery.
9. **Milestone 9 — Automated Testing & Verification:** Verify all flows with automated end-to-end test suite (`tests/mascot-operations.test.ts`).
