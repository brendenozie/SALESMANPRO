import IssuanceManagementClient from "./IssuanceManagementClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryAuditsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [audits, assetTracking] = await Promise.all([
    prisma.inventoryAudit.findMany({
      where: { companyId },
      include: { conductor: true },
      orderBy: { auditDate: "desc" },
    }).catch(() => []),
    prisma.assetTracking.findMany({
      where: { asset: { companyId } },
      include: { asset: true, performer: true },
      orderBy: { date: "desc" },
    }).catch(() => []),
  ]);

  const mappedRecords: any[] = [];

  audits.forEach((audit) => {
    mappedRecords.push({
      id: `AUD-${audit.id.slice(-6).toUpperCase()}`,
      item: audit.findings || "Comprehensive Stock Audit",
      staff: audit.conductor?.name || "School Auditor",
      dept: "Operations & Stores",
      date: new Date(audit.auditDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: "Audit Verification",
      status: audit.status,
    });
  });

  assetTracking.forEach((track) => {
    mappedRecords.push({
      id: `TRK-${track.id.slice(-6).toUpperCase()}`,
      item: track.asset?.name || "Equipment Unit",
      staff: track.performer?.name || "Custody Staff",
      dept: track.asset?.location || "Campus Facility",
      date: new Date(track.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: track.action,
      status: track.action === "ASSIGNMENT" ? "In Use" : track.action === "MAINTENANCE" ? "Under Service" : "Returned",
    });
  });

  return (
    <IssuanceManagementClient
      initialRecords={JSON.parse(JSON.stringify(mappedRecords))}
      schoolId={companyId}
    />
  );
}