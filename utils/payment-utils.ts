import { PaymentSettings } from "@prisma/client"; // Or your specific type

export type PublicPaymentMethod = {
  id: "stripe" | "paypal" | "mpesa" | "paystack" | "ghuba";
  label: string;
  isEnabled: boolean;
  meta: Record<string, any>; // Stores public keys only
};

export function getEnabledPaymentMethods(settings: PaymentSettings | null): PublicPaymentMethod[] {
  if (!settings) return [];

  const methods: PublicPaymentMethod[] = [];

  // 1. Ghuba
  if (settings.isGhubaEnabled) {
    methods.push({
      id: "ghuba",
      label: "Ghuba",
      isEnabled: true,
      meta: { merchantId: settings.ghubaMerchantId }, // No API Key here!
    });
  }

  // 2. Stripe
  if (settings.isStripeEnabled) {
    methods.push({
      id: "stripe",
      label: "Credit/Debit Card",
      isEnabled: true,
      meta: { publishableKey: settings.stripePublishableKey }, // No Secret Key!
    });
  }

  // 3. M-Pesa
  if (settings.isMpesaEnabled) {
    methods.push({
      id: "mpesa",
      label: "M-Pesa",
      isEnabled: true,
      meta: { shortcode: settings.mpesaShortcode }, // No Passkey/Secret!
    });
  }

  // 4. PayPal
  if (settings.isPaypalEnabled) {
    methods.push({
      id: "paypal",
      label: "PayPal",
      isEnabled: true,
      meta: { clientId: settings.paypalClientId }, // No Secret!
    });
  }

  // 5. Paystack
  if (settings.isPaystackEnabled) {
    methods.push({
      id: "paystack",
      label: "Paystack",
      isEnabled: true,
      meta: { publicKey: settings.paystackPublicKey }, // No Secret!
    });
  }

  return methods;
}