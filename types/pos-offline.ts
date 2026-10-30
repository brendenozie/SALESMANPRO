/**
 * types/pos-offline.ts
 *
 * Pure TypeScript definitions for the Shared POS Offline Engine.
 * Covers local replicas, transaction outbox journal, sync protocol packets, and connectivity states.
 * Safe for direct import in both Client ('use client') and Server Components.
 */

export type ConnectivityState =
  | "ONLINE"
  | "DEGRADED"
  | "OFFLINE"
  | "SYNCING"
  | "SYNC_ERROR";

export type JournalOperationStatus =
  | "PENDING"
  | "SYNCING"
  | "SYNCED"
  | "FAILED"
  | "CONFLICT";

export type JournalEntityType =
  | "ORDER"
  | "SALE"
  | "CUSTOMER"
  | "INVENTORY_MOVEMENT"
  | "EXPENSE"
  | "QUOTATION"
  | "INVOICE"
  | "RETURN"
  | "SESSION_OPEN"
  | "SESSION_CLOSE"
  | "PAYMENT";

export type JournalOperationType = "CREATE" | "UPDATE" | "CLOSE" | "ACTION";

export interface LocalProductVariant {
  id: string;
  name: string;
  category: string;
  extraPrice: number;
  sku?: string | null;
  barcode?: string | null;
}

export interface LocalProductRecord {
  id: string; // Server MarketplaceListing or Product ID
  productId?: string | null;
  companyId: string;
  storeId?: string | null;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  sellingPrice: number;
  finalPrice: number;
  taxRate?: number | null;
  categoryId?: string | null;
  categoryName?: string | null;
  isAvailable: boolean;
  imageUrl?: string | null;
  pricingMode: "PRODUCT" | "SERVICE" | "BOOKING";
  trackInventory: boolean;
  localStockQuantity: number;
  cloudAuthoritativeStock?: number;
  allocatedOfflineStock?: number | null;
  pendingLocalDelta?: number;
  serverStockRevision: number;
  variants: LocalProductVariant[];
  updatedAt: string;
  deletedAt?: string | null;
}

export interface LocalCustomerRecord {
  localId: string; // UUID v4
  serverId?: string | null; // MongoDB Consumer / User ID once synced
  companyId: string;
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  notes?: string | null;
  customerNumber?: string;
  orderCount: number;
  totalSpent: number;
  syncState: "SYNCED" | "PENDING_CREATE" | "MERGE_REQUIRED";
  createdAt: string;
  updatedAt: string;
}

export interface LocalOrderItemRecord {
  itemId: string;
  marketplaceListingId: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  extraPrice: number;
  finalPrice: number;
  subtotal: number;
  taxAmount: number;
  selectedOptions?: any[] | null;
  serviceDate?: string | null;
  serviceTimeSlot?: string | null;
  assignedStaffId?: string | null;
  serviceNotes?: string | null;
}

export interface LocalPaymentRecord {
  paymentId: string;
  method: "cash" | "split" | "manual_card" | "manual_mpesa";
  amount: number;
  amountReceived?: number | null;
  changeDue?: number | null;
  referenceCode?: string | null;
  verificationStatus?: "CONFIRMED_LOCAL_CASH" | "UNVERIFIED_OFFLINE" | "VERIFIED_ONLINE";
  processedAt: string;
}

export interface LocalOrderRecord {
  localId: string;
  serverId?: string | null;
  companyId: string;
  storeId?: string;
  deviceId: string;
  localReceiptNumber: string;
  trackingNumber: string;
  localSessionId?: string;
  posSessionId?: string;
  operatorId?: string;
  cashierName?: string;
  customerLocalId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: "PRODUCT" | "SERVICE" | "BOOKING";
  orderSource: "IN_PERSON";
  paymentOption: "cash" | "split" | "manual_card" | "manual_mpesa";
  paymentStatus: "COMPLETED" | "PENDING";
  status: "PAID" | "PENDING";
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: LocalOrderItemRecord[];
  payments: LocalPaymentRecord[];
  syncStatus: JournalOperationStatus;
  syncError?: string | null;
  createdAt: string;
  syncedAt?: string | null;
}

export interface LocalReceiptRecord {
  id: string;
  orderLocalId: string;
  receiptNumber: string;
  htmlContent: string;
  escPosBase64?: string | null;
  printedAt: string;
  printStatus: "PRINTED" | "FAILED" | "QUEUED" | "REQUIRES_ATTENTION";
  reprintCount?: number;
  lastPrintError?: string | null;
}

export interface LocalExpenseRecord {
  localId: string;
  serverId?: string | null;
  expenseId: string;
  companyId: string;
  storeId?: string;
  deviceId: string;
  category: string;
  description: string;
  vendor: string;
  amount: number;
  taxAmount: number;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  syncStatus: JournalOperationStatus;
  createdAt: string;
  syncedAt?: string | null;
}

export interface LocalInventoryMovementRecord {
  localId: string;
  operationId: string;
  companyId: string;
  storeId?: string;
  deviceId: string;
  marketplaceListingId: string;
  productId?: string | null;
  productName: string;
  delta: number;
  movementType:
    | "POS_SALE"
    | "ORDER_RETURN"
    | "RESTOCK"
    | "DAMAGE_WRITE_OFF"
    | "STOCK_ADJUSTMENT";
  reason?: string | null;
  syncStatus: JournalOperationStatus;
  createdAt: string;
}

export interface LocalSyncMetadataRecord {
  key: string; // e.g. "sync_state"
  companyId: string;
  storeId: string;
  deviceId: string;
  cursor: number;
  lastSyncAt?: string | null;
  lastBootstrapAt?: string | null;
  offlineGrantToken?: string | null;
  offlineGrantExpiresAt?: string | null;
  offlineStockPolicy?: "STRICT" | "CONTROLLED" | "FLEXIBLE";
  receiptSequence: number;
}

export interface LocalPOSSessionRecord {
  localId: string;
  serverId?: string | null;
  companyId: string;
  storeId?: string;
  terminalId: string;
  operatorId: string;
  operatorName: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string | null;
  openingCash: number;
  closingCash?: number | null;
  expectedCash: number;
  cashSalesTotal: number;
  totalTransactions: number;
  syncState: "SYNCED" | "PENDING_SYNC" | "CONFLICT";
  syncError?: string | null;
}

export interface JournalOperationItem {
  operationId: string; // UUID v4
  deviceId: string;
  companyId: string;
  storeId?: string;
  operatorId?: string;
  entityType: JournalEntityType;
  entityLocalId: string;
  operationType: JournalOperationType;
  payload: any;
  dependencies: string[]; // List of operationIds that must succeed first
  idempotencyKey: string; // `${deviceId}:${operationId}`
  status: JournalOperationStatus;
  attemptCount: number;
  lastAttemptAt?: string | null;
  nextRetryAt?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  serverRevision?: number | null;
  createdAt: string;
  syncedAt?: string | null;
}

export interface SyncBatchRequest {
  deviceId: string;
  companyId: string;
  storeId?: string;
  batchId: string;
  operations: JournalOperationItem[];
}

export interface SyncOperationResult {
  operationId: string;
  status: "SUCCESS" | "FAILED" | "CONFLICT";
  serverEntityId?: string;
  trackingNumber?: string;
  alreadyExists?: boolean;
  serverSequence?: number;
  remapping?: {
    localId: string;
    serverId: string;
  };
  warnings?: any[];
  error?: string;
}

export interface SyncBatchResponse {
  success: boolean;
  batchId: string;
  results: SyncOperationResult[];
  serverRevision: number;
  headSequence?: number;
}
