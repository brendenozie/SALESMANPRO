# SalesmanPro — Offline-Capable POS Architecture Strategy

> **Document Version:** 1.0.0  
> **Status:** Approved Architecture Specification  
> **Target Subsystems:** StorePOS, ServicePOS, FitnessPOS, HealthPOS, Universal Category POS  
> **Primary Maintainer:** Principal Architecture & Platform Engineering  

---

## 1. Executive Purpose & Strategic Philosophy

SalesmanPro is fundamentally an **online-first, multi-tenant cloud commerce platform** powered by Next.js App Router, Prisma ORM, MongoDB, Redis, and BullMQ. In retail stores, wellness spas, gyms, automotive workshops, and field counters across emerging and developing markets, internet connectivity is frequently slow, intermittent, or completely severed for minutes or hours at a time.

```text
                               SALESmanPRO CLOUD
                    ┌─────────────────────────────────────┐
                    │ MongoDB / Prisma System of Record    │
                    │ Canonical Business Logic Layer      │
                    │   • centralizedCreateOrder.ts       │
                    │   • processOrderPayment.ts          │
                    │   • posSessionService.ts            │
                    │   • posCustomerService.ts           │
                    │ Financial Ledgers & Auditing        │
                    │ Redis / BullMQ Task Cluster         │
                    └──────────────────┬──────────────────┘
                                       │
                        Secure Offline Sync Protocol
                          (HTTPS / Push-Pull / HMAC)
                                       │
             ┌─────────────────────────┴─────────────────────────┐
             │                                                   │
      STORE POS TERMINAL A                                STORE POS TERMINAL B
┌───────────────────────────────┐                   ┌───────────────────────────────┐
│ Client UI (Store/Service/Fit) │                   │ Client UI (Store/Service/Fit) │
│               ↓               │                   │               ↓               │
│   Shared POS Offline Engine   │                   │   Shared POS Offline Engine   │
│   ┌─────────────────────────┐ │                   │   ┌─────────────────────────┐ │
│   │ Connectivity Manager    │ │                   │   │ Connectivity Manager    │ │
│   │ Local Operational DB    │ │                   │   │ Local Operational DB    │ │
│   │ Offline Transaction Out │ │                   │   │ Offline Transaction Out │ │
│   │ Sync Engine & Backoff   │ │                   │   │ Sync Engine & Backoff   │ │
│   │ Conflict Resolution     │ │                   │   │ Conflict Resolution     │ │
│   └─────────────────────────┘ │                   │   └─────────────────────────┘ │
│ Hardware: Barcode, ESC/POS    │                   │ Hardware: Barcode, ESC/POS    │
└───────────────────────────────┘                   └───────────────────────────────┘
```

### Core Invariants & Architecture Tenets

1. **The Server Remains Authoritative:** The local device is never the permanent system of record. The cloud database holds authoritative financial, inventory, user, and tenant state. The local terminal is a **durable, autonomous operational edge replica**.
2. **Zero Duplicated Business Logic:** The local terminal does not maintain an independent "Offline Order Service" that duplicates pricing algorithms, tax tables, and inventory rules. When an offline transaction syncs, it passes through the **identical canonical server-side business services** (`centralizedCreateOrder.ts`, `processOrderPayment.ts`) used by online operations.
3. **No Lost Transactions:** Every offline action is committed to an append-only, crash-proof local transaction journal before user feedback is displayed. If the browser tab crashes, the OS restarts, or power cuts occur, uncommitted transactions survive and resume synchronization on boot.
4. **Absolute Financial & Payment Truth:** An offline device can safely complete cash payments and approved credit/split manual tenders. It **never fabricates or claims success** for online-dependent payment rails (M-Pesa STK push, card gateway tokens, Paystack, Stripe) while offline.
5. **Universal Category Reusability:** StorePOS (products/variants), ServicePOS (bookings/slots/staff), FitnessPOS (memberships/classes), and future category terminals consume a **single, unified Shared POS Offline Engine**.

---

## 2. Comprehensive Capability Matrix & Offline Boundary

Every feature across SalesmanPro POS terminals has been evaluated against connectivity constraints:

