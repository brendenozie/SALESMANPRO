"use strict";
/**
 * lib/pos/offline/storage/storageManager.ts
 *
 * Universal Persistent Storage Layer for SalesmanPro Shared POS Offline Engine.
 * Implements native IndexedDB in browser, PWA, and WebView2 desktop environments,
 * with an in-memory concurrent fallback for Node.js test runners and SSR execution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSStorageManager = void 0;
const DB_VERSION = 1;
class InMemoryStore {
    stores = new Map();
    constructor() {
        this.stores.set("products", new Map());
        this.stores.set("orders", new Map());
        this.stores.set("receipts", new Map());
        this.stores.set("customers", new Map());
        this.stores.set("journal", new Map());
        this.stores.set("sessions", new Map());
        this.stores.set("device", new Map());
    }
    async put(storeName, key, val) {
        const store = this.stores.get(storeName);
        if (store)
            store.set(key, val);
    }
    async get(storeName, key) {
        const store = this.stores.get(storeName);
        return store?.get(key) || null;
    }
    async getAll(storeName) {
        const store = this.stores.get(storeName);
        return store ? Array.from(store.values()) : [];
    }
    async delete(storeName, key) {
        const store = this.stores.get(storeName);
        store?.delete(key);
    }
    async clear(storeName) {
        const store = this.stores.get(storeName);
        store?.clear();
    }
}
class POSStorageManager {
    companyId;
    storeId;
    dbName;
    memoryFallback = null;
    idbInstance = null;
    constructor(companyId = "default", storeId = "default") {
        this.companyId = companyId;
        this.storeId = storeId;
        this.dbName = `salesmanpro_pos_${companyId}_${storeId}`;
        if (typeof window === "undefined" || !window.indexedDB) {
            this.memoryFallback = new InMemoryStore();
        }
    }
    async openDB() {
        if (this.memoryFallback)
            return null;
        if (this.idbInstance)
            return this.idbInstance;
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.dbName, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
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
    async saveProduct(product) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("products", product.id, product);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("products", product.id, product);
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
    async bulkSaveProducts(products) {
        for (const p of products) {
            await this.saveProduct(p);
        }
    }
    async searchProducts(query, categoryId) {
        let all = [];
        if (this.memoryFallback) {
            all = await this.memoryFallback.getAll("products");
        }
        else {
            const db = await this.openDB();
            if (!db) {
                all = await this.memoryFallback.getAll("products");
            }
            else {
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
            if (!matchesCat)
                return false;
            if (!cleanQuery)
                return true;
            return (p.name.toLowerCase().includes(cleanQuery) ||
                (p.barcode && p.barcode.toLowerCase().includes(cleanQuery)) ||
                (p.sku && p.sku.toLowerCase().includes(cleanQuery)));
        });
    }
    // --------------------------------------------------------------------------
    // ORDERS
    // --------------------------------------------------------------------------
    async saveOrder(order) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("orders", order.localId, order);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("orders", order.localId, order);
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
    async getOrder(localId) {
        if (this.memoryFallback) {
            return this.memoryFallback.get("orders", localId);
        }
        const db = await this.openDB();
        if (!db) {
            return this.memoryFallback.get("orders", localId);
        }
        return new Promise((resolve, reject) => {
            const tx = db.transaction("orders", "readonly");
            const store = tx.objectStore("orders");
            const req = store.get(localId);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }
    async getAllOrders() {
        if (this.memoryFallback) {
            return this.memoryFallback.getAll("orders");
        }
        const db = await this.openDB();
        if (!db) {
            return this.memoryFallback.getAll("orders");
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
    async saveReceipt(receipt) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("receipts", receipt.id, receipt);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("receipts", receipt.id, receipt);
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
    async getReceiptByOrder(orderLocalId) {
        const all = this.memoryFallback
            ? await this.memoryFallback.getAll("receipts")
            : await this.getAllFromStore("receipts");
        return all.find((r) => r.orderLocalId === orderLocalId) || null;
    }
    // --------------------------------------------------------------------------
    // CUSTOMERS
    // --------------------------------------------------------------------------
    async saveCustomer(customer) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("customers", customer.localId, customer);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("customers", customer.localId, customer);
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
    async searchCustomers(query) {
        const all = this.memoryFallback
            ? await this.memoryFallback.getAll("customers")
            : await this.getAllFromStore("customers");
        const clean = query.trim().toLowerCase();
        if (!clean)
            return all.slice(0, 20);
        return all
            .filter((c) => c.name.toLowerCase().includes(clean) ||
            c.phone.includes(clean) ||
            c.email.toLowerCase().includes(clean))
            .slice(0, 20);
    }
    // --------------------------------------------------------------------------
    // TRANSACTION OUTBOX JOURNAL
    // --------------------------------------------------------------------------
    async appendJournal(entry) {
        if (this.memoryFallback) {
            await this.memoryFallback.put("journal", entry.operationId, entry);
            return;
        }
        const db = await this.openDB();
        if (!db) {
            await this.memoryFallback.put("journal", entry.operationId, entry);
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
    async getPendingJournalEntries() {
        const all = this.memoryFallback
            ? await this.memoryFallback.getAll("journal")
            : await this.getAllFromStore("journal");
        return all
            .filter((e) => e.status === "PENDING" || e.status === "FAILED")
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async updateJournalStatus(operationId, status, meta) {
        const existing = this.memoryFallback
            ? await this.memoryFallback.get("journal", operationId)
            : await this.getFromStore("journal", operationId);
        if (!existing)
            return;
        const updated = {
            ...existing,
            status,
            ...meta,
        };
        if (this.memoryFallback) {
            await this.memoryFallback.put("journal", operationId, updated);
            return;
        }
        const db = await this.openDB();
        if (!db)
            return;
        return new Promise((resolve, reject) => {
            const tx = db.transaction("journal", "readwrite");
            const store = tx.objectStore("journal");
            store.put(updated);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async getAllFromStore(storeName) {
        const db = await this.openDB();
        if (!db)
            return [];
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }
    async getFromStore(storeName, key) {
        const db = await this.openDB();
        if (!db)
            return null;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }
}
exports.POSStorageManager = POSStorageManager;
