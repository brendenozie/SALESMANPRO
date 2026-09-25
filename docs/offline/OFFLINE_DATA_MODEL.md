# SalesmanPro — Offline Data Model Specification

> **Document Version:** 1.0.0  
> **Status:** Authoritative Entity Specification  
> **Target Subsystems:** Shared POS Offline Engine, IndexedDB Object Stores, Prisma Sync Mappers  

---

## 1. Design Principles

1. **Selective Replication:** Only entities strictly necessary for POS checkout, search, operator sessions, and receipts are cached locally. Back-office data (marketing campaigns, AI logs, supplier invoices) is excluded.
2. **Dual-Key Identity Pattern:** Locally created entities possess both a `localId` (UUID v4 generated client-side) and an optional `serverId` (MongoDB ObjectId assigned upon cloud sync).
3. **Immutability of Journal Entries:** Once an offline order or payment is written to the transaction journal, its payload is immutable. Sync engines read and status-update entries, but cannot alter the recorded transactional facts.
4. **Tenant & Store Sandboxing:** Every local record carries `companyId` and `storeId`. Database instances are segregated per tenant (`salesmanpro_pos_db_{companyId}_{storeId}`).

---

## 2. Entity Schema Specifications

### 2.1 Configuration & Terminal Identity

#### `LocalPOSDevice`
* **Source of Truth:** Server (Registration) / Local (State)
* **Local Identifier:** `deviceId` (UUID persisted in device storage)
* **Server Identifier:** `id` (Prisma ObjectId)
* **Tenant / Store:** `companyId`, `storeId`
* **Fields:**
  * `deviceId`: `string` (e.g. `DEV-NAI-01-A79F`)
  * `deviceName`: `string`
  * `terminalCode`: `string` (e.g. `T01`)
  * `hardwareFingerprint`: `string` (SHA-256 of browser/platform tokens)
  * `registeredAt`: `string` (ISO date)
  * `status`: `"ACTIVE" | "PENDING_ACTIVATION" | "REVOKED"`
  * `lastHeartbeatAt`: `string`
  * `syncCursor`: `number` (Latest revision acknowledged from cloud)
  * `offlineToken`: `string` (Encrypted JWT lease)
  * `offlineExpiresAt`: `string`

#### `LocalCompany` & `LocalStore`
* **Source of Truth:** Server
* **Local / Server ID:** `companyId` / `storeId`
* **Fields:**
  * `id`: `string`
  * `name`: `string`
  * `legalName`: `string`
  * `taxNumber`: `string` (e.g., KRA PIN)
  * `currency`: `string` (e.g., `KES`, `USD`)
  * `currencySymbol`: `string` (e.g., `KSh`, `$`)
  * `address`: `string`
  * `phone`: `string`
  * `email`: `string`
  * `receiptHeader`: `string`
  * `receiptFooter`: `string`
  * `taxRate`: `number` (Default store tax, e.g. 0.16)
  * `allowNegativeStock`: `boolean` (Default: `true` for offline POS)
  * `version`: `number`
  * `updatedAt`: `string`

---

### 2.2 Operator & Session

#### `LocalOperator`
* **Source of Truth:** Server
* **Local ID:** `operatorId` (Matches Prisma `User.id`)
* **Fields:**
  * `id`: `string` (Server User ID)
  * `name`: `string`
  * `email`: `string`
  * `role`: `"CASHIER" | "SUPERVISOR" | "ADMIN" | "AGENT"`
  * `pinHash`: `string` (PBKDF2 / SHA-256 hash of operator 4-6 digit PIN + salt)
  * `pinSalt`: `string`
  * `maxDiscountPercent`: `number` (e.g., 10 for Cashier, 100 for Manager)
  * `canVoidOrders`: `boolean`
  * `canOpenDrawer`: `boolean`
  * `isActive`: `boolean`
  * `updatedAt`: `string`

#### `LocalPOSSession`
* **Source of Truth:** Dual (Initiated locally or server-created)
* **Local ID:** `localSessionId` (UUID)
* **Server ID:** `id` (Prisma `PosSession.id`, nullable until synced)
* **Fields:**
  * `localId`: `string`
  * `serverId`: `string | null`
  * `companyId`: `string`
  * `storeId`: `string`
  * `terminalId`: `string`
  * `operatorId`: `string`
  * `operatorName`: `string`
  * `status`: `"OPEN" | "CLOSED"`
  * `openedAt`: `string`
  * `closedAt`: `string | null`
  * `openingCash`: `number`
  * `closingCash`: `number | null`
  * `expectedCash`: `number`
  * `cashSalesTotal`: `number`
  * `totalTransactions`: `number`
  * `syncState`: `"SYNCED" | "PENDING_SYNC" | "CONFLICT"`
  * `syncError`: `string | null`

