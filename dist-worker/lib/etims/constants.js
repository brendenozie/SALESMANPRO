"use strict";
/**
 * SalesmanPro POS — KRA eTIMS Constants & Tax Mappings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KRA_QR_VERIFICATION_BASE_URL = exports.ETIMS_PAYMENT_METHODS = exports.DEFAULT_UNIT_OF_MEASURE = exports.DEFAULT_UNSPSC_CODE = exports.ETIMS_PRODUCTION_BASE_URL = exports.ETIMS_SANDBOX_BASE_URL = exports.ETIMS_TAX_RATES = void 0;
exports.ETIMS_TAX_RATES = {
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
exports.ETIMS_SANDBOX_BASE_URL = "https://etims-sbx.kra.go.ke";
exports.ETIMS_PRODUCTION_BASE_URL = "https://etims.kra.go.ke";
exports.DEFAULT_UNSPSC_CODE = "50181900"; // General Merchandise / Bakery & Food default
exports.DEFAULT_UNIT_OF_MEASURE = "EA"; // Each / Unit
exports.ETIMS_PAYMENT_METHODS = {
    cash: "01",
    cod: "01",
    card: "03",
    mpesa: "04",
    bank_transfer: "02",
    split: "05",
    pending: "06", // Credit / Pending
};
/**
 * Standard KRA eTIMS QR Verification URL base
 */
exports.KRA_QR_VERIFICATION_BASE_URL = "https://etims.kra.go.ke/common/link/etims/receipt/index.html";
