/**
 * SalesmanPro POS — KRA eTIMS VSCU (Virtual Sales Control Unit) Adapter
 * Suitable for intermittent/offline network environments with queuing and batch synchronization.
 */

import { ETIMSFiscalResult, ETIMSInvoicePayload } from "./types";
import { ETIMSHandshakeResult, ETIMSProvider } from "./provider";
import { KraConfiguration } from "@prisma/client";
import { OSCUAdapter } from "./oscuAdapter";
import prisma from "@/server/db/prismadb";

export class VSCUAdapter implements ETIMSProvider {
  private oscu = new OSCUAdapter();

  async initializeDevice(config: KraConfiguration): Promise<ETIMSHandshakeResult> {
    return this.oscu.initializeDevice(config);
  }

  async submitInvoice(config: KraConfiguration, payload: ETIMSInvoicePayload): Promise<ETIMSFiscalResult> {
    // Attempt online transmission first
    try {
      const result = await this.oscu.submitInvoice(config, payload);
      if (result.success) return result;
    } catch (e) {
      // Network unreachable
    }

    // If offline is allowed, queue the transaction
    if (config.offlineAllowed) {
      try {
        await prisma.eTIMSSyncEvent.create({
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
      } catch (err: any) {
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

  async submitCreditNote(config: KraConfiguration, payload: ETIMSInvoicePayload): Promise<ETIMSFiscalResult> {
    return this.oscu.submitCreditNote(config, payload);
  }

  async checkHealth(config: KraConfiguration): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    return this.oscu.checkHealth(config);
  }
}
