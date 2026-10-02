import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Legacy companyPaymentsDashboard entrypoint.
 * Automatically forwards to the unified, authoritative Store Payments & Settlement system.
 */
export default async function CompanyPaymentsPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/admin/${slug}/payments`);
}