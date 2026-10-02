/**
 * lib/automation/playwright/adapters/index.ts
 *
 * Central Adapter Registry for SalesmanPro Provider Onboarding & Health Checks.
 */

import { ProviderAdapter } from './types';
import { groqAdapter } from './groqAdapter';
import { openAiAdapter } from './openAiAdapter';
import { googleGeminiAdapter } from './googleGeminiAdapter';
import { metaWhatsappAdapter } from './metaWhatsappAdapter';
import { mpesaAdapter } from './mpesaAdapter';
import { paystackAdapter } from './paystackAdapter';
import { stripeAdapter } from './stripeAdapter';
import { s3Adapter } from './s3Adapter';
import { smtpAdapter } from './smtpAdapter';
import { ProviderValidationResult } from '../types';

export class AdapterRegistry {
  private static instance: AdapterRegistry;
  private adapters: Map<string, ProviderAdapter> = new Map();

  private constructor() {
    this.register(groqAdapter);
    this.register(openAiAdapter);
    this.register(googleGeminiAdapter);
    this.register(metaWhatsappAdapter);
    this.register(mpesaAdapter);
    this.register(paystackAdapter);
    this.register(stripeAdapter);
    this.register(s3Adapter);
    this.register(smtpAdapter);
  }

  public static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  public register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.metadata.providerId, adapter);
  }

  public getAdapter(providerId: string): ProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public getAllAdapters(): ProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Run verification check across all registered adapters or a specific subset.
   */
  public async verifyAll(
    credentialsOverrides: Record<string, string> = {}
  ): Promise<ProviderValidationResult[]> {
    const results: ProviderValidationResult[] = [];
    for (const adapter of this.adapters.values()) {
      try {
        const res = await adapter.verifyCredentials(credentialsOverrides);
        results.push(res);
      } catch (err: any) {
        results.push({
          providerId: adapter.metadata.providerId,
          success: false,
          testedAt: new Date().toISOString(),
          environment: (process.env.NODE_ENV as any) || 'development',
          credentialStatus: 'INVALID',
          message: `Unexpected error during verification: ${err.message}`,
        });
      }
    }
    return results;
  }
}

export const adapterRegistry = AdapterRegistry.getInstance();
export {
  groqAdapter,
  openAiAdapter,
  googleGeminiAdapter,
  metaWhatsappAdapter,
  mpesaAdapter,
  paystackAdapter,
  stripeAdapter,
  s3Adapter,
  smtpAdapter,
};
