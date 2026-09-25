# SalesmanPro — Offline Conflict Resolution Strategy

> **Document Version:** 1.0.0  
> **Status:** Authoritative Conflict Resolution Specification  
> **Target Subsystems:** Sync Engine, Inventory Reconciliation, Financial Audit Ledgers  

---

## 1. Conflict Philosophy & Guiding Tenet

> **A completed physical retail sale cannot be undone by a database rollback.**

If a cashier has handed physical goods to a customer, taken cash, and printed an offline receipt, a downstream database constraint (such as "Price Changed" or "Stock is 0") **must never silently discard the completed order**. 

Instead, SalesmanPro follows an **authoritative financial capture + exception reconciliation pattern**:
1. The financial and legal transaction is **accepted as an immutable fact**.
2. Any business discrepancies (price differences, negative inventory, customer duplicate) are flagged as **Audited Operational Variations**.
3. Manager review queues provide administrative tools to inspect, reconcile, or adjust accounts without corrupting the store's financial books.

---

## 2. Comprehensive Conflict Matrix

| Conflict Scenario | Resolution Action | Detailed Mechanism | Customer Impact | Accounting / Financial Impact |
| :--- | :---: | :--- | :--- | :--- |
| **Product Price Changed** (e.g. Price was $10 when offline POS sold item, server updated to $12) | **LOCAL WINS (Honor Sale Price)** | Server records the order at the price paid ($10). Attaches an audit flag `PRICE_DISCREPANCY` with `historicalPrice: 10, currentPrice: 12`. | Zero. Customer was charged $10 as quoted. | Recorded as $10 revenue with $2 price variance variance expense for P&L tracking. |
| **Product Deleted on Server** (Catalog manager deleted SKU while terminal was offline) | **AUTO RESOLVE (Archive SKU)** | Order is accepted. The deleted listing is linked via snapshot metadata (name, SKU, price). Inventory ledger records the deduction against the archived SKU. | Zero. Customer received goods. | Revenue posted normally. |
| **Inventory Exhausted (Oversold)** (POS A sells 8, POS B sells 8, server stock was 10) | **LOCAL WINS + NEGATIVE STOCK** | Server decrements stock from 10 to -6. Flags inventory status as `NEGATIVE_STOCK_AUDIT`. Prompts warehouse restock alert. | Zero. Goods were physically handed to customer. | Cost of Goods Sold (COGS) calculated at last known supplier purchase cost. |
| **Tax Rate Changed** (Store tax changed from 16% to 18% during disconnection) | **LOCAL WINS (Honor Receipt)** | Server preserves the tax collected on the printed receipt (16%). Records `TAX_VARIATION` audit record. | Zero. Matches physical receipt. | Complies with tax authority rules honoring fiscalized receipt totals. |
| **Customer Created Offline on Multiple Terminals** (Same phone/email registered on Terminal A and B) | **MERGE (Deduplicate)** | Server matches existing user by phone/email (`lib/pos/posCustomerService.ts`). Links both offline orders to the single unified customer profile. | Zero. Customer history correctly aggregates. | Clean CRM records without duplicates. |
| **Staff Permission Revoked** (Operator was demoted while terminal was offline) | **AUTO RESOLVE (Attributed)** | Orders created during the offline session are accepted under the operator's active lease. The device is instructed to terminate the operator's offline session immediately upon reconnect. | Zero. Past sales remain valid. | Audit log shows timestamp of revocation vs timestamp of offline sale. |
| **Service Slot Double-Booked** (ServicePOS booked 2:00 PM haircut, online user booked same slot) | **MANAGER REVIEW** | Order and payment are recorded. Appointment is marked `TENTATIVE_OVERBOOKED`. Manager receives an instant notification to reassign stylist or notify customer. | Service salon handles via staff reassignment. | Service fee collected and accounted. |
| **Discount Rule Removed** (Promo code expired while offline) | **LOCAL WINS** | Offline discount honored as applied by cashier within their authorized role threshold. | Zero. Customer receives agreed discount. | Discount expense recorded on store P&L. |
| **Store Disabled / Suspended** (Tenant subscription lapsed) | **BLOCK & QUARANTINE** | Orders from the offline device are placed in `QUARANTINE_REVIEW`. No customer data is lost, but transaction does not post to live bank/payout ledgers until account is unblocked. | Transparent to customer (cash received). | Preserved in database; pending admin release. |
| **Device Revoked by Admin** (Stolen terminal reported) | **BLOCK & REJECT** | Server rejects sync payload with `403 FORBIDDEN (DEVICE_REVOKED)`. Command sent to purge local storage. | Cash collected offline must be audited manually by management. | Unsynced transactions held in quarantine table for forensic review. |

---

## 3. Inventory Reconciliation & Concurrency Policy

SalesmanPro adopts **Strategy D: Hybrid Immutable Ledger + Controlled Negative Inventory Policy**.

```text
                           INVENTORY DEDUCTION WORKFLOW
                                        │
                         Server receives Synced Order
                                        │
                         Find Listing & InventoryItem
                                        │
                           Current Stock >= Quantity?
                                  ┌─────┴─────┐
                                  ▼           ▼
                                 YES          NO
                                  │           │
                          Decrement Stock     │
                          Status: OK          │
                                              ▼
                                 Tenant allows Negative Stock?
                                 (Default: TRUE for Physical POS)
                                        ┌─────┴─────┐
                                        ▼           ▼
                                       YES          NO
                                        │           │
                          Stock becomes NEGATIVE    │
                          Flag: OVER_SOLD_AUDIT     │
                          Create Restock Alert      │
                                        │           ▼
                                        │   Reject Order Line Item?
                                        │   NEVER for Cash Retail!
                                        │   Fallback: Post to
                                        │   "Unallocated Stock Pool"
                                        ▼           ▼
                               Record in StockMovement Ledger
```

### Invariants for Stock Management

1. **Physical Reality Trumps Virtual Counters:** If an item was physically scanned and carried out of a physical storefront, the system cannot pretend the transaction did not occur because a number in a database is zero.
2. **Negative Stock Visibility:** Negative stock alerts appear on the Store Inventory Dashboard in red with explicit terminal attribution:
   `"Item X is at -6 units (Oversold by Terminal T01 & T02 during offline operation on 2026-09-25)"`.
3. **Restock Auto-Correction:** When a new purchase order or stock intake is logged (e.g. +50 units), the inventory increments from -6 to +44, maintaining perfect ledger continuity.

---

## 4. Manager Conflict Resolution Dashboard

All conflicts requiring human inspection are queryable via `/api/pos/conflicts` and displayed on the SalesmanPro Admin Orders & POS HQ:

```text
POS Conflict Management Console
-------------------------------------------------------------------------------------------------
ID         Terminal   Time      Conflict Type           Details                  Actions
-------------------------------------------------------------------------------------------------
CONF-101   T01        12:44     STOCK_EXHAUSTED         Wheat Flour 2kg (-4)     [Dismiss / Restocked]
CONF-102   T02        13:10     PRICE_DISCREPANCY       Milk 500ml ($1.00 vs $1.20) [Accept Variance]
CONF-103   T01        14:02     DOUBLE_BOOKED_SERVICE   Hair styling 3:00 PM     [Reassign Staff]
-------------------------------------------------------------------------------------------------
```
