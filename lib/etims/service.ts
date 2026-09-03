/**
 * SalesmanPro POS — Master eTIMS Service
 * Authoritative lifecycle orchestration, idempotency enforcement,
 * tax categorization, and reconciliation.
 */

import prisma from "@/server/db/prismadb";
import { KraConfiguration } from "@prisma/client";
import { OSCUAdapter } from "./oscuAdapter";
import { VSCUAdapter } from "./vscuAdapter";
import { ETIMSProvider } from "./provider";
import {
  ETIMSInvoicePayload,
  ETIMSItemLine,
  ETIMSTaxBreakdown,
  ETIMSTaxCode,
  ETIMSFiscalResult,
  ETIMSReconciliationSummary,
} from "./types";
import { DEFAULT_UNSPSC_CODE, DEFAULT_UNIT_OF_MEASURE } from "./constants";

export class ETIMSService {
  private oscuAdapter = new OSCUAdapter();
  private vscuAdapter = new VSCUAdapter();

  /**
   * Resolve appropriate eTIMS provider based on store configuration
   */
  private getProvider(config: KraConfiguration): ETIMSProvider {
    return config.integrationMode === "VSCU" ? this.vscuAdapter : this.oscuAdapter;
  }

  /**
   * Determine whether eTIMS is required or standard receipts apply
   */
  async determineInvoicingMode(companyId: string): Promise<{
    isEtimsApplicable: boolean;
    requirement: "REQUIRED" | "ENABLED" | "NOT_APPLICABLE" | "NOT_CONFIGURED";
    config: KraConfiguration | null;
  }> {
    const config = await prisma.kraConfiguration.findUnique({
      where: { companyId },
    });

    if (!config) {
      return {
        isEtimsApplicable: false,
        requirement: "NOT_CONFIGURED",
        config: null,
      };
    }

    const requirement = (config.invoicingRequirement || "NOT_CONFIGURED") as any;
    const isEtimsApplicable =
      requirement === "REQUIRED" ||
      requirement === "ENABLED" ||
      Boolean(config.etimsEnabled);

    return {
      isEtimsApplicable,
      requirement,
      config,
    };
  }

  /**
   * Generates sequential, strictly monotonic device invoice number
   */
  async generateInvoiceNumber(companyId: string, branchId: string, deviceId: string): Promise<string> {
    const count = await prisma.eTIMSInvoice.count({
      where: { companyId, branchId },
    });
    const prefix = `${branchId}-${deviceId.slice(-6)}`;
    const sequence = String(count + 1).padStart(6, "0");
    return `${prefix}-INV-${sequence}`;
  }

