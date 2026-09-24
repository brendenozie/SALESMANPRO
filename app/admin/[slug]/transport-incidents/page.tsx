import IncidentPageClient from "./IncidentPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function IncidentPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [records, vehicles] = await Promise.all([
    prisma.transportMaintenance.findMany({
      where: {
        vehicle: { companyId },
        description: { startsWith: "Incident:" },
      },
      include: {
        vehicle: { select: { id: true, registration: true, make: true, model: true } },
      },
      orderBy: { scheduledDate: "desc" },
    }),
    prisma.transportVehicle.findMany({
      where: { companyId },
      select: { id: true, registration: true, model: true },
      orderBy: { registration: "asc" },
    }),
  ]);

  const initialIncidents = records.map((r) => {
    let type = "General Incident";
    let driver = "Assigned Driver";
    let severity = "Medium";

    const desc = r.description.replace(/^Incident:\s*/, "");
    const parts = desc.split("|").map((p) => p.trim());
    if (parts[0]) type = parts[0];
    for (const p of parts) {
      if (p.startsWith("Driver:")) driver = p.replace("Driver:", "").trim();
      if (p.startsWith("Severity:")) severity = p.replace("Severity:", "").trim();
    }

    const statusMap: Record<string, string> = {
      SCHEDULED: "Under Investigation",
      IN_PROGRESS: "Under Investigation",
      COMPLETED: "Resolved",
      CANCELLED: "Logged",
    };

    return {
      id: r.id,
      date: r.scheduledDate.toISOString().split("T")[0],
      bus: r.vehicle?.registration || "Fleet Vehicle",
      type,
      severity: (severity as "High" | "Medium" | "Low") || "Medium",
      status: (statusMap[r.status] as any) || "Logged",
      driver,
      notes: r.notes || r.description,
      hasVideo: false,
      hasPhotos: false,
    };
  });

  return (
    <IncidentPageClient
      initialIncidents={JSON.parse(JSON.stringify(initialIncidents))}
      vehicles={JSON.parse(JSON.stringify(vehicles))}
      schoolId={companyId}
    />
  );
}