import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import LoyaltyProgramClient from "./LoyaltyProgramClient";

export const metadata = { title: "Loyalty & Rewards Programme | SalesMan Pro" };

export default async function LoyaltyProgramPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const company = await prisma.company.findFirst({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!company) redirect("/dashboard");

  return <LoyaltyProgramClient companyId={company.id} slug={params.slug} />;
}