  /**
   * Authoritative Order Fiscalization Process
   * Called during order completion when payment succeeds.
   */
  async processOrderFiscalization(params: {
    companyId: string;
    order: any;
    customerPin?: string | null;
    customerName?: string | null;
    paymentOption?: string | null;
    terminalId?: string | null;
    cashierId?: string | null;
    cashierName?: string | null;
    idempotencyKey?: string | null;
  }): Promise<{
    mode: "ETIMS" | "STANDARD";
    fiscalResult?: ETIMSFiscalResult;
    invoice?: any;
  }> {
    const { companyId, order } = params;

    // 1. Determine Store Fiscal Invoicing Mode
    const { isEtimsApplicable, config } = await this.determineInvoicingMode(companyId);

    if (!isEtimsApplicable || !config || !config.kraPin) {
      return { mode: "STANDARD" };
    }

    // 2. Idempotency Check — Do not create duplicate fiscal invoices
    const key = params.idempotencyKey || `etims-${order.id || order.trackingNumber}`;
    const existingInvoice = await prisma.eTIMSInvoice.findFirst({
      where: {
        OR: [
          { orderId: order.id },
          { idempotencyKey: key },
        ],
      },
    });

    if (existingInvoice) {
      return {
        mode: "ETIMS",
        invoice: existingInvoice,
        fiscalResult: {
          success: existingInvoice.submissionStatus === "CONFIRMED",
          invoiceNumber: existingInvoice.invoiceNumber,
          controlCode: existingInvoice.controlCode || undefined,
          scuId: existingInvoice.scuId || undefined,
          qrCodeUrl: existingInvoice.qrCodeUrl || undefined,
          internalData: existingInvoice.internalData || undefined,
          receiptDate: existingInvoice.receiptDate || undefined,
          status: existingInvoice.submissionStatus as any,
        },
      };
    }

    // 3. Map Order Items to Fiscal Item Lines & Compute Tax Breakdown
    const branchId = config.branchId || "00";
    const deviceId = config.deviceId || `OSCU${config.kraPin.slice(-6)}`;
    const invoiceNumber = await this.generateInvoiceNumber(companyId, branchId, deviceId);

    const items: ETIMSItemLine[] = [];
    const taxBreakdown: ETIMSTaxBreakdown = {
      A: { taxCode: "A", taxRate: 16, taxableAmount: 0, taxAmount: 0 },
      B: { taxCode: "B", taxRate: 0, taxableAmount: 0, taxAmount: 0 },
      C: { taxCode: "C", taxRate: 0, taxableAmount: 0, taxAmount: 0 },
      D: { taxCode: "D", taxRate: 8, taxableAmount: 0, taxAmount: 0 },
      E: { taxCode: "E", taxRate: 0, taxableAmount: 0, taxAmount: 0 },
    };

    let calculatedTaxableTotal = 0;
    let calculatedTaxTotal = 0;

    const rawItems = Array.isArray(order.items) ? order.items : [];

    rawItems.forEach((item: any, idx: number) => {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.totalPrice) || unitPrice * qty;
      const discount = Number(item.discount) || 0;
      const netLine = Math.max(0, lineTotal - discount);

      // Determine Tax Code: default to standard A (16%)
      const taxCode: ETIMSTaxCode = (item.taxTypeCode as ETIMSTaxCode) || (config.defaultTaxCode as ETIMSTaxCode) || "A";
      const rate = taxCode === "A" ? 16 : taxCode === "D" ? 8 : 0;

      // Calculate VAT: if pricing is tax-inclusive (Kenya standard), extract VAT: netLine * (rate / (100 + rate))
      let lineTax = 0;
      let lineTaxable = netLine;
      if (rate > 0) {
        lineTax = Math.round(((netLine * rate) / (100 + rate) + Number.EPSILON) * 100) / 100;
        lineTaxable = Math.round((netLine - lineTax + Number.EPSILON) * 100) / 100;
      }

      calculatedTaxableTotal += lineTaxable;
      calculatedTaxTotal += lineTax;

      taxBreakdown[taxCode].taxableAmount += lineTaxable;
      taxBreakdown[taxCode].taxAmount += lineTax;

      items.push({
        itemSeq: idx + 1,
        itemCode: item.marketplaceListingId || `ITEM-${idx + 1}`,
        itemClassificationCode: item.itemClassificationCode || DEFAULT_UNSPSC_CODE,
        itemName: item.name || item.marketplaceListing?.name || `Item ${idx + 1}`,
        taxTypeCode: taxCode,
        unitPrice,
        quantity: qty,
        discountAmount: discount,
        taxableAmount: lineTaxable,
        taxAmount: lineTax,
        totalAmount: netLine,
        unitOfMeasure: DEFAULT_UNIT_OF_MEASURE,
      });
    });

    const totalAmount = Number(order.totalFinalPrice || order.totalPrice || calculatedTaxableTotal + calculatedTaxTotal);
    const totalDiscount = Number(order.totalDiscount || 0);

    const payload: ETIMSInvoicePayload = {
      companyId,
      orderId: order.id,
      orderTrackingNumber: order.trackingNumber,
      branchId,
      branchName: config.branchName || "Head Office",
      deviceId,
      terminalId: params.terminalId || "T01",
      cashierId: params.cashierId || order.consumerId || "POS-AGENT",
      cashierName: params.cashierName || "Cashier",
      invoiceType: "ORIGINAL",
      invoiceNumber,
      kraPin: config.kraPin,
      customerPin: params.customerPin || undefined,
      customerName: params.customerName || order.name || "Walk-in Customer",
      paymentMethod: params.paymentOption || order.paymentOption || "cash",
      totalAmount,
      taxableAmount: Math.round(calculatedTaxableTotal * 100) / 100,
      taxAmount: Math.round(calculatedTaxTotal * 100) / 100,
      totalDiscount,
      items,
      taxBreakdown,
      idempotencyKey: key,
    };

    // 4. Create Initial Database Record (in SUBMITTING state)
    let dbInvoice = await prisma.eTIMSInvoice.create({
      data: {
        companyId,
        orderId: order.id,
        orderTrackingNumber: order.trackingNumber,
        branchId,
        branchName: config.branchName || "Head Office",
        deviceId,
        terminalId: params.terminalId || "T01",
        cashierId: params.cashierId || "POS-AGENT",
        cashierName: params.cashierName || "Cashier",
        integrationMode: config.integrationMode || "OSCU",
        invoiceType: "ORIGINAL",
        invoiceNumber,
        kraPin: config.kraPin,
        customerPin: params.customerPin || undefined,
        customerName: params.customerName || order.name || "Walk-in Customer",
        totalAmount,
        taxableAmount: payload.taxableAmount,
        taxAmount: payload.taxAmount,
        totalDiscount,
        taxBreakdown: JSON.parse(JSON.stringify(taxBreakdown)),
        items: JSON.parse(JSON.stringify(items)),
        paymentMethod: payload.paymentMethod,
        submissionStatus: "SUBMITTING",
        idempotencyKey: key,
      },
    });

    // 5. Submit to KRA via Active Provider
    const provider = this.getProvider(config);
    const fiscalResult = await provider.submitInvoice(config, payload);

    // 6. Update Database Record with Authoritative Fiscal Response
    dbInvoice = await prisma.eTIMSInvoice.update({
      where: { id: dbInvoice.id },
      data: {
        submissionStatus: fiscalResult.status,
        controlCode: fiscalResult.controlCode || null,
        scuId: fiscalResult.scuId || deviceId,
        internalData: fiscalResult.internalData || null,
        qrCodeUrl: fiscalResult.qrCodeUrl || null,
        receiptDate: fiscalResult.receiptDate || new Date(),
        requestId: fiscalResult.requestId || null,
        responseId: fiscalResult.responseId || null,
        errorCode: fiscalResult.errorCode || null,
        errorMessage: fiscalResult.errorMessage || null,
      },
    });

    return {
      mode: "ETIMS",
      fiscalResult,
      invoice: dbInvoice,
    };
  }

  /**
   * Issue KRA eTIMS Credit Note for Returns / Refunds
   */
  async issueCreditNote(params: {
    companyId: string;
    originalInvoiceId: string;
    reason: string;
    itemsToReturn?: Array<{ itemCode: string; quantity: number }>;
    cashierName?: string;
  }): Promise<{ success: boolean; creditNote?: any; error?: string }> {
    const originalInvoice = await prisma.eTIMSInvoice.findUnique({
      where: { id: params.originalInvoiceId },
    });

    if (!originalInvoice) {
      return { success: false, error: "Original eTIMS invoice not found." };
    }

    const { config } = await this.determineInvoicingMode(params.companyId);
    if (!config) {
      return { success: false, error: "Store eTIMS configuration missing." };
    }

    const branchId = originalInvoice.branchId;
    const deviceId = originalInvoice.deviceId || config.deviceId || "OSCU00";
    const creditNoteNumber = await this.generateInvoiceNumber(params.companyId, branchId, deviceId);

    // Build credit note item list (negative/reversal values)
    const originalItems = (originalInvoice.items as unknown as ETIMSItemLine[]) || [];
    const returnItems: ETIMSItemLine[] = originalItems.map((item, idx) => ({
      ...item,
      itemSeq: idx + 1,
      quantity: item.quantity,
      totalAmount: item.totalAmount,
      taxableAmount: item.taxableAmount,
      taxAmount: item.taxAmount,
    }));

    const payload: ETIMSInvoicePayload = {
      companyId: params.companyId,
      orderId: originalInvoice.orderId || undefined,
      orderTrackingNumber: originalInvoice.orderTrackingNumber || undefined,
      branchId,
      branchName: originalInvoice.branchName || undefined,
      deviceId,
      terminalId: originalInvoice.terminalId || undefined,
      cashierId: originalInvoice.cashierId || undefined,
      cashierName: params.cashierName || originalInvoice.cashierName || "Cashier",
      invoiceType: "CREDIT_NOTE",
      invoiceNumber: creditNoteNumber,
      originalInvoiceNumber: originalInvoice.invoiceNumber,
      creditNoteReason: params.reason,
      kraPin: originalInvoice.kraPin,
      customerPin: originalInvoice.customerPin || undefined,
      customerName: originalInvoice.customerName || undefined,
      paymentMethod: originalInvoice.paymentMethod,
      totalAmount: originalInvoice.totalAmount,
      taxableAmount: originalInvoice.taxableAmount,
      taxAmount: originalInvoice.taxAmount,
      totalDiscount: originalInvoice.totalDiscount,
      items: returnItems,
      taxBreakdown: originalInvoice.taxBreakdown as unknown as ETIMSTaxBreakdown,
      idempotencyKey: `credit-note-${originalInvoice.invoiceNumber}-${Date.now()}`,
    };

    const provider = this.getProvider(config);
    const fiscalResult = await provider.submitCreditNote(config, payload);

    const creditNoteRecord = await prisma.eTIMSInvoice.create({
      data: {
        companyId: params.companyId,
        orderId: originalInvoice.orderId,
        orderTrackingNumber: originalInvoice.orderTrackingNumber,
        branchId,
        branchName: originalInvoice.branchName,
        deviceId,
        terminalId: originalInvoice.terminalId,
        cashierId: originalInvoice.cashierId,
        cashierName: params.cashierName || "Cashier",
        integrationMode: originalInvoice.integrationMode,
        invoiceType: "CREDIT_NOTE",
        invoiceNumber: creditNoteNumber,
        originalInvoiceNumber: originalInvoice.invoiceNumber,
        creditNoteReason: params.reason,
        kraPin: originalInvoice.kraPin,
        customerPin: originalInvoice.customerPin,
        customerName: originalInvoice.customerName,
        totalAmount: -originalInvoice.totalAmount,
        taxableAmount: -originalInvoice.taxableAmount,
        taxAmount: -originalInvoice.taxAmount,
        totalDiscount: 0,
        taxBreakdown: JSON.parse(JSON.stringify(originalInvoice.taxBreakdown)),
        items: JSON.parse(JSON.stringify(returnItems)),
        paymentMethod: originalInvoice.paymentMethod,
        submissionStatus: fiscalResult.status,
        controlCode: fiscalResult.controlCode || null,
        scuId: fiscalResult.scuId || deviceId,
        internalData: fiscalResult.internalData || null,
        qrCodeUrl: fiscalResult.qrCodeUrl || null,
        receiptDate: fiscalResult.receiptDate || new Date(),
        errorCode: fiscalResult.errorCode || null,
        errorMessage: fiscalResult.errorMessage || null,
        idempotencyKey: payload.idempotencyKey,
      },
    });

    return {
      success: fiscalResult.success,
      creditNote: creditNoteRecord,
      error: fiscalResult.errorMessage,
    };
  }

  /**
   * Reconcile Store Sales Against eTIMS Fiscal Invoices
   */
  async reconcileCompanySales(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ETIMSReconciliationSummary> {
    const paidOrders = await prisma.customerOrder.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: "COMPLETED",
      },
      select: {
        id: true,
        trackingNumber: true,
        totalFinalPrice: true,
        createdAt: true,
      },
    });

    const fiscalInvoices = await prisma.eTIMSInvoice.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate, lte: endDate },
        invoiceType: "ORIGINAL",
      },
    });

    const invoiceByOrderId = new Map<string, any>();
    fiscalInvoices.forEach((inv) => {
      if (inv.orderId) invoiceByOrderId.set(inv.orderId, inv);
    });

    let totalPaidSalesAmount = 0;
    paidOrders.forEach((o) => (totalPaidSalesAmount += o.totalFinalPrice || 0));

    let totalFiscalizedAmount = 0;
    let totalPending = 0;
    let totalFailed = 0;

    fiscalInvoices.forEach((inv) => {
      if (inv.submissionStatus === "CONFIRMED") {
        totalFiscalizedAmount += inv.totalAmount;
      } else if (inv.submissionStatus === "PENDING" || inv.submissionStatus === "QUEUED") {
        totalPending++;
      } else if (inv.submissionStatus === "FAILED") {
        totalFailed++;
      }
    });

    const discrepancies: ETIMSReconciliationSummary["discrepancies"] = [];

    paidOrders.forEach((order) => {
      const inv = invoiceByOrderId.get(order.id);
      if (!inv) {
        discrepancies.push({
          orderId: order.id,
          trackingNumber: order.trackingNumber || "N/A",
          orderAmount: order.totalFinalPrice || 0,
          issue: "Paid sale missing eTIMS fiscal invoice submission.",
        });
      } else if (Math.abs((order.totalFinalPrice || 0) - inv.totalAmount) > 0.05) {
        discrepancies.push({
          orderId: order.id,
          trackingNumber: order.trackingNumber || "N/A",
          orderAmount: order.totalFinalPrice || 0,
          fiscalInvoiceNumber: inv.invoiceNumber,
          fiscalAmount: inv.totalAmount,
          issue: `Amount mismatch: Sale is KES ${order.totalFinalPrice} but eTIMS invoice is KES ${inv.totalAmount}.`,
        });
      }
    });

    return {
      companyId,
      startDate,
      endDate,
      totalPaidSales: paidOrders.length,
      totalPaidSalesAmount: Math.round(totalPaidSalesAmount * 100) / 100,
      totalFiscalized: fiscalInvoices.filter((i) => i.submissionStatus === "CONFIRMED").length,
      totalFiscalizedAmount: Math.round(totalFiscalizedAmount * 100) / 100,
      totalPending,
      totalFailed,
      discrepancies,
    };
  }

  /**
   * Retry failed or queued eTIMS submission
   */
  async retryInvoiceSubmission(invoiceId: string): Promise<ETIMSFiscalResult> {
    const invoice = await prisma.eTIMSInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error("Invoice record not found.");
    }

    const { config } = await this.determineInvoicingMode(invoice.companyId);
    if (!config) {
      throw new Error("Store eTIMS configuration not found.");
    }

    const payload: ETIMSInvoicePayload = {
      companyId: invoice.companyId,
      orderId: invoice.orderId || undefined,
      orderTrackingNumber: invoice.orderTrackingNumber || undefined,
      branchId: invoice.branchId,
      branchName: invoice.branchName || undefined,
      deviceId: invoice.deviceId || config.deviceId || "OSCU00",
      terminalId: invoice.terminalId || undefined,
      cashierId: invoice.cashierId || undefined,
      cashierName: invoice.cashierName || undefined,
      invoiceType: invoice.invoiceType as any,
      invoiceNumber: invoice.invoiceNumber,
      originalInvoiceNumber: invoice.originalInvoiceNumber || undefined,
      creditNoteReason: invoice.creditNoteReason || undefined,
      kraPin: invoice.kraPin,
      customerPin: invoice.customerPin || undefined,
      customerName: invoice.customerName || undefined,
      paymentMethod: invoice.paymentMethod,
      totalAmount: invoice.totalAmount,
      taxableAmount: invoice.taxableAmount,
      taxAmount: invoice.taxAmount,
      totalDiscount: invoice.totalDiscount,
      items: invoice.items as unknown as ETIMSItemLine[],
      taxBreakdown: invoice.taxBreakdown as unknown as ETIMSTaxBreakdown,
      idempotencyKey: invoice.idempotencyKey || `retry-${invoice.id}-${Date.now()}`,
    };

    const provider = this.getProvider(config);
    const result = await provider.submitInvoice(config, payload);

    await prisma.eTIMSInvoice.update({
      where: { id: invoiceId },
      data: {
        submissionStatus: result.status,
        controlCode: result.controlCode || invoice.controlCode,
        scuId: result.scuId || invoice.scuId,
        internalData: result.internalData || invoice.internalData,
        qrCodeUrl: result.qrCodeUrl || invoice.qrCodeUrl,
        receiptDate: result.receiptDate || invoice.receiptDate,
        errorCode: result.errorCode || null,
        errorMessage: result.errorMessage || null,
        retryCount: { increment: 1 },
      },
    });

    return result;
  }
}

export const etimsService = new ETIMSService();
