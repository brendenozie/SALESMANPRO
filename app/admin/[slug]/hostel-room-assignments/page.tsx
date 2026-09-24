import RoomAssignmentsClient from "./RoomAssignmentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomAssignmentsSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let unassigned: any[] = [];
  let rooms: any[] = [];

  try {
    const [unassignedStudents, unassignedEducators, rawRooms] = await Promise.all([
      prisma.student.findMany({
        where: {
          companyId,
          OR: [
            { hostelMember: { is: null } },
            { hostelMember: { hostelAllocations: { none: { status: "ACTIVE" } } } }
          ]
        },
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          admissionNumber: true,
        },
        take: 30
      }),
      prisma.educator.findMany({
        where: {
          companyId,
          OR: [
            { hostelMember: { is: null } },
            { hostelMember: { hostelAllocations: { none: { status: "ACTIVE" } } } }
          ]
        },
        select: {
          id: true,
          loginCode: true,
          user: { select: { name: true } }
        },
        take: 20
      }),
      prisma.hostelRoom.findMany({
        where: { block: { companyId } },
        include: {
          block: { select: { name: true } },
          allocations: {
            where: { status: "ACTIVE" },
            include: { 
              hostelMember: {
                include: { 
                  student: { select: { firstName: true, lastName: true } },
                  educator: { include: { user: { select: { name: true } } } }
                } 
              } 
            }
          }
        },
        orderBy: { roomNumber: "asc" }
      })
    ]);

    unassigned = [
      ...unassignedStudents.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        idNumber: s.admissionNumber || "N/A",
        type: "STUDENT"
      })),
      ...unassignedEducators.map(e => ({
        id: e.id,
        name: e.user?.name || "Staff Member",
        idNumber: e.loginCode || "N/A",
        type: "STAFF"
      }))
    ];

    rooms = rawRooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      floor: room.floor,
      wing: room.block.name,
      occupancy: room.allocations.length,
      residents: room.allocations.map(alloc => ({
        allocationId: alloc.id,
        name: alloc.hostelMember?.student 
          ? `${alloc.hostelMember.student.firstName} ${alloc.hostelMember.student.lastName}`
          : alloc.hostelMember?.educator?.user?.name || `${alloc.hostelMember?.memberId}`,
        type: alloc.hostelMember?.student ? "STUDENT" : "STAFF",
        joinedAt: alloc.startDate.toISOString()
      }))
    }));
  } catch (err) {
    console.error("[RoomAssignmentsSSRPage] Failed to query assignments", err);
  }

  return (
    <RoomAssignmentsClient 
      initialUnassigned={unassigned} 
      initialRooms={rooms} 
      schoolId={companyId} 
    />
  );
}