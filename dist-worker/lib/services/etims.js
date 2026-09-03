"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtimsService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const aes_1 = require("../crypto/aes");
class EtimsService {
    /**
     * Main pipeline runner to decrypt keys, structure data, and send to KRA.
     */
    static async transmitInvoice(payload) {
        const { invoiceId, companyId, paymentMethod, customerPin, items } = payload;
        // 1. Fetch the tenant-specific KRA eTIMS profile
        const config = await prismadb_1.default.kraConfiguration.findUnique({
            where: { companyId },
        });
        if (!config || !config.etimsEnabled || !config.etimsEnabled) {
            throw new Error("eTIMS integration is disabled or not configured for this company.");
        }
        // 2. Decrypt the tenant secrets at execution time
        const decryptedCmcKey = (0, aes_1.decryptKRA)(config.cmcKey || "");
        const decryptedManagerKey = (0, aes_1.decryptKRA)(config.managerKey || "");
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
            invcNo: invoiceId.slice(-10).toUpperCase(),
            orgInvcNo: "0",
            custTin: customerPin || "",
            rcptTyCd: "1",
            pmtTyCd: paymentMethod,
            trstStatusCd: "2",
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
                    pkgUnitCd: "BG",
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
                throw new Error(`eTIMS Internal System Error: ${responseData.resultMsg || "Unknown Error"}`);
            }
            // 6. Record the response metadata straight into the database
            return {
                success: true,
                kraInvoiceNumber: responseData.data?.rcptNo || kraPayload.invcNo,
                receiptSignature: responseData.data?.rcptSign,
                internalData: responseData.data?.intrnData,
                qrCodeUrl: responseData.data?.qrCodeUrl ||
                    `https://etims.kra.go.ke/verify/${responseData.data?.rcptSign}`,
            };
        }
        catch (error) {
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
    static calculateItemTax(gross, type) {
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
    static calculateTaxSummaries(items) {
        let totalTaxable = 0;
        let totalTax = 0;
        let totalGross = 0;
        const brackets = {
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
        const roundBracket = (b) => ({
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
exports.EtimsService = EtimsService;
