/**
 * SalesmanPro POS — KRA eTIMS Provider Interface
 */

import { ETIMSFiscalResult, ETIMSInvoicePayload } from "./types";
import { KraConfiguration } from "@prisma/client";

export interface ETIMSHandshakeResult {
  success: boolean;
  cmcKey?: string;
  deviceId?: string;
  branchName?: string;
  taxpayerName?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ETIMSProvider {
  /**
   * Perform initial device handshake with KRA to negotiate session keys (cmcKey)
   */
  initializeDevice(config: KraConfiguration): Promise<ETIMSHandshakeResult>;

  /**
   * Submit sales fiscal invoice to KRA
   */
  submitInvoice(config: KraConfiguration, payload: ETIMSInvoicePayload): Promise<ETIMSFiscalResult>;

  /**
   * Submit fiscal credit note to KRA
   */
  submitCreditNote(config: KraConfiguration, payload: ETIMSInvoicePayload): Promise<ETIMSFiscalResult>;

  /**
   * Check connection health with KRA server
   */
  checkHealth(config: KraConfiguration): Promise<{ ok: boolean; message: string; latencyMs: number }>;
}