---

### 2.3 Catalog, Inventory & Pricing

#### `LocalProduct`
* **Source of Truth:** Server
* **Local / Server ID:** `id` (Prisma `MarketplaceListings.id` or `Product.id`)
* **Fields:**
  * `id`: `string`
  * `companyId`: `string`
  * `name`: `string`
  * `description`: `string | null`
  * `sku`: `string | null`
  * `barcode`: `string | null`
  * `sellingPrice`: `number`
  * `finalPrice`: `number`
  * `taxRate`: `number | null`
  * `categoryId`: `string | null`
  * `categoryName`: `string | null`
  * `isAvailable`: `boolean`
  * `imageUrl`: `string | null`
  * `pricingMode`: `"PRODUCT" | "SERVICE" | "BOOKING"`
  * `trackInventory`: `boolean`
  * `localStockQuantity`: `number` (Adjusted locally as items sell)
  * `serverStockRevision`: `number`
  * `variants`: `LocalProductVariant[]`
  * `updatedAt`: `string`
  * `deletedAt`: `string | null`

#### `LocalProductVariant`
* **Embedded in `LocalProduct`**
* **Fields:**
  * `id`: `string`
  * `name`: `string`
  * `category`: `string` (e.g. "Size", "Color", "Addon")
  * `extraPrice`: `number`
  * `sku`: `string | null`
  * `barcode`: `string | null`

#### `LocalCategory`
* **Source of Truth:** Server
* **Fields:**
  * `id`: `string`
  * `companyId`: `string`
  * `name`: `string`
  * `slug`: `string`
  * `sortOrder`: `number`

#### `LocalInventorySnapshot`
* **Source of Truth:** Server (Baseline) / Local (Operational balance)
* **Fields:**
  * `productId`: `string`
  * `companyId`: `string`
  * `storeId`: `string`
  * `serverConfirmedStock`: `number`
  * `localAllocatedStock`: `number` (Sum of offline sales pending sync)
  * `effectiveStock`: `number` (`serverConfirmedStock - localAllocatedStock`)
  * `lastReconciledAt`: `string`

---

### 2.4 Customers

#### `LocalCustomer`
* **Source of Truth:** Server (Canonical) / Local (Offline additions)
* **Local ID:** `localId` (UUID)
* **Server ID:** `id` (Prisma `User.id`, null if created offline)
* **Fields:**
  * `localId`: `string`
  * `serverId`: `string | null`
  * `companyId`: `string`
  * `name`: `string`
  * `phone`: `string`
  * `email`: `string`
  * `address`: `string | null`
  * `notes`: `string | null`
  * `customerNumber`: `string` (e.g. `CUST-782910` or temporary offline code)
  * `orderCount`: `number`
  * `totalSpent`: `number`
  * `syncState`: `"SYNCED" | "PENDING_CREATE" | "MERGE_REQUIRED"`
  * `createdAt`: `string`
  * `updatedAt`: `string`

---

### 2.5 Orders, Payments & Receipts

#### `LocalOrder`
* **Source of Truth:** Local Device (at creation) → Server (post-sync)
* **Local ID:** `localId` (UUID v4)
* **Server ID:** `id` (Prisma `CustomerOrder.id`, populated after sync)
* **Idempotency Key:** `deviceId:operationId`
* **Fields:**
  * `localId`: `string`
  * `serverId`: `string | null`
  * `companyId`: `string`
  * `storeId`: `string`
  * `deviceId`: `string`
  * `localReceiptNumber`: `string` (e.g. `RCP-T01-20260925-0042`)
  * `trackingNumber`: `string` (Standard `TRK-YYYYMMDD-XXXX`)
  * `localSessionId`: `string`
  * `operatorId`: `string`
  * `cashierName`: `string`
  * `customerLocalId`: `string | null`
  * `customerName`: `string`
  * `customerPhone`: `string`
  * `customerEmail`: `string`
  * `orderType`: `"PRODUCT" | "SERVICE" | "BOOKING"`
  * `orderSource`: `"IN_PERSON"`
  * `paymentOption`: `"cash" | "split" | "manual_card" | "manual_mpesa"`
  * `paymentStatus`: `"COMPLETED" | "PENDING"`
  * `status`: `"PAID" | "PENDING"`
  * `subtotal`: `number`
  * `discountPercent`: `number`
  * `discountAmount`: `number`
  * `taxAmount`: `number`
  * `totalAmount`: `number`
  * `items`: `LocalOrderItem[]`
  * `payments`: `LocalPayment[]`
  * `syncStatus`: `"PENDING" | "SYNCING" | "SYNCED" | "CONFLICT" | "FAILED"`
  * `syncError`: `string | null`
  * `createdAt`: `string` (Client timestamp of actual sale)
  * `syncedAt`: `string | null`

