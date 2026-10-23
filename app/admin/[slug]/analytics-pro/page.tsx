import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AnalyticsDashboardClient from "./AnalyticsDashboardClient";

export const metadata = { title: "Advanced Analytics | SalesMan Pro" };

export default async function AdvancedAnalyticsPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const company = await prisma.company.findFirst({ where: { slug: params.slug }, select: { id: true } });
  if (!company) redirect("/dashboard");
  return <AnalyticsDashboardClient companyId={company.id} slug={params.slug} />;
}
