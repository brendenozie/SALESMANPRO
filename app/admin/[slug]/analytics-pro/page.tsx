import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Executive Analytics | SalesMan Pro" };

export default async function AdvancedAnalyticsPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/admin/${slug}/analytics`);
}
