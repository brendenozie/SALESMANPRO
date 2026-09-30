/**
 * types/pos.ts
 * Pure TypeScript definitions for POS Sessions, Operators, and Customers.
 * Safe for direct import in both Client ('use client') and Server Components.
 * Does NOT import Prisma, database drivers, or Node runtime modules.
 */

export interface POSCustomerRecord {
  id: string; // User ID
  clientId?: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  customerNumber?: string;
  orderCount?: number;
  totalSpent?: number;
  lastPurchaseDate?: string | null;
}

// Backward-compatibility alias
export type POSCustomer = POSCustomerRecord;

export interface SearchPOSCustomersInput {
  companyId: string;
  query: string;
  limit?: number;
}

export interface CreatePOSCustomerInput {
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface POSOperatorInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle?: string;
  staffProfileId?: string;
  permissions?: string[];
}

// Backward-compatibility alias
export type POSOperator = POSOperatorInfo;

export interface POSSessionInfo {
  id: string;
  terminalId: string;
  status: string;
  shiftStatus?: string;
  openedAt: string | Date;
  closedAt?: string | Date | null;
  openingBalance?: number;
  closingBalance?: number | null;
  expectedCash?: number;
  countedCash?: number | null;
  cashVariance?: number | null;
  totalSales?: number;
  totalTransactions?: number;
}

// Backward-compatibility alias
export type POSSession = POSSessionInfo;

export interface AuthenticatedOperatorResult {
  success: boolean;
  operator: POSOperatorInfo;
  posSession: POSSessionInfo;
  session: any;
}

// ============================================================
// RESTAURANT POS INTERFACES
// ============================================================

export type TableStatusType =
  | "AVAILABLE"
  | "OCCUPIED"
  | "ORDERING"
  | "WAITING_PAYMENT"
  | "PAID"
  | "RESERVED"
  | "OUT_OF_SERVICE";

export interface RestaurantAreaRecord {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  tablesCount?: number;
}

export interface RestaurantTableRecord {
  id: string;
  companyId: string;
  areaId?: string | null;
  areaName?: string | null;
  tableNumber: string;
  name?: string | null;
  capacity: number;
  status: TableStatusType;
  currentOrderId?: string | null;
  currentSessionId?: string | null;
  currentOrder?: any | null;
  currentSession?: any | null;
  isActive: boolean;
  guestCount?: number;
  openedAt?: string | null;
  elapsedMinutes?: number;
}

export interface TableSessionRecord {
  id: string;
  companyId: string;
  tableId: string;
  tableNumber: string;
  openedById: string;
  openedByName?: string;
  guestCount: number;
  status: "ACTIVE" | "CLOSED" | "TRANSFERRED";
  serviceMode: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "COUNTER";
  openedAt: string;
  closedAt?: string | null;
  orderId?: string | null;
  totalAmount?: number;
  notes?: string | null;
}

export interface SplitBillItem {
  orderItemId: string;
  marketplaceListingId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface SplitBillGroup {
  splitIndex: number;
  label?: string;
  amount: number;
  itemIds?: string[];
  items?: SplitBillItem[];
}

export interface POSHeldOrder {
  id: string;
  sessionId: string;
  heldAt: string;
  note?: string;
  customer?: POSCustomerRecord | null;
  tableNumber?: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
