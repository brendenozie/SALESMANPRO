import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || "";
  const companyId = searchParams.get('companyId');

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  try {
    // Search Students
    const students = await prisma.student.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: { select: { image: true } }
      },
      take: 5
    });

    // Search Educators
    const educators = await prisma.educator.findMany({
      where: {
        companyId,
        user: {
          name: { contains: query, mode: 'insensitive' }
        }
      },
      select: {
        id: true,
        user: { select: { name: true, image: true } }
      },
      take: 5
    });

    // Merge into a unified format for the UI
    const results = [
      ...students.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        type: 'STUDENT',
        image: s.user?.image
      })),
      ...educators.map(e => ({
        id: e.id,
        name: e.user?.name,
        type: 'EDUCATOR',
        image: e.user?.image
      }))
    ];

    return formatResponse(true, results);
  } catch (error) {
    return formatResponse(false, null, "Search failed", 500);
  }
}