import MaintenancePageClient from "./MaintenancePageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";
import { formatDistanceToNow } from "date-fns";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MaintenanceSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialTickets: any[] = [];
  let rooms: any[] = [];

  try {
    const [rawTickets, rawRooms] = await Promise.all([
      prisma.hostelMaintenanceRequest.findMany({
        where: { room: { block: { companyId } } },
        include: { 
          room: { 
            select: { 
              roomNumber: true,
              block: { select: { name: true } }
            } 
          },
          reporter: {
            select: { 
              name: true, 
              image: true,
              role: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hostelRoom.findMany({
        where: { block: { companyId } },
        include: { block: { select: { name: true } } },
        orderBy: { roomNumber: 'asc' }
      })
    ]);

    initialTickets = rawTickets.map((t) => ({
      id: `MNT-${t.id.slice(-5).toUpperCase()}`,
      dbId: t.id,
      room: t.room.roomNumber,
      wing: t.room.block.name,
      issue: t.description,
      priority: t.priority,
      status: t.status,
      category: t.category,
      reportedBy: {
        name: t.reporter?.name || "Staff",
        avatar: t.reporter?.image,
        role: t.reporter?.role
      },
      createdAt: t.createdAt.toISOString(),
      timeAgo: formatDistanceToNow(new Date(t.createdAt))
    }));

    rooms = rawRooms.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      wing: r.block?.name || "",
      capacity: r.capacity
    }));
  } catch (err) {
    console.error("[MaintenanceSSRPage] Failed to query maintenance", err);
  }

  return (
    <MaintenancePageClient 
      initialTickets={initialTickets} 
      rooms={rooms} 
      schoolId={companyId} 
    />
  );
}