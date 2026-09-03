/**
 * SalesmanPro POS — Unified Receipt Data Contracts
 */

import { ETIMSTaxCode, ETIMSTaxBreakdown } from "../etims/types";

export type ReceiptMode = "ETIMS" | "STANDARD";

export interface ReceiptLineItem {
  id: string;
  name: string;
  variantDescription?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxTypeCode?: ETIMSTaxCode;
  taxAmount?: number;
  subtotal: number;
}

export interface UnifiedReceiptData {
  // Store / Business Profile
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeLogoUrl?: string;

  // Transaction Identifiers
  orderId?: string;
  trackingNumber: string;
  date: string;
  time: string;
  cashierName: string;
  cashierId?: string;
  terminalId?: string;

  // Customer Information
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerPin?: string; // Taxpayer / Buyer PIN

  // Financial Totals
  currency: string;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  finalTotal: number;
  paymentMethod: string;
  paymentMethodDetails?: string;

  // Line Items
  items: ReceiptLineItem[];

  // eTIMS Fiscal Specifics (Mode A only)
  isFiscal: boolean;
  kraPin?: string;
  branchId?: string;
  branchName?: string;
  deviceId?: string;
  invoiceNumber?: string;
  originalInvoiceNumber?: string; // For credit note printouts
  invoiceType?: "ORIGINAL" | "CREDIT_NOTE";
  controlCode?: string;
  scuId?: string;
  internalData?: string;
  qrCodeUrl?: string;
  taxBreakdown?: ETIMSTaxBreakdown;

  // Reprint / Duplicate Tracking
  isReprint?: boolean;
  reprintCount?: number;
  reprintedAt?: string;
}
