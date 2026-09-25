# SalesmanPro — Offline POS Test Plan & Quality Assurance

> **Document Version:** 1.0.0  
> **Status:** Authoritative Test Plan  
> **Target Subsystems:** Test Automation, Chaos Network Simulation, Failure Scenarios  

---

## 1. Quality Assurance Objective

The test harness must validate that SalesmanPro POS terminals remain rock-solid under realistic retail chaos. Testing cannot merely simulate `wifi.off() -> sell() -> wifi.on()`. It must execute high-stress edge cases, corrupted packets, lost responses, and abrupt power terminations.

---

## 2. Failure Condition Test Matrix

| ID | Test Scenario | Chaos Vector | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **TC-NET-01** | **The Lost Response** | Server creates order in DB, then connection drops before response reaches POS. | POS retries with identical `idempotencyKey`. Server returns existing order without creating a duplicate. | Zero duplicate orders; single inventory decrement; status becomes `SYNCED`. |
| **TC-NET-02** | **Intermittent Network Flapping** | Network drops every 3 seconds with 2000ms latency. | Connectivity manager shifts to `DEGRADED`. Outbox uses exponential backoff and circuit breaker. | No UI freezes; checkout completes instantly locally. |
| **TC-NET-03** | **Cloud Outage (HTTP 500 / 503)** | `/api/pos/sync` returns HTTP 503 Service Unavailable for 30 minutes. | Terminal remains in offline mode. Orders continue queueing in local journal. | All offline orders persist; synced cleanly when 503 resolves. |
| **TC-DEV-01** | **Browser Crash Post-Print** | Browser process forcefully killed immediately after ESC/POS print command. | Upon browser restart, uncommitted transaction is recovered from IndexedDB journal. | Unsynced sale detected on boot; sync auto-resumes. |
| **TC-DEV-02** | **Full Page Refresh During Cart** | F5 / Refresh pressed while customer is building 10-item cart. | Active cart is restored from persistent storage. | Zero items lost from cart. |
| **TC-TX-01** | **Dependency Chain Ordering** | Customer Created offline -> Order placed for customer -> Shift closed. | Synced in strict DAG order. Customer server ID remapped into Order payload before Order syncs. | Order on server correctly references newly created customer. |
| **TC-TX-02** | **Partial Batch Failure** | Batch of 10 orders contains 1 invalid SKU and 9 valid orders. | Server processes the 9 valid orders, flags the 1 invalid order as `REQUIRES_REVIEW`. | 9 orders marked `SYNCED`; 1 marked `CONFLICT`. Valid sales not blocked. |
| **TC-BIZ-01** | **Concurrent Overselling** | Server stock = 5. Terminal A sells 4 offline. Terminal B sells 4 offline. Both sync. | Both orders accepted. Final stock = -3. Over-sold alert triggered on admin dashboard. | No customer sales discarded; negative inventory recorded accurately. |
| **TC-BIZ-02** | **Price Increased While Offline** | Item price $10.00 increased on server to $15.00. Terminal A sells at $10.00. | Server honors $10.00 sale price from physical receipt. Audit record records $5.00 price variance. | Customer charged correctly; financial reports balance. |
| **TC-SEC-01** | **Cross-Tenant Isolation** | Terminal configured for Company A attempts to sync orders with Company B IDs. | Server rejects payload with `403 FORBIDDEN`. Operation quarantined. | Zero cross-tenant data contamination. |
| **TC-SEC-02** | **Device Revocation While Offline** | Admin revokes Terminal T01. Terminal operates offline for 2 hours, then reconnects. | Sync returns `403 DEVICE_REVOKED`. Terminal immediately triggers remote wipe. | Local storage wiped; terminal locked out. |

---

## 3. Automated Chaos Test Suite Commands

Unit and integration tests for the offline POS engine are run using Node's native test runner and tsx:

```bash
# Run POS Concurrency and Idempotency tests
npx tsx tests/pos-checkout-concurrency.test.ts

# Run POS Session, Customer and Offline Replay tests
npx tsx tests/pos-session-customer.test.ts

# Run Shared POS Offline Engine Test Suite
npx tsx tests/pos-offline-engine.test.ts
```
