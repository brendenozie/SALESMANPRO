'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ConnectivityState,
  LocalProductRecord,
  LocalOrderRecord,
  LocalReceiptRecord,
  LocalCustomerRecord,
  LocalOrderItemRecord,
} from '@/types/pos-offline';
import { POSStorageManager } from '@/lib/pos/offline/storage/storageManager';
import { TransactionJournalManager } from '@/lib/pos/offline/journal/transactionJournal';
import { ConnectivityManager, getConnectivityManager } from '@/lib/pos/offline/connectivity/connectivityManager';
import { POSSyncClient, SyncRunSummary } from '@/lib/pos/offline/sync/posSyncClient';

export interface CreateOfflineCashOrderInput {
  companyId: string;
  storeId?: string;
  terminalId?: string;
  posSessionId?: string;
  operatorId?: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerLocalId?: string;
  items: LocalOrderItemRecord[];
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  amountReceived?: number;
  currencySymbol?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export interface POSOfflineContextValue {
  connectivityState: ConnectivityState;
  latencyMs: number;
  isOnline: boolean;
  isOffline: boolean;
  isDegraded: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<SyncRunSummary>;
  createOfflineCashOrder: (input: CreateOfflineCashOrderInput) => Promise<{
    localOrder: LocalOrderRecord;
    receipt: LocalReceiptRecord;
  }>;
  searchLocalProducts: (query: string, categoryId?: string) => Promise<LocalProductRecord[]>;
  cacheCatalog: (products: LocalProductRecord[]) => Promise<void>;
  storage: POSStorageManager;
  journal: TransactionJournalManager;
}

const POSOfflineContext = createContext<POSOfflineContextValue | null>(null);

function generateReceiptNumber(terminalId = 'T01'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${terminalId}-${dateStr}-${seq}`;
}

function generateTrackingNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const hex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRK-${dateStr}-${hex}`;
}

export const POSOfflineProvider: React.FC<{
  children: React.ReactNode;
  companyId: string;
  storeId?: string;
  deviceId?: string;
}> = ({ children, companyId, storeId = 'default', deviceId = 'DEV-POS-01' }) => {
  const storage = useMemo(() => new POSStorageManager(companyId, storeId), [companyId, storeId]);
  const journal = useMemo(
    () => new TransactionJournalManager(storage, deviceId, companyId, storeId),
    [storage, deviceId, companyId, storeId]
  );
  const connectivity = useMemo(() => getConnectivityManager(), []);
  const syncClient = useMemo(
    () => new POSSyncClient(storage, journal, connectivity, deviceId, companyId, storeId),
    [storage, journal, connectivity, deviceId, companyId, storeId]
  );

  const [connectivityState, setConnectivityState] = useState<ConnectivityState>(connectivity.getState());
  const [latencyMs, setLatencyMs] = useState<number>(connectivity.getLatency());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Update pending count
  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await storage.getPendingJournalEntries();
      setPendingSyncCount(items.length);
    } catch {}
  }, [storage]);

  // Subscribe to connectivity changes
  useEffect(() => {
    const unsub = connectivity.subscribe((state, lat) => {
      setConnectivityState(state);
      setLatencyMs(lat);
      // Auto-sync when reconnecting to online
      if (state === 'ONLINE' || state === 'DEGRADED') {
        syncClient.syncPending().then(() => refreshPendingCount());
      }
    });

    refreshPendingCount();
    return () => unsub();
  }, [connectivity, syncClient, refreshPendingCount]);

  const syncNow = useCallback(async (): Promise<SyncRunSummary> => {
    setIsSyncing(true);
    try {
      const summary = await syncClient.syncPending();
      await refreshPendingCount();
      return summary;
    } finally {
      setIsSyncing(false);
    }
  }, [syncClient, refreshPendingCount]);

  const createOfflineCashOrder = useCallback(
    async (input: CreateOfflineCashOrderInput) => {
      const localId = `ORD-${uuidv4()}`;
      const localReceiptNumber = generateReceiptNumber(input.terminalId);
      const trackingNumber = generateTrackingNumber();
      const changeDue = Math.max(0, (input.amountReceived || input.totalAmount) - input.totalAmount);
      const now = new Date().toISOString();

      const localOrder: LocalOrderRecord = {
        localId,
        companyId: input.companyId,
        storeId: input.storeId,
        deviceId,
        localReceiptNumber,
        trackingNumber,
        posSessionId: input.posSessionId,
        operatorId: input.operatorId,
        cashierName: input.cashierName,
        customerLocalId: input.customerLocalId,
        customerName: input.customerName || 'Walk-in Customer',
        customerPhone: input.customerPhone || '0000000000',
        customerEmail: input.customerEmail || 'pos-customer@store.local',
        orderType: 'PRODUCT',
        orderSource: 'IN_PERSON',
        paymentOption: 'cash',
        paymentStatus: 'COMPLETED',
        status: 'PAID',
        subtotal: input.subtotal,
        discountPercent: input.discountPercent || 0,
        discountAmount: input.discountAmount || 0,
        taxAmount: input.taxAmount || 0,
        totalAmount: input.totalAmount,
        items: input.items,
        payments: [
          {
            paymentId: `PAY-${uuidv4()}`,
            method: 'cash',
            amount: input.totalAmount,
            amountReceived: input.amountReceived || input.totalAmount,
            changeDue,
            processedAt: now,
          },
        ],
        syncStatus: 'PENDING',
        createdAt: now,
      };

      // 1. Save local order
      await storage.saveOrder(localOrder);

      // 2. Build receipt HTML
      const currency = input.currencySymbol || 'KSh';
      const itemsListHtml = input.items
        .map(
          (i) => `
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin: 3px 0;">
          <span>${i.name} x${i.quantity}</span>
          <span>${currency} ${i.subtotal.toFixed(2)}</span>
        </div>`
        )
        .join('');

      const htmlContent = `
        <div style="font-family: monospace; width: 280px; padding: 10px; margin: 0 auto;">
          <h2 style="text-align: center; margin: 0;">${input.storeName || 'SALESMANPRO STORE'}</h2>
          <p style="text-align: center; font-size: 11px; margin: 2px 0;">${input.storeAddress || ''}</p>
          <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
          <p style="font-size: 11px; margin: 2px 0;">Receipt: ${localReceiptNumber}</p>
          <p style="font-size: 11px; margin: 2px 0;">Tracking: ${trackingNumber}</p>
          <p style="font-size: 11px; margin: 2px 0;">Date: ${new Date(now).toLocaleString()}</p>
          <p style="font-size: 11px; margin: 2px 0;">Cashier: ${input.cashierName || 'Staff'}</p>
          <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
          ${itemsListHtml}
          <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
            <span>TOTAL:</span>
            <span>${currency} ${input.totalAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
            <span>Cash Tendered:</span>
            <span>${currency} ${(input.amountReceived || input.totalAmount).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span>Change Due:</span>
            <span>${currency} ${changeDue.toFixed(2)}</span>
          </div>
          <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
          <p style="text-align: center; font-size: 10px; margin: 5px 0;">OFFLINE VERIFIED RECEIPT</p>
          <p style="text-align: center; font-size: 12px; font-weight: bold; margin: 5px 0;">THANK YOU FOR YOUR BUSINESS</p>
        </div>
      `;

      const receipt: LocalReceiptRecord = {
        id: `RCP-${uuidv4()}`,
        orderLocalId: localId,
        receiptNumber: localReceiptNumber,
        htmlContent,
        printedAt: now,
        printStatus: 'QUEUED',
      };
      await storage.saveReceipt(receipt);

      // 3. Write outbox operation to Journal
      await journal.recordOperation({
        entityType: 'ORDER',
        entityLocalId: localId,
        operationType: 'CREATE',
        operatorId: input.operatorId,
        payload: {
          ...localOrder,
          clientCreatedAt: now,
        },
      });

      await refreshPendingCount();

      // 4. Trigger background sync attempt if currently online
      if (connectivity.getState() === 'ONLINE' || connectivity.getState() === 'DEGRADED') {
        syncClient.syncPending().then(() => refreshPendingCount());
      }

      return { localOrder, receipt };
    },
    [storage, journal, connectivity, syncClient, deviceId, refreshPendingCount]
  );

  const searchLocalProducts = useCallback(
    async (query: string, categoryId?: string) => {
      return storage.searchProducts(query, categoryId);
    },
    [storage]
  );

  const cacheCatalog = useCallback(
    async (products: LocalProductRecord[]) => {
      await storage.bulkSaveProducts(products);
    },
    [storage]
  );

  const value: POSOfflineContextValue = {
    connectivityState,
    latencyMs,
    isOnline: connectivityState === 'ONLINE',
    isOffline: connectivityState === 'OFFLINE',
    isDegraded: connectivityState === 'DEGRADED',
    pendingSyncCount,
    isSyncing,
    syncNow,
    createOfflineCashOrder,
    searchLocalProducts,
    cacheCatalog,
    storage,
    journal,
  };

  return <POSOfflineContext.Provider value={value}>{children}</POSOfflineContext.Provider>;
};

export function usePOSOfflineContext(): POSOfflineContextValue {
  const ctx = useContext(POSOfflineContext);
  if (!ctx) {
    throw new Error('usePOSOfflineContext must be used within a POSOfflineProvider');
  }
  return ctx;
}