| Capability | Online | Poor Network | Offline | Requires Sync | Requires Server | Local Data Required | Offline Behavior | Conflict Strategy |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| **POS Login / Session** | YES | YES | YES | YES | NO (if cached) | Operator PIN hash, salt, permissions snapshot, active session token | Validates PIN against local credential snapshot; grants operational lease up to max duration (12h) | Lease expiration forces re-auth upon reconnect |
| **Product Catalog** | YES | YES | YES | NO | NO | LocalProduct, LocalVariant, LocalCategory, LocalPrice | Instant full-text search from local IndexedDB replica | Server wins on revision update |
| **Search Products** | YES | YES | YES | NO | NO | IndexedDB multi-field indexes (name, SKU, barcode, tags) | In-memory / indexed search without network latency | N/A (read-only) |
| **Customer Lookup** | YES | YES | YES | NO | NO | LocalCustomer cache (ID, name, phone, email, notes, balance) | Local prefix match on phone and name; falls back to "Walk-in" if not cached | N/A (read-only) |
| **Create Customer** | YES | YES | YES | YES | NO | Local UUID, temporary client ID, name, phone, email | Generates local client entity, assigns temporary ID, queues for server upsert | Phone/email deduplication on server; merges orders |
| **Cart Operations** | YES | YES | YES | NO | NO | LocalCart state in persistent storage | Instant additions, discounts, quantities, variant adjustments | Local wins |
| **Create Sale / Order** | YES | YES | YES | YES | NO | LocalOrder, LocalOrderItem, local sequence counter | Creates immutable local order record, writes to Transaction Journal | Canonical server creation via idempotency key |
| **Apply Discount** | YES | YES | YES | YES | NO | Operator permission matrix, max discount threshold | Allows discount within operator's local permission limit | Validated against operator limits upon sync |
| **Inventory Deduction** | YES | YES | YES | YES | NO | LocalInventorySnapshot | Decrements local operational stock; records stock mutation delta in outbox journal | Hybrid reconciliation (ledger movements + negative stock allowance) |
| **Receipt Generation** | YES | YES | YES | NO | NO | Store metadata, receipt template, currency, tax info | Immediately generates HTML and ESC/POS raw bytes with local offline receipt number | Local receipt persists; server order ID attached on sync |
| **Print Receipt** | YES | YES | YES | NO | NO | WebUSB, WebView2 IPC, or browser print iframe | Direct physical dispatch to thermal printer | Hardware error queuing |
| **Cash Payment** | YES | YES | YES | YES | NO | Cash tender amount, change due calculation | Fully completes transaction offline, moves cart to local completed state | Server acknowledges and posts to cash ledger |
| **M-Pesa STK Push** | YES | NO | NO | YES | YES | None | **BLOCKED:** Disabled in UI when offline; requires real-time Daraja API callback | Requires server-to-Safaricom network path |
| **Manual M-Pesa Code** | YES | YES | YES | YES | NO | Transaction code input, customer phone | Operator visually verifies SMS on customer phone; records code for back-office reconciliation | Flagged for audit if code duplicate exists on server |
| **Card (Online Gateway)** | YES | NO | NO | YES | YES | None | **BLOCKED:** Disabled in UI when offline | Server gateway tokenization required |
| **Card (Standalone Terminal)** | YES | YES | YES | YES | NO | Terminal auth code, reference number | Operator enters external POS approval code; recorded as manual card tender | Server records transaction reference |
| **Refunds** | YES | NO | NO | YES | YES | Original order record | **BLOCKED offline:** Prevents fraudulent cash extraction without central audit | Must verify central order status & previous refund ledger |
| **Service Booking** | YES | YES | YES | YES | NO | LocalServices, LocalStaff, daily appointment schedule | Books local slot; marks staff as tentatively engaged; queues booking mutation | Auto-resolves unless slot double-booked; manager review if conflict |
| **Fitness Membership** | YES | YES | YES | YES | NO | LocalMemberships snapshot, member check-in history | Checks in active members against local snapshot; logs offline attendance | Server reconciles scan logs; flags expired memberships |
| **End-of-Day Reports** | YES | YES | YES | NO | NO | Local session ledger, cash counts | Generates local X-Report / Z-Report for active terminal shift | Reconciled against cloud reports when all terminals sync |
| **Stock Restock / Transfer** | YES | NO | NO | YES | YES | Full inventory ledger | **BLOCKED offline:** Back-office administrative tasks require central consistency | Server authoritative only |
| **Product Management** | YES | NO | NO | YES | YES | None | **BLOCKED offline:** Admin operations require central consistency | Server authoritative only |
| **Staff Management** | YES | NO | NO | YES | YES | None | **BLOCKED offline:** Role assignments and security rights require central DB | Server authoritative only |
| **AI Features** | YES | NO | NO | NO | YES | None | Disabled offline; returns helpful "Requires Internet" prompt | Stateless cloud API |
| **WhatsApp Notifications** | YES | YES | YES | YES | YES | None | Sale completes offline; receipt SMS/WhatsApp queued on server upon sync | Triggered automatically when server receives synced order |

---

## 3. High-Level Engine Architecture

The **Shared POS Offline Engine** abstracts all network, persistence, synchronization, and conflict handling away from individual category POS interfaces:

