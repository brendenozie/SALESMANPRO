import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import BarcodeLabelStudioClient from "./BarcodeLabelStudioClient";

export const metadata = { title: "Barcode & Shelf Label Studio | SalesMan Pro" };

export default async function BarcodeLabelsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const company = await prisma.company.findFirst({
    where: { slug },
    select: { id: true, name: true, currency: true },
  });

  if (!company) redirect("/dashboard");

  return (
    <BarcodeLabelStudioClient
      companyId={company.id}
      companyName={company.name}
      slug={slug}
      currency={company.currency || "KES"}
    />
  );
}
