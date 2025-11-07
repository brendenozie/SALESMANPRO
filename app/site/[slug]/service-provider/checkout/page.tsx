// app/checkout/page.tsx
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    listingId?: string;
    name?: string;
    price?: string;
    date?: string;
    timeSlot?: string;
  }>;
}) {
  const params = await searchParams;

  // You can optionally sanitize or prefetch additional data here later
  return <CheckoutClient searchParams={params} />;
}
