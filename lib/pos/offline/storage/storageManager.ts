/**
 * lib/pos/offline/storage/storageManager.ts
 *
 * Universal Persistent Storage Layer for SalesmanPro Shared POS Offline Engine.
 * Implements native IndexedDB in browser, PWA, Android WebView, and WebView2 desktop environments,
 * with native SQLite mirroring via AndroidBridge / chrome.webview when running inside native shells,
 * and an in-memory concurrent fallback for Node.js test runners and SSR execution.
 */

import type {
  LocalProductRecord,
  LocalCustomerRecord,
  LocalOrderRecord,
  LocalReceiptRecord,
  LocalPOSSessionRecord,
  LocalExpenseRecord,
  LocalInventoryMovementRecord,
  LocalSyncMetadataRecord,
  JournalOperationItem,
  JournalOperationStatus,
} from "@/types/pos-offline";

const DB_VERSION = 2;

class InMemoryStore {
  private stores: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.stores.set("products", new Map());
    this.stores.set("orders", new Map());
    this.stores.set("receipts", new Map());
    this.stores.set("customers", new Map());
    this.stores.set("journal", new Map());
    this.stores.set("sessions", new Map());
    this.stores.set("device", new Map());
    this.stores.set("expenses", new Map());
    this.stores.set("inventory_movements", new Map());
    this.stores.set("sync_meta", new Map());
  }

  async put(storeName: string, key: string, val: any): Promise<void> {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Map());
    }
    this.stores.get(storeName)!.set(key, val);
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    const store = this.stores.get(storeName);
    return (store?.get(key) as T) || null;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = this.stores.get(storeName);
    return store ? Array.from(store.values()) : [];
  }

  async delete(storeName: string, key: string): Promise<void> {
    const store = this.stores.get(storeName);
    store?.delete(key);
  }

  async clear(storeName: string): Promise<void> {
    const store = this.stores.get(storeName);
    store?.clear();
  }
}

function mirrorToNativeShell(type: string, payload: any): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as any;
    if (w.AndroidBridge && typeof w.AndroidBridge.postMessage === "function") {
      w.AndroidBridge.postMessage(JSON.stringify({ type, payload }));
    } else if (w.chrome?.webview && typeof w.chrome.webview.postMessage === "function") {
      w.chrome.webview.postMessage({ type, payload });
    }
  } catch {
    // Non-blocking native mirror
  }
}

export class POSStorageManager {
  private companyId: string;
  private storeId: string;
  private dbName: string;
  private memoryFallback: InMemoryStore | null = null;
  private idbInstance: IDBDatabase | null = null;

  constructor(companyId = "default", storeId = "default") {
    this.companyId = companyId || "default";
    this.storeId = storeId || "default";
    this.dbName = `salesmanpro_pos_${this.companyId}_${this.storeId}`;

    if (typeof window === "undefined" || !window.indexedDB) {
      this.memoryFallback = new InMemoryStore();
    }
  }

