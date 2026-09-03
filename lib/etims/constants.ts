/**
 * SalesmanPro POS — KRA eTIMS Constants & Tax Mappings
 */

import { ETIMSTaxCode, ETIMSTaxRateInfo } from "./types";

export const ETIMS_TAX_RATES: Record<ETIMSTaxCode, ETIMSTaxRateInfo> = {
  A: {
    code: "A",
    rate: 16.0,
    name: "VAT Standard (16%)",
    description: "Standard Rate VAT applicable to general goods and taxable services",
  },
  B: {
    code: "B",
    rate: 0.0,
    name: "Zero Rated (0%)",
    description: "Zero-rated goods and services under the VAT Act Second Schedule (exports, etc.)",
  },
  C: {
    code: "C",
    rate: 0.0,
    name: "Exempt",
    description: "Exempt supplies under the VAT Act First Schedule (unprocessed agricultural, medical, etc.)",
  },
  D: {
    code: "D",
    rate: 8.0,
    name: "Special Rate (8%)",
    description: "Special rate petroleum/fuel products where designated under the Finance Act",
  },
  E: {
    code: "E",
    rate: 0.0,
    name: "Non-VAT / Other",
    description: "Other non-VATable supplies",
  },
};

export const ETIMS_SANDBOX_BASE_URL = "https://etims-sbx.kra.go.ke";
export const ETIMS_PRODUCTION_BASE_URL = "https://etims.kra.go.ke";

export const DEFAULT_UNSPSC_CODE = "50181900"; // General Merchandise / Bakery & Food default
export const DEFAULT_UNIT_OF_MEASURE = "EA";    // Each / Unit

export const ETIMS_PAYMENT_METHODS: Record<string, string> = {
  cash: "01",        // Cash
  cod: "01",         // Cash on delivery
  card: "03",        // Credit / Debit Card
  mpesa: "04",       // Mobile Money / M-Pesa
  bank_transfer: "02", // Bank Transfer / Cheque
  split: "05",       // Multi-payment / Split
  pending: "06",     // Credit / Pending
};

/**
 * Standard KRA eTIMS QR Verification URL base
 */
export const KRA_QR_VERIFICATION_BASE_URL = "https://etims.kra.go.ke/common/link/etims/receipt/index.html";
