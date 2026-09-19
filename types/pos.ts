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
}

// Backward-compatibility alias
export type POSOperator = POSOperatorInfo;

export interface POSSessionInfo {
  id: string;
  terminalId: string;
  status: string;
  openedAt: string | Date;
}

// Backward-compatibility alias
export type POSSession = POSSessionInfo;

export interface AuthenticatedOperatorResult {
  success: boolean;
  operator: POSOperatorInfo;
  posSession: POSSessionInfo;
  session: any;
}
