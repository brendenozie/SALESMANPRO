# SalesmanPro — Incremental Offline POS Implementation Plan

> **Document Version:** 1.0.0  
> **Status:** Execution Roadmap  
> **Target Subsystems:** Core Platform, Shared POS Engine, StorePOS, ServicePOS, FitnessPOS  

---

## 1. Incremental Execution Philosophy

Offline POS capability is introduced **additively without destabilizing existing online commerce, payment webhooks, or store checkout routes**. Each phase delivers an independently testable vertical slice that functions alongside the existing online codebase.

```text
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8
 Audit       Engine      Catalog     Cash POS    Inventory    Category     Payment     Admin      Hardening
 Done      Foundation     Sync       Checkout    Reconcile      POS        Auditing    Control     & Chaos
```

---

## 2. Detailed Phase Breakdown

### Phase 0 — Architecture Audit & Invariants (COMPLETED)
* **Goals:** Trace canonical services, establish offline boundaries, determine persistent storage, author architecture specifications.
* **Deliverables:**
  * `docs/offline/OFFLINE_POS_ARCHITECTURE.md`
  * `docs/offline/OFFLINE_DATA_MODEL.md`
  * `docs/offline/OFFLINE_SYNC_PROTOCOL.md`
  * `docs/offline/OFFLINE_CONFLICT_STRATEGY.md`
  * `docs/offline/OFFLINE_PAYMENT_RULES.md`
  * `docs/offline/OFFLINE_SECURITY_MODEL.md`
  * `docs/offline/OFFLINE_DEVICE_MODEL.md`
  * `docs/offline/OFFLINE_TEST_PLAN.md`
  * `docs/offline/OFFLINE_IMPLEMENTATION_PLAN.md`
* **Completion Object:** Complete architectural sign-off and system mapping.

---

### Phase 1 — Shared POS Offline Engine Foundation
* **Goals:** Implement client persistence abstraction, outbox transaction journal, connectivity manager, and server heartbeat endpoints.
* **Tasks:**
  1. Define pure TypeScript models in `types/pos-offline.ts`.
  2. Implement client IndexedDB storage manager with object stores and compound indexes in `lib/pos/offline/storage/storageManager.ts`.
  3. Implement append-only Outbox Transaction Journal in `lib/pos/offline/journal/transactionJournal.ts`.
  4. Implement Connectivity Manager with multi-state tracking (`ONLINE`, `DEGRADED`, `OFFLINE`, `SYNCING`) and latency probes in `lib/pos/offline/connectivity/connectivityManager.ts`.
  5. Implement server heartbeat endpoint `GET /api/pos/health`.
  6. Author unit tests verifying journal durability and crash recovery.
* **Completion Object:** Local terminal can store, query, and persist outbox mutations across simulated browser reboots with accurate connectivity telemetry.

---

### Phase 2 — Offline Catalog & Incremental Delta Sync
* **Goals:** Replicate store catalog, categories, customer list, and pricing matrices to IndexedDB with cursor-based incremental updates.
* **Tasks:**
  1. Create server-side delta pull route `GET /api/pos/sync/pull` supporting revision cursors.
  2. Implement client catalog synchronization worker in `lib/pos/offline/sync/posCatalogSync.ts`.
  3. Implement local high-speed indexed search across products, SKUs, and barcodes.
  4. Cache active operator PIN hashes and permission snapshots.
* **Completion Object:** Cashier can search full store catalog and identify customers with 0ms network latency even when disconnected.

---

### Phase 3 — Offline Cash POS Checkout (Vertical Slice)
* **Goals:** Enable complete offline cash transactions: cart, discount calculation, local order creation, deterministic receipt numbering, local ESC/POS print, and push sync to canonical `centralizedCreateOrder.ts`.
* **Tasks:**
  1. Implement offline checkout handler in `lib/pos/offline/orders/offlineOrderService.ts`.
  2. Implement deterministic receipt generator (`RCP-T01-YYYYMMDD-XXXX`).
  3. Implement batch sync push client in `lib/pos/offline/sync/posSyncClient.ts` with exponential backoff and circuit breaker.
  4. Implement server sync endpoint `POST /api/pos/sync` delegating to canonical `createOrder` with idempotency validation.
  5. Build React context `POSOfflineContext.tsx` and hook `usePOSOffline.ts`.
* **Completion Object:** Cashier completes cash sale offline, prints receipt; upon reconnect, order syncs to MongoDB without human intervention and displays `SYNCED`.

---

### Phase 4 — Inventory Reconciliation & Overselling Policy
* **Goals:** Implement hybrid stock reconciliation allowing physical sales to proceed under negative stock conditions while logging audited discrepancies.
* **Tasks:**
  1. Update `lib/orders/centralizedCreateOrder.ts` to support offline POS reconciliation mode (decrements stock, permits negative stock when tenant allows, logs `OVER_SOLD_AUDIT`).
  2. Create inventory movement audit records in `prisma.stockMovement`.
  3. Add negative stock and price variance indicators to Admin Inventory Dashboard.
* **Completion Object:** Concurrent offline terminals selling the same SKU do not crash or reject sales; stock decrements cleanly into negative values and alerts managers.

---

### Phase 5 — Category POS Integration
* **Goals:** Integrate the Shared POS Offline Engine into StorePOS, ServicePOS, and FitnessPOS without duplicating offline logic.
* **Tasks:**
  1. Wire `usePOSOffline` into `StorePOSPageClient.tsx`.
  2. Wire `usePOSOffline` into ServicePOS (`app/admin/[slug]/service-pos/AdminPOSClient.tsx`) with offline appointment slot caching.
  3. Wire `usePOSOffline` into FitnessPOS (`app/admin/[slug]/fitness-pos/PosClient.tsx`) with member attendance check-in.
  4. Display visual connectivity status badge and pending sync counter across all category POS headers.
* **Completion Object:** All three category POS interfaces operate seamlessly offline using the shared engine.

---

### Phase 6 — Payment Auditing & Tender Separation
* **Goals:** Enforce strict tender safety: auto-disable M-Pesa STK push and online card gateways when offline, provide manual reference code input with audit flags.
* **Tasks:**
  1. Update payment selection modals to observe connectivity state.
  2. Add manual M-Pesa transaction reference and card terminal approval code input fields.
  3. Implement cashier shift X-Report and Z-Report drawer reconciliation with cash variance calculations.
* **Completion Object:** Cashiers cannot accidentally initiate failed online payment calls while offline; manual tenders are safely audited.

---

### Phase 7 — Device Management & Revocation Console
* **Goals:** Provide administrators full observability of registered POS terminals, sync outbox queues, conflicts, and remote revocation.
* **Tasks:**
  1. Create Device Registration API `POST /api/pos/device/register`.
  2. Build Admin Device Console at `/admin/[slug]/pos-devices`.
  3. Implement device revocation endpoint and remote wipe client execution.
* **Completion Object:** Admins can view terminal health, queue backlog, and instantly revoke compromised hardware.

---

### Phase 8 — Hardening, Performance & Chaos Testing
* **Goals:** Run end-to-end chaos tests simulating lost responses, flaky Wi-Fi, browser crashes, and high-volume offline checkouts.
* **Tasks:**
  1. Author comprehensive automated test suite `tests/pos-offline-engine.test.ts`.
  2. Verify zero duplicate orders under retried HTTP requests.
  3. Validate storage persistence quotas and memory consumption.
* **Completion Object:** 100% test pass rate across all failure scenarios.
