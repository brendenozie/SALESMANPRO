import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const searchProfilesLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("companyId");
  const type = searchParams.get("type"); // "STUDENT" or "EDUCATOR"

  if (!companyId) return formatResponse(false, null, "Company ID is required.", 400);
  if (query.length < 2) return formatResponse(true, [], "Query too short", 200);

  let results = [];

  if (type === "STUDENT") {
    const students = await prisma.student.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { admissionNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });
    
    // Normalize Student data for the UI
    results = students.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      identifier: s.admissionNumber,
      subtext: s.currentClass || "No Class Assigned",
      type: "STUDENT"
    }));

  } else {
    const educators = await prisma.educator.findMany({
      where: {
        companyId,
        OR: [
          { user: { name: { contains: query, mode: "insensitive" } } },
          { loginCode: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { user: { select: { name: true, email: true } } },
      take: 10,
    });

    // Normalize Educator data for the UI
    results = educators.map(e => ({
      id: e.id,
      name: e.user?.name || "Unknown Educator",
      identifier: e.loginCode,
      subtext: e.specialty || "Staff",
      type: "EDUCATOR"
    }));
  }

  return formatResponse(true, results, "Profiles found", 200);
};

export const GET = withApiHandler(searchProfilesLogic, { requireAuth: true });