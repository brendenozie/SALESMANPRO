"use strict";
/**
 * SalesmanPro POS — KRA eTIMS VSCU (Virtual Sales Control Unit) Adapter
 * Suitable for intermittent/offline network environments with queuing and batch synchronization.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCUAdapter = void 0;
const oscuAdapter_1 = require("./oscuAdapter");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
class VSCUAdapter {
    oscu = new oscuAdapter_1.OSCUAdapter();
    async initializeDevice(config) {
        return this.oscu.initializeDevice(config);
    }
    async submitInvoice(config, payload) {
        // Attempt online transmission first
        try {
            const result = await this.oscu.submitInvoice(config, payload);
            if (result.success)
                return result;
        }
        catch (e) {
            // Network unreachable
        }
        // If offline is allowed, queue the transaction
        if (config.offlineAllowed) {
            try {
                await prismadb_1.default.eTIMSSyncEvent.create({
                    data: {
                        companyId: config.companyId,
                        eventType: "SUBMIT_INVOICE",
                        status: "PENDING",
                        payload: JSON.parse(JSON.stringify(payload)),
                        attempts: 1,
                        nextAttemptAt: new Date(Date.now() + 60000), // Retry in 1 minute
                    },
                });
                return {
                    success: true,
                    invoiceNumber: payload.invoiceNumber,
                    status: "QUEUED",
                    scuId: config.deviceId || "VSCU-OFFLINE",
                    controlCode: "OFFLINE-QUEUED",
                    receiptDate: new Date(),
                    requestId: payload.idempotencyKey,
                    errorMessage: "Network unreachable. Transaction queued for KRA eTIMS batch sync.",
                };
            }
            catch (err) {
                console.error("[ETIMS_VSCU] Failed to queue offline invoice:", err);
            }
        }
        // If offline is not permitted, fail with clear compliance error
        return {
            success: false,
            invoiceNumber: payload.invoiceNumber,
            status: "FAILED",
            errorCode: "OFFLINE_NOT_ALLOWED",
            errorMessage: "Cannot reach KRA eTIMS server and offline invoicing is disabled for this store.",
        };
    }
    async submitCreditNote(config, payload) {
        return this.oscu.submitCreditNote(config, payload);
    }
    async checkHealth(config) {
        return this.oscu.checkHealth(config);
    }
}
exports.VSCUAdapter = VSCUAdapter;
