import React from "react";
import GradingReportsClient from "./GradingReportsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GradingReportsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || (session?.user as any)?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen bg-[#05070A] text-slate-200 p-8 flex items-center justify-center font-sans">
        <p className="text-slate-400">School / Company not found.</p>
      </div>
    );
  }

  const companyId = company.id;

  // Fetch classrooms and terms for this school
  const [classrooms, terms] = await Promise.all([
    prisma.classroom.findMany({
      where: { companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.term.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        academicYear: { select: { name: true } },
      },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const formattedTerms = terms.map((t) => ({
    id: t.id,
    name: `${t.name} ${t.academicYear?.name ? `(${t.academicYear.name})` : ""}`.trim(),
  }));

  return (
    <GradingReportsClient
      companyId={companyId}
      slug={slug}
      initialClassrooms={classrooms}
      initialTerms={formattedTerms}
    />
  );
}
