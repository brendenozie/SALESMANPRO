import HostelBlocksPage from "./HostelBlocksPage";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HostelBlocksSSRPage({ params }: PageProps) {
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
        _count: { select: { rooms: true } },
        rooms: {
          select: {
            capacity: true,
            allocations: { where: { status: "ACTIVE" } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    blocks = rawBlocks.map(block => ({
      ...block,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      roomCount: block._count.rooms,
      totalCapacity: block.rooms.reduce((acc, room) => acc + room.capacity, 0),
      totalOccupancy: block.rooms.reduce((acc, room) => acc + room.allocations.length, 0),
    }));
  } catch (err) {
    console.error("[HostelBlocksSSRPage] Failed to query blocks", err);
  }

  return (
    <HostelBlocksPage
      initialBlocks={blocks}
      schoolId={companyId}
    />
  );
}