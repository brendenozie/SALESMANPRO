# SalesmanPro — Background Task Orchestration (BullMQ & Redis)

**Author:** DevOps Engineer & Senior Backend Architect  
**Date:** October 2026  
**Status:** Approved Reference  
**Scope:** BullMQ Queue Worker, Redis Connection, Task State Machine, Idempotency & Resumption

---

## 1. Queue Architecture

SalesmanPro utilizes BullMQ and Redis for long-running, asynchronous AI agent operations. Operations such as:
* Multi-step inventory audits and reorder calculations
* Scheduled social media content generation and publishing
* WhatsApp customer order processing
* Catalog bulk updates and marketplace syncs
* Integration verification probes

are executed asynchronously in `workers/mascot-task-worker.ts` rather than blocking user-facing HTTP requests.

---

## 2. Task Lifecycle State Machine

Tasks transition through 11 validated states:

```
[ QUEUED ] ──▶ [ RUNNING ] ──▶ [ WAITING_FOR_USER ]
     │               │                 │
     │               ▼                 ▼
     │       [ WAITING_FOR_APPROVAL ] ─▶ [ RUNNING ]
     │               │
     ▼               ▼
[ RETRYING ] ──▶ [ COMPLETED ] / [ FAILED ]
     │
     ▼
[ CANCELLED ] / [ EXPIRED ]
```

### State Definitions:
* `QUEUED`: Enqueued in BullMQ and awaiting an available worker slot.
* `RUNNING`: Actively executing steps in the worker process.
* `WAITING_FOR_USER`: Paused awaiting structured user form inputs (e.g. selecting which Facebook Page to connect).
* `WAITING_FOR_APPROVAL`: Blocked at a human-in-the-loop checkpoint awaiting administrative authorization.
* `COMPLETED`: Verified completion of all required operations.
* `FAILED`: Execution terminated due to a fatal or exhausted retry error; reserved credits refunded.
* `CANCELLED`: Interrupted by user request.

---

## 3. Idempotency & Recovery

To prevent duplicate charges, posts, or stock adjustments:
* Each task generates a unique `idempotencyKey` formatted as `mascot_{capabilityId}_{timestamp}`.
* Subtasks record checkpoints with timestamp, processed count, and completion verification.
* In the event of a worker crash or server reboot, the task worker resumes from the last verified checkpoint rather than restarting from step one.

---

## 4. AI Credit Safeguards

* **Reservation:** Before enqueuing a task, credits are reserved using `creditLedger.reserveCredits()`.
* **Finalization:** Upon successful task completion, actual credits consumed are finalized.
* **Automatic Refund:** If a task fails fatally, encounters rate limits, or is cancelled, `creditLedger.refundCredits()` is called immediately to restore the store's balance.
