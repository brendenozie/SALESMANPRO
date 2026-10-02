# SalesmanPro — Integrated Notification System & Deep Linking

**Author:** Senior Full-Stack Engineer & Mobile Architect  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** Mascot Event Notifications, Multi-Channel Delivery, Deep Linking, and Deduplication

---

## 1. Overview

Mascot and agent lifecycle events trigger notifications across Web, Android, and Windows desktop platforms using SalesmanPro's unified `NotificationService` (`lib/notifications/`).

Notifications are strictly tenant-isolated and dispatched only to authorized participants (the initiating staff member, store administrators, or platform admins).

---

## 2. Notification Event Catalog

| Event Type | Severity | Channels | Description | Deep Link Destination |
| :--- | :--- | :--- | :--- | :--- |
| `MASCOT_TASK_QUEUED` | `INFO` | In-App, Android, Desktop | Task queued for background processing | `/admin/[slug]/mascot/tasks` |
| `MASCOT_APPROVAL_REQUESTED` | `CRITICAL` | In-App, Email, Android, Desktop | Sensitive action needs human authorization | `/admin/[slug]/mascot/approvals` |
| `MASCOT_TASK_COMPLETED` | `INFO` | In-App, Android, Desktop | Background task finished successfully | `/admin/[slug]/mascot/tasks` |
| `MASCOT_TASK_FAILED` | `WARNING` | In-App, Email | Operation failed; credits refunded | `/admin/[slug]/mascot/tasks` |
| `MASCOT_TASK_PAUSED` | `WARNING` | In-App | User intervention required | `/admin/[slug]/mascot/tasks` |
| `MASCOT_INTERVENTION_NEEDED`| `WARNING` | In-App, Android | Integration reauthorization required | `/admin/[slug]/mascot/integrations` |

---

## 3. Deep Linking & Cross-Platform Routing

Every notification payload includes an authorized `actionUrl`:
* **Web:** Navigates directly to the relevant tab in `/admin/[slug]/mascot`.
* **Android:** Supported via verified App Links (`salesmanpro://mascot/approvals/{id}`).
* **Windows Desktop:** Invokes the desktop toast notification router to open the corresponding WebView2 view.

---

## 4. Deduplication & Reliability

* Every notification is assigned an `idempotencyKey` derived from `mascot_{taskId}_{eventType}`.
* When BullMQ jobs retry after network timeouts, duplicate notifications are suppressed.
* Recipients retain full historical visibility in the Notification Center even if external push relays temporarily degrade.