```text
                   ┌─────────────────────────────────────────┐
                   │    Category POS UI Presentation Tier    │
                   │  StorePOS   │  ServicePOS  │ FitnessPOS │
                   └────────────────────┬────────────────────┘
                                        │
                   ┌────────────────────▼────────────────────┐
                   │     POS Operational Domain Facade       │
                   │ (Cart, Checkout, Customer, Shift, Print)│
                   └────────────────────┬────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌───────────────────────────┐                             ┌───────────────────────────┐
│     Online Repository     │                             │     Local Repository      │
│  • Direct Next.js fetch   │                             │  • IndexedDB / SQLite     │
│  • Real-time STK pushes   │                             │  • Local CRUD operations  │
│  • Instant server pricing │                             │  • Offline search index   │
└──────────┬────────────────┘                             └─────────────┬─────────────┘
           │                                                            │
           │                     ┌──────────────────────────────────────┘
           │                     ▼
           │        ┌───────────────────────────┐
           │        │    Transaction Journal    │
           │        │ (Durable Outbox Queue)    │
           │        │   • PENDING               │
           │        │   • SYNCING               │
           │        │   • SYNCED / CONFLICT     │
           │        └────────────┬──────────────┘
           │                     │
           ▼                     ▼
┌───────────────────────────────────────────────┐
│             Sync Engine Orchestrator          │
│  • Exponential Backoff & Circuit Breaker      │
│  • Dependency DAG Resolver                    │
│  • Idempotency Header Generation              │
│  • Push (Outbox Journal) & Pull (Revisions)   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              Connectivity Manager             │
│  • Tiered State: ONLINE / DEGRADED / OFFLINE  │
│  • Periodic Heartbeat to /api/pos/health      │
│  • Request latency & error window tracking   │
└───────────────────────────────────────────────┘
```

---

## 4. Client Platform Compatibility & Persistence Evaluation

SalesmanPro POS clients run across three distinct deployment environments:

1. **Modern Web Browser (Chrome / Edge / Safari / Firefox):** Staff accessing `/admin/[slug]/storepos` on desktop PCs, laptops, and tablets.
2. **Progressive Web App (PWA):** Installed to home screen on Android tablets and touch terminals with offline service worker asset caching.
3. **Windows Desktop App (.NET 8 WPF + WebView2):** Packaged executable with direct ESC/POS USB thermal printer and cash drawer serial communication.

### Storage Technology Evaluation

| Technology | Durability | Transaction Support | Concurrent Writes | Storage Capacity | Search Speed | Browser / OS Support | Recommendation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **IndexedDB (via Dexie / idb)** | High | Yes (ObjectStore transactions) | Tab-level locks | > 1 GB (eviction quota) | Sub-10ms with composite indexes | 100% Modern Web, PWA, WebView2 | **PRIMARY RECOMMENDATION for all Web & WebView2 clients** |
| **SQLite (via OPFS / WASM)** | High | Full ACID | Single writer | > 2 GB | Extremely fast | Good in Chrome/Edge, complex worker setup | Secondary optimization for large catalogs (> 50k SKUs) |
| **LocalStorage** | Low | None | Blocking | 5 MB max | Poor | Universal | **REJECTED:** Insufficient capacity, synchronous, prone to data loss |
| **Native SQLite (.NET Desktop)** | Extreme | Full ACID | Multi-connection | Unlimited | Instantaneous | Windows Desktop only | Optional native cache for desktop shell |

### Explicit Persistence Recommendation

* **Unified Client Persistent Layer:** **IndexedDB** using a structured typed schema abstraction (`storageManager.ts`). It runs natively inside all modern browsers, PWAs, Android WebViews, and Windows WPF WebView2 with zero native binary compilation dependencies.
* **Database Name:** `salesmanpro_pos_db_{companyId}_{storeId}`
* **Encryption at Rest:** Sensitive auth tokens and operator keys stored in IndexedDB are encrypted using AES-GCM-256 with an ephemeral key derived from the operator's offline PIN and device binding salt.

---

## 5. Offline Operation Request Strategy

To maximize responsiveness without sacrificing data integrity, requests are divided into three operational strategies:

```text
                  REQUEST INCOMING FROM POS UI
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     [Read Operation]                     [Write Operation]
(Catalog, Customers, Prices)           (Checkout, Customer Create)
            │                                     │
      LOCAL-FIRST                                 │
Instant Local DB Query                            │
            │                                     │
   Display to User                                │
            │                                     │
   Background Refresh                             │
   (if ONLINE / DEGRADED)                         │
                                                  │
                      ┌───────────────────────────┴───────────────────────────┐
                      ▼                                                       ▼
            [Offline-Safe Write]                                    [Online-Only Write]
            (Cash Sale, Create Cust)                                (STK Push, Card, Refund)
                      │                                                       │
                 LOCAL-FIRST                                             SERVER-FIRST
           Commit to Local Journal                                  Direct Server Mutation
                      │                                                       │
           Generate Offline Receipt                                      Success?
                      │                                                ┌──────┴──────┐
             Prompt Cash Drawer                                        ▼             ▼
                      │                                               YES            NO
           Sync Engine Outbox Push                                   Update UI    Display Error
           (Background Asynchronous)                                              (No offline fallback)
```

1. **Local-First (Read):** Product catalog, categories, pricing matrices, and customer lists read directly from IndexedDB in < 5ms. Background pull updates local records incrementally.
2. **Local-First (Offline-Safe Write):** Cash checkouts, offline bookings, and local customer creations commit to IndexedDB and local transaction journal immediately. The UI reports completion, prints the receipt, and signals the sync engine.
3. **Server-First (Online-Only Write):** Card payments, M-Pesa STK push requests, and refund authorizations require synchronous cloud API validation. If the terminal is in `DEGRADED` or `OFFLINE` status, the UI proactively disables these buttons with an informative tooltip.