#### `LocalOrderItem`
* **Fields:**
  * `itemId`: `string` (UUID)
  * `marketplaceListingId`: `string`
  * `productId`: `string | null`
  * `name`: `string`
  * `quantity`: `number`
  * `unitPrice`: `number`
  * `extraPrice`: `number`
  * `finalPrice`: `number`
  * `subtotal`: `number`
  * `taxAmount`: `number`
  * `selectedOptions`: `any[] | null`
  * `serviceDate`: `string | null`
  * `serviceTimeSlot`: `string | null`
  * `assignedStaffId`: `string | null`
  * `serviceNotes`: `string | null`

#### `LocalPayment`
* **Fields:**
  * `paymentId`: `string` (UUID)
  * `method`: `"cash" | "manual_card" | "manual_mpesa"`
  * `amount`: `number`
  * `amountReceived`: `number | null` (For cash)
  * `changeDue`: `number | null` (For cash)
  * `referenceCode`: `string | null` (Approval code or SMS reference)
  * `processedAt`: `string`

#### `LocalReceipt`
* **Fields:**
  * `id`: `string` (UUID)
  * `orderLocalId`: `string`
  * `receiptNumber`: `string`
  * `htmlContent`: `string`
  * `escPosBase64`: `string | null`
  * `printedAt`: `string`
  * `printAttempts`: `number`
  * `printStatus`: `"PRINTED" | "FAILED" | "QUEUED"`

---

### 2.6 Outbox Journal & Sync Coordination

#### `LocalTransactionJournal`
* **Source of Truth:** Local Device (Append-only)
* **Fields:**
  * `operationId`: `string` (UUID v4)
  * `deviceId`: `string`
  * `companyId`: `string`
  * `storeId`: `string`
  * `operatorId`: `string`
  * `entityType`: `"ORDER" | "CUSTOMER" | "SESSION_OPEN" | "SESSION_CLOSE" | "STOCK_ADJUSTMENT"`
  * `entityLocalId`: `string`
  * `operationType`: `"CREATE" | "UPDATE" | "CLOSE"`
  * `payload`: `any` (Full JSON payload)
  * `dependencies`: `string[]` (Array of parent `operationId`s that must succeed first)
  * `idempotencyKey`: `string` (`${deviceId}:${operationId}`)
  * `status`: `"PENDING" | "SYNCING" | "SYNCED" | "FAILED" | "CONFLICT"`
  * `attemptCount`: `number`
  * `lastAttemptAt`: `string | null`
  * `nextRetryAt`: `string | null`
  * `errorCode`: `string | null`
  * `errorMessage`: `string | null`
  * `serverRevision`: `number | null`
  * `createdAt`: `string`
  * `syncedAt`: `string | null`

#### `LocalSyncConflict`
* **Fields:**
  * `id`: `string` (UUID)
  * `operationId`: `string`
  * `entityType`: `string`
  * `conflictType`: `"STOCK_EXHAUSTED" | "PRICE_CHANGED" | "CUSTOMER_DUPLICATE" | "DELETED_PRODUCT" | "SESSION_MISMATCH"`
  * `localPayload`: `any`
  * `serverError`: `string`
  * `suggestedResolution`: `"AUTO_RESOLVED" | "MANUAL_REVIEW" | "RETRY_FORCE"`
  * `resolved`: `boolean`
  * `resolvedAt`: `string | null`
  * `resolvedBy`: `string | null`
  * `notes`: `string | null`

---

## 3. IndexedDB Object Stores & Index Definitions

Database Name: `salesmanpro_pos_db_{companyId}_{storeId}` (Version: 1)

```text
Object Stores & Key Paths:
├── devices             [keyPath: deviceId]
├── companies           [keyPath: id]
├── operators           [keyPath: id, indexes: pinHash]
├── sessions            [keyPath: localId, indexes: status, operatorId, syncState]
├── products            [keyPath: id, indexes: barcode, sku, categoryId, name]
├── categories          [keyPath: id, indexes: slug, sortOrder]
├── customers           [keyPath: localId, indexes: phone, email, name, syncState]
├── inventory           [keyPath: productId]
├── orders              [keyPath: localId, indexes: syncStatus, createdAt, customerLocalId, localReceiptNumber]
├── receipts            [keyPath: id, indexes: orderLocalId, receiptNumber]
├── journal             [keyPath: operationId, indexes: status, createdAt, entityType, nextRetryAt]
└── conflicts           [keyPath: id, indexes: operationId, resolved]
```
