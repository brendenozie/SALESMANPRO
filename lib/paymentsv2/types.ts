// lib/payments/types.ts
export type Provider = "ghuba" | "mpesa" | "paystack" | "stripe" | "paypal" | "none";

export type ProviderConfig = {
  provider: Provider;
  credentials: Record<string, any>;
  rawSettings?: any | null;
};
