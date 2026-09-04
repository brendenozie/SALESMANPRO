/**
 * lib/email/providers/IEmailProvider.ts
 *
 * Generic interface for low-level email dispatch implementations.
 */

import { EmailPayload, EmailProviderType, EmailSendResult } from "../types";

export interface IEmailProvider {
  readonly providerType: EmailProviderType;

  /**
   * Sends an email payload through the provider gateway.
   */
  send(payload: EmailPayload): Promise<EmailSendResult>;

  /**
   * Tests and validates provider credentials/connectivity without sending a live email.
   */
  verifyConnection(): Promise<{ success: boolean; error?: string }>;
}