  private async openDB(): Promise<IDBDatabase | null> {
    if (this.memoryFallback) return null;
    if (this.idbInstance) return this.idbInstance;

    return new Promise((resolve) => {
      const request = window.indexedDB.open(this.dbName, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("barcode", "barcode", { unique: false });
          store.createIndex("sku", "sku", { unique: false });
          store.createIndex("categoryId", "categoryId", { unique: false });
        }

        if (!db.objectStoreNames.contains("orders")) {
          const store = db.createObjectStore("orders", { keyPath: "localId" });
          store.createIndex("syncStatus", "syncStatus", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("localReceiptNumber", "localReceiptNumber", { unique: false });
        }

        if (!db.objectStoreNames.contains("receipts")) {
          const store = db.createObjectStore("receipts", { keyPath: "id" });
          store.createIndex("orderLocalId", "orderLocalId", { unique: false });
          store.createIndex("receiptNumber", "receiptNumber", { unique: false });
        }

        if (!db.objectStoreNames.contains("customers")) {
          const store = db.createObjectStore("customers", { keyPath: "localId" });
          store.createIndex("phone", "phone", { unique: false });
          store.createIndex("email", "email", { unique: false });
          store.createIndex("name", "name", { unique: false });
        }

        if (!db.objectStoreNames.contains("journal")) {
          const store = db.createObjectStore("journal", { keyPath: "operationId" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "localId" });
        }

        if (!db.objectStoreNames.contains("device")) {
          db.createObjectStore("device", { keyPath: "deviceId" });
        }

        if (!db.objectStoreNames.contains("expenses")) {
          const store = db.createObjectStore("expenses", { keyPath: "localId" });
          store.createIndex("syncStatus", "syncStatus", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("inventory_movements")) {
          const store = db.createObjectStore("inventory_movements", { keyPath: "localId" });
          store.createIndex("marketplaceListingId", "marketplaceListingId", { unique: false });
          store.createIndex("syncStatus", "syncStatus", { unique: false });
        }

        if (!db.objectStoreNames.contains("sync_meta")) {
          db.createObjectStore("sync_meta", { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        this.idbInstance = request.result;
        resolve(this.idbInstance);
      };

      request.onerror = () => {
        console.warn(`[POS_IDB] Failed to open IndexedDB, falling back to memory`);
        this.memoryFallback = new InMemoryStore();
        resolve(null);
      };
    });
  }

  // --------------------------------------------------------------------------
  // ATOMIC TRANSCATION OUTBOX COMMIT FOR SALES
  // --------------------------------------------------------------------------

  /**
   * Commits a sale (`orders`), its outbox operation (`journal`), local stock deductions (`products` + `inventory_movements`),
   * and optional receipt (`receipts`) atomically in a single IndexedDB transaction, and mirrors to the native Android/WPF SQLite bridge.
   */
  async commitOfflineSaleAtomically(params: {
    order: LocalOrderRecord;
    journalEntry: JournalOperationItem;
    receipt?: LocalReceiptRecord | null;
    stockMovements?: LocalInventoryMovementRecord[];
  }): Promise<void> {
    const { order, journalEntry, receipt, stockMovements = [] } = params;

    if (this.memoryFallback) {
      await this.memoryFallback.put("orders", order.localId, order);
      await this.memoryFallback.put("journal", journalEntry.operationId, journalEntry);
      if (receipt) {
        await this.memoryFallback.put("receipts", receipt.id, receipt);
      }
      for (const mov of stockMovements) {
        await this.memoryFallback.put("inventory_movements", mov.localId, mov);
        const prod = await this.memoryFallback.get<LocalProductRecord>(
          "products",
          mov.marketplaceListingId
        );
        if (prod) {
          const nextStock = Math.max(0, (prod.localStockQuantity || 0) + mov.delta);
          await this.memoryFallback.put("products", prod.id, {
            ...prod,
            localStockQuantity: nextStock,
            pendingLocalDelta: (prod.pendingLocalDelta || 0) + mov.delta,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", {
        order,
        journalEntry,
        receipt,
        stockMovements,
      });
      return;
    }

    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("orders", order.localId, order);
      await this.memoryFallback!.put("journal", journalEntry.operationId, journalEntry);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const storeNames = ["orders", "journal", "products", "inventory_movements"];
      if (receipt) storeNames.push("receipts");

      const tx = db.transaction(storeNames, "readwrite");
      tx.objectStore("orders").put(order);
      tx.objectStore("journal").put(journalEntry);
      if (receipt) {
        tx.objectStore("receipts").put(receipt);
      }

      const movStore = tx.objectStore("inventory_movements");
      const prodStore = tx.objectStore("products");

      for (const mov of stockMovements) {
        movStore.put(mov);
        const getReq = prodStore.get(mov.marketplaceListingId);
        getReq.onsuccess = () => {
          const prod = getReq.result as LocalProductRecord | undefined;
          if (prod) {
            const nextStock = Math.max(0, (prod.localStockQuantity || 0) + mov.delta);
            prodStore.put({
              ...prod,
              localStockQuantity: nextStock,
              pendingLocalDelta: (prod.pendingLocalDelta || 0) + mov.delta,
              updatedAt: new Date().toISOString(),
            });
          }
        };
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", {
      order,
      journalEntry,
      receipt,
      stockMovements,
    });
  }

  // --------------------------------------------------------------------------
  // PRODUCTS / CATALOG
  // --------------------------------------------------------------------------

  async saveProduct(product: LocalProductRecord): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("products", product.id, product);
      return;
    }
    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("products", product.id, product);
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("products", "readwrite");
      const store = tx.objectStore("products");
      store.put(product);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.delete("products", productId);
      return;
    }
    const db = await this.openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("products", "readwrite");
      tx.objectStore("products").delete(productId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async bulkSaveProducts(products: LocalProductRecord[]): Promise<void> {
    if (products.length === 0) return;
    if (this.memoryFallback) {
      for (const p of products) {
        await this.memoryFallback.put("products", p.id, p);
      }
      return;
    }
    const db = await this.openDB();
    if (!db) {
      for (const p of products) {
        await this.memoryFallback!.put("products", p.id, p);
      }
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("products", "readwrite");
      const store = tx.objectStore("products");
      for (const p of products) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProduct(id: string): Promise<LocalProductRecord | null> {
    if (this.memoryFallback) {
      return this.memoryFallback.get<LocalProductRecord>("products", id);
    }
    return this.getFromStore<LocalProductRecord>("products", id);
  }

  async searchProducts(query: string, categoryId?: string): Promise<LocalProductRecord[]> {
    const all = this.memoryFallback
      ? await this.memoryFallback.getAll<LocalProductRecord>("products")
      : await this.getAllFromStore<LocalProductRecord>("products");

    const cleanQuery = query.trim().toLowerCase();
    return all.filter((p) => {
      if (p.deletedAt) return false;
      const matchesCat = !categoryId || categoryId === "all" || p.categoryId === categoryId;
      if (!matchesCat) return false;
      if (!cleanQuery) return true;

      return (
        p.name.toLowerCase().includes(cleanQuery) ||
        (p.barcode && p.barcode.toLowerCase().includes(cleanQuery)) ||
        (p.sku && p.sku.toLowerCase().includes(cleanQuery))
      );
    });
  }

  // --------------------------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------------------------

  async saveOrder(order: LocalOrderRecord): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("orders", order.localId, order);
      return;
    }
    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("orders", order.localId, order);
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("orders", "readwrite");
      const store = tx.objectStore("orders");
      store.put(order);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getOrder(localId: string): Promise<LocalOrderRecord | null> {
    if (this.memoryFallback) {
      return this.memoryFallback.get<LocalOrderRecord>("orders", localId);
    }
    return this.getFromStore<LocalOrderRecord>("orders", localId);
  }

  async getAllOrders(): Promise<LocalOrderRecord[]> {
    if (this.memoryFallback) {
      return this.memoryFallback.getAll<LocalOrderRecord>("orders");
    }
    return this.getAllFromStore<LocalOrderRecord>("orders");
  }

  // --------------------------------------------------------------------------
  // EXPENSES & INVENTORY MOVEMENTS
  // --------------------------------------------------------------------------

  async saveExpense(expense: LocalExpenseRecord): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("expenses", expense.localId, expense);
      return;
    }
    const db = await this.openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("expenses", "readwrite");
      tx.objectStore("expenses").put(expense);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllExpenses(): Promise<LocalExpenseRecord[]> {
    if (this.memoryFallback) {
      return this.memoryFallback.getAll<LocalExpenseRecord>("expenses");
    }
    return this.getAllFromStore<LocalExpenseRecord>("expenses");
  }

  async saveInventoryMovement(mov: LocalInventoryMovementRecord): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("inventory_movements", mov.localId, mov);
      return;
    }
    const db = await this.openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("inventory_movements", "readwrite");
      tx.objectStore("inventory_movements").put(mov);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllInventoryMovements(): Promise<LocalInventoryMovementRecord[]> {
    if (this.memoryFallback) {
      return this.memoryFallback.getAll<LocalInventoryMovementRecord>("inventory_movements");
    }
    return this.getAllFromStore<LocalInventoryMovementRecord>("inventory_movements");
  }

  // --------------------------------------------------------------------------
  // SYNC METADATA & CURSOR STATE
  // --------------------------------------------------------------------------

  async getSyncMetadata(): Promise<LocalSyncMetadataRecord | null> {
    if (this.memoryFallback) {
      return this.memoryFallback.get<LocalSyncMetadataRecord>("sync_meta", "sync_state");
    }
    return this.getFromStore<LocalSyncMetadataRecord>("sync_meta", "sync_state");
  }

  async saveSyncMetadata(meta: LocalSyncMetadataRecord): Promise<void> {
    const payload = { ...meta, key: "sync_state" };
    if (this.memoryFallback) {
      await this.memoryFallback.put("sync_meta", "sync_state", payload);
      return;
    }
    const db = await this.openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("sync_meta", "readwrite");
      tx.objectStore("sync_meta").put(payload);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --------------------------------------------------------------------------
  // RECEIPTS
  // --------------------------------------------------------------------------

  async saveReceipt(receipt: LocalReceiptRecord): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("receipts", receipt.id, receipt);
      return;
    }
    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("receipts", receipt.id, receipt);
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("receipts", "readwrite");
      const store = tx.objectStore("receipts");
      store.put(receipt);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getReceiptByOrder(orderLocalId: string): Promise<LocalReceiptRecord | null> {
    const all = this.memoryFallback
      ? await this.memoryFallback.getAll<LocalReceiptRecord>("receipts")
      : await this.getAllFromStore<LocalReceiptRecord>("receipts");

    return all.find((r) => r.orderLocalId === orderLocalId) || null;
  }

  async getAllReceipts(): Promise<LocalReceiptRecord[]> {
    if (this.memoryFallback) {
      return this.memoryFallback.getAll<LocalReceiptRecord>("receipts");
    }
    return this.getAllFromStore<LocalReceiptRecord>("receipts");
  }

  // --------------------------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------------------------

  async saveCustomer(customer: LocalCustomerRecord): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("customers", customer.localId, customer);
      return;
    }
    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("customers", customer.localId, customer);
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("customers", "readwrite");
      const store = tx.objectStore("customers");
      store.put(customer);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async searchCustomers(query: string): Promise<LocalCustomerRecord[]> {
    const all = this.memoryFallback
      ? await this.memoryFallback.getAll<LocalCustomerRecord>("customers")
      : await this.getAllFromStore<LocalCustomerRecord>("customers");

    const clean = query.trim().toLowerCase();
    if (!clean) return all.slice(0, 50);

    return all
      .filter(
        (c) =>
          c.localId === query ||
          c.serverId === query ||
          c.name.toLowerCase().includes(clean) ||
          c.phone.includes(clean) ||
          c.email.toLowerCase().includes(clean)
      )
      .slice(0, 50);
  }

  // --------------------------------------------------------------------------
  // TRANSACTION OUTBOX JOURNAL
  // --------------------------------------------------------------------------

  async appendJournal(entry: JournalOperationItem): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("journal", entry.operationId, entry);
      mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", { journalEntry: entry });
      return;
    }
    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("journal", entry.operationId, entry);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("journal", "readwrite");
      const store = tx.objectStore("journal");
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    mirrorToNativeShell("SAVE_OFFLINE_OUTBOX", { journalEntry: entry });
  }

  async getAllJournalEntries(): Promise<JournalOperationItem[]> {
    return this.memoryFallback
      ? this.memoryFallback.getAll<JournalOperationItem>("journal")
      : this.getAllFromStore<JournalOperationItem>("journal");
  }

  async getPendingJournalEntries(): Promise<JournalOperationItem[]> {
    const all = await this.getAllJournalEntries();
    return all
      .filter((e) => e.status === "PENDING" || e.status === "FAILED")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async updateJournalStatus(
    operationId: string,
    status: JournalOperationStatus,
    meta?: Partial<JournalOperationItem>
  ): Promise<void> {
    const existing = this.memoryFallback
      ? await this.memoryFallback.get<JournalOperationItem>("journal", operationId)
      : await this.getFromStore<JournalOperationItem>("journal", operationId);

    if (!existing) return;

    const updated: JournalOperationItem = {
      ...existing,
      status,
      ...meta,
    };

    if (this.memoryFallback) {
      await this.memoryFallback.put("journal", operationId, updated);
      mirrorToNativeShell("UPDATE_OFFLINE_OUTBOX", { journalEntry: updated });
      return;
    }
    const db = await this.openDB();
    if (!db) return;

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("journal", "readwrite");
      const store = tx.objectStore("journal");
      store.put(updated);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    mirrorToNativeShell("UPDATE_OFFLINE_OUTBOX", { journalEntry: updated });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    if (!db) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  private async getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.openDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
}
