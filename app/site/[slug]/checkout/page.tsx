import { Metadata } from "next";
import GhubaCheckoutClient from "@/components/ghuba/checkout/GhubaCheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout | Ghuba",
  description: "Complete your order securely with flexible payment options.",
};

export default function SiteSlugCheckoutPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <GhubaCheckoutClient />
    </main>
  );
}
