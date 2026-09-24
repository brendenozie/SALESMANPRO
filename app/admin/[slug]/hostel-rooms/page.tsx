import HostelRoomsClient from "./HostelRoomsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelRoomsSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let blocks: any[] = [];
  try {
    const rawBlocks = await prisma.hostelBlock.findMany({
      where: { companyId },
      include: {
        rooms: {
          select: { id: true, roomNumber: true, capacity: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    blocks = rawBlocks.map(block => ({
      ...block,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[HostelRoomsSSRPage] Failed to query blocks", err);
  }

  return (
    <HostelRoomsClient
      initialBlocks={blocks}
      schoolId={companyId}
    />
  );
}