/**
 * lib/pos/offline/storage/storageManager.ts
 *
 * Universal Persistent Storage Layer for SalesmanPro Shared POS Offline Engine.
 * Implements native IndexedDB in browser, PWA, and WebView2 desktop environments,
 * with an in-memory concurrent fallback for Node.js test runners and SSR execution.
 */

import type {
  LocalProductRecord,
  LocalCustomerRecord,
  LocalOrderRecord,
  LocalReceiptRecord,
  LocalPOSSessionRecord,
  JournalOperationItem,
  JournalOperationStatus,
} from "@/types/pos-offline";

const DB_VERSION = 1;

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
  }

  async put(storeName: string, key: string, val: any): Promise<void> {
    const store = this.stores.get(storeName);
    if (store) store.set(key, val);
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

export class POSStorageManager {
  private companyId: string;
  private storeId: string;
  private dbName: string;
  private memoryFallback: InMemoryStore | null = null;
  private idbInstance: IDBDatabase | null = null;

  constructor(companyId = "default", storeId = "default") {
    this.companyId = companyId;
    this.storeId = storeId;
    this.dbName = `salesmanpro_pos_${companyId}_${storeId}`;

    if (typeof window === "undefined" || !window.indexedDB) {
      this.memoryFallback = new InMemoryStore();
    }
  }

  private async openDB(): Promise<IDBDatabase | null> {
    if (this.memoryFallback) return null;
    if (this.idbInstance) return this.idbInstance;

    return new Promise((resolve, reject) => {
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

  async bulkSaveProducts(products: LocalProductRecord[]): Promise<void> {
    for (const p of products) {
      await this.saveProduct(p);
    }
  }

  async searchProducts(query: string, categoryId?: string): Promise<LocalProductRecord[]> {
    let all: LocalProductRecord[] = [];
    if (this.memoryFallback) {
      all = await this.memoryFallback.getAll<LocalProductRecord>("products");
    } else {
      const db = await this.openDB();
      if (!db) {
        all = await this.memoryFallback!.getAll<LocalProductRecord>("products");
      } else {
        all = await new Promise((resolve, reject) => {
          const tx = db.transaction("products", "readonly");
          const store = tx.objectStore("products");
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      }
    }

    const cleanQuery = query.trim().toLowerCase();
    return all.filter((p) => {
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
    const db = await this.openDB();
    if (!db) {
      return this.memoryFallback!.get<LocalOrderRecord>("orders", localId);
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("orders", "readonly");
      const store = tx.objectStore("orders");
      const req = store.get(localId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllOrders(): Promise<LocalOrderRecord[]> {
    if (this.memoryFallback) {
      return this.memoryFallback.getAll<LocalOrderRecord>("orders");
    }
    const db = await this.openDB();
    if (!db) {
      return this.memoryFallback!.getAll<LocalOrderRecord>("orders");
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("orders", "readonly");
      const store = tx.objectStore("orders");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
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
    if (!clean) return all.slice(0, 20);

    return all
      .filter(
        (c) =>
          c.name.toLowerCase().includes(clean) ||
          c.phone.includes(clean) ||
          c.email.toLowerCase().includes(clean)
      )
      .slice(0, 20);
  }

  // --------------------------------------------------------------------------
  // TRANSACTION OUTBOX JOURNAL
  // --------------------------------------------------------------------------

  async appendJournal(entry: JournalOperationItem): Promise<void> {
    if (this.memoryFallback) {
      await this.memoryFallback.put("journal", entry.operationId, entry);
      return;
    }
    const db = await this.openDB();
    if (!db) {
      await this.memoryFallback!.put("journal", entry.operationId, entry);
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("journal", "readwrite");
      const store = tx.objectStore("journal");
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPendingJournalEntries(): Promise<JournalOperationItem[]> {
    const all = this.memoryFallback
      ? await this.memoryFallback.getAll<JournalOperationItem>("journal")
      : await this.getAllFromStore<JournalOperationItem>("journal");

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
      return;
    }
    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction("journal", "readwrite");
      const store = tx.objectStore("journal");
      store.put(updated);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
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
