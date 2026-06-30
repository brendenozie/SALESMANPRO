import prisma  from "@/server/db/prismadb";
import { decryptKRA } from "../crypto/aes";

// KRA eTIMS Tax Code definitions
export type TaxType = "A" | "B" | "C" | "D" | "E";

interface InvoiceItemInput {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxType: TaxType; // 'A' = 16% standard, 'B' = 0%, 'C' = Exempt, etc.
}

interface TransmitInvoicePayload {
  invoiceId: string;
  companyId: string;
  paymentMethod: string; // '01' Cash, '02' Card, '03' Mobile Money/M-Pesa
  customerPin?: string;
  items: InvoiceItemInput[];
}

export class EtimsService {
  /**
   * Main pipeline runner to decrypt keys, structure data, and send to KRA.
   */
  static async transmitInvoice(payload: TransmitInvoicePayload) {
    const { invoiceId, companyId, paymentMethod, customerPin, items } = payload;

    // 1. Fetch the tenant-specific KRA eTIMS profile
    const config = await prisma.kraConfiguration.findUnique({
      where: { companyId },
    });

    if (!config || !config.etimsEnabled || !config.etimsEnabled) {
      throw new Error(
        "eTIMS integration is disabled or not configured for this company.",
      );
    }

    // 2. Decrypt the tenant secrets at execution time
    const decryptedCmcKey = decryptKRA(config.cmcKey || "");
    const decryptedManagerKey = decryptKRA(config.managerKey || "");

    if (!decryptedCmcKey) {
      throw new Error("Failed to decrypt eTIMS Communication Key (cmcKey).");
    }

    // 3. Compute running totals and aggregate tax brackets required by KRA
    const invoiceSummary = this.calculateTaxSummaries(items);

    // 4. Build the structural payload exactly matching the KRA OSCU specification
    const kraPayload = {
      tin: config.kraPin,
      bhfId: config.branchId,
      dvcId: config.deviceId,
      invcNo: invoiceId.slice(-10).toUpperCase(), // eTIMS typically enforces custom sequence limits
      orgInvcNo: "0", // Stays "0" for direct sales; used for credit notes to reference original invoice
      custTin: customerPin || "",
      rcptTyCd: "1", // "1" denotes a standard transaction Sale
      pmtTyCd: paymentMethod,
      trstStatusCd: "2", // "2" marks a completed, real-time transaction

      // Totals
      totItemCnt: items.length,
      totTaxblAmt: invoiceSummary.totalTaxable,
      totTaxAmt: invoiceSummary.totalTax,
      totAmt: invoiceSummary.totalGross,

      // Bracket Breakdowns
      taxblAmtA: invoiceSummary.brackets.A.taxable,
      taxAmtA: invoiceSummary.brackets.A.tax,
      taxblAmtB: invoiceSummary.brackets.B.taxable,
      taxAmtB: invoiceSummary.brackets.B.tax,
      taxblAmtC: invoiceSummary.brackets.C.taxable,
      taxAmtC: invoiceSummary.brackets.C.tax,
      taxblAmtD: invoiceSummary.brackets.D.taxable,
      taxAmtD: invoiceSummary.brackets.D.tax,
      taxblAmtE: invoiceSummary.brackets.E.taxable,
      taxAmtE: invoiceSummary.brackets.E.tax,

      // Line items mapping
      itemList: items.map((item, index) => {
        const itemGross = item.quantity * item.unitPrice;
        const { taxable, tax } = this.calculateItemTax(itemGross, item.taxType);

        return {
          itemSeq: index + 1,
          itemCd: item.sku,
          itemNm: item.name,
          pkgUnitCd: "BG", // Universal fallback code or map from your database
          qtyUnitCd: "U",
          qty: item.quantity,
          prc: item.unitPrice,
          totAmt: itemGross,
          taxblAmt: taxable,
          taxTyCd: item.taxType,
          taxAmt: tax,
        };
      }),
    };

    // 5. Fire request out to KRA gateway
    const targetUrl = `${config.etimsUrl || "https://etims-api-sbx.kra.go.ke/etims-api"}/saveSales`;

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // eTIMS uses variations of these security headers depending on sandbox vs production profiles
          cmcKey: decryptedCmcKey,
          managerKey: decryptedManagerKey,
        },
        body: JSON.stringify(kraPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`KRA eTIMS Server rejected transaction: ${errorText}`);
      }

      const responseData = await response.json();

      // eTIMS standard success returns status code "0000" inside the payload body
      if (responseData.resultCd !== "0000") {
        throw new Error(
          `eTIMS Internal System Error: ${responseData.resultMsg || "Unknown Error"}`,
        );
      }

      // 6. Record the response metadata straight into the database
      return {
        success: true,
        kraInvoiceNumber: responseData.data?.rcptNo || kraPayload.invcNo,
        receiptSignature: responseData.data?.rcptSign, // The legal signature code required on PDFs
        internalData: responseData.data?.intrnData,
        qrCodeUrl:
          responseData.data?.qrCodeUrl ||
          `https://etims.kra.go.ke/verify/${responseData.data?.rcptSign}`,
      };
    } catch (error: any) {
      console.error(`eTIMS Pipeline Failure for Company: ${companyId}`, error);
      return {
        success: false,
        error: error?.message || "Connection failure to tax authority gateway.",
      };
    }
  }

  /**
   * Helper utility to process tax metrics per line item
   */
  private static calculateItemTax(gross: number, type: TaxType) {
    if (type === "A") {
      // 16% inclusive VAT calculation: Gross - (Gross / 1.16)
      const taxable = parseFloat((gross / 1.16).toFixed(2));
      const tax = parseFloat((gross - taxable).toFixed(2));
      return { taxable, tax };
    }
    // Zero-rated, exempt, or out-of-scope has no tax portion
    return { taxable: gross, tax: 0 };
  }

  /**
   * Aggregate totals dynamically across all KRA tax categories
   */
  private static calculateTaxSummaries(items: InvoiceItemInput[]) {
    let totalTaxable = 0;
    let totalTax = 0;
    let totalGross = 0;

    const brackets: Record<TaxType, { taxable: number; tax: number }> = {
      A: { taxable: 0, tax: 0 },
      B: { taxable: 0, tax: 0 },
      C: { taxable: 0, tax: 0 },
      D: { taxable: 0, tax: 0 },
      E: { taxable: 0, tax: 0 },
    };

    for (const item of items) {
      const itemGross = item.quantity * item.unitPrice;
      const { taxable, tax } = this.calculateItemTax(itemGross, item.taxType);

      brackets[item.taxType].taxable += taxable;
      brackets[item.taxType].tax += tax;

      totalTaxable += taxable;
      totalTax += tax;
      totalGross += itemGross;
    }

    // Rounding safety adjustments
    const roundBracket = (b: { taxable: number; tax: number }) => ({
      taxable: parseFloat(b.taxable.toFixed(2)),
      tax: parseFloat(b.tax.toFixed(2)),
    });

    return {
      totalTaxable: parseFloat(totalTaxable.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalGross: parseFloat(totalGross.toFixed(2)),
      brackets: {
        A: roundBracket(brackets.A),
        B: roundBracket(brackets.B),
        C: roundBracket(brackets.C),
        D: roundBracket(brackets.D),
        E: roundBracket(brackets.E),
      },
    };
  }
}
