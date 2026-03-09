import { loadStore } from '@/lib/loadStore';
import { getEnabledPaymentMethods } from '@/utils/payment-utils';
import CheckoutClient from './CheckoutClient'; // Import the new client component

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutRoute({ params }: PageProps) {
  const { slug } = await params;

  // 1. Load the store data (Server-side Only)
  const { raw } = await loadStore(slug);

  // 2. Filter the payment methods securely (Server-side Only)
  // This prevents sending secret keys to the client
  const enabledPaymentMethods = getEnabledPaymentMethods(raw.PaymentSettings);

  const shippingSettings = raw.ShippingSettings || {};

  // 3. Render the Client Component with the data
  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full">
      <CheckoutClient paymentMethods={enabledPaymentMethods} shippingSettings={shippingSettings} />
    </main>
  );
}