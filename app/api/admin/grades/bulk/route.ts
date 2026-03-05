import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const POST = withApiHandler(async (request, context) => {
  const { grades } = await request.json(); // Array of { studentId, examId, score, etc. }
  const companyId = context.user?.companyId;

  // Optimized Database Transaction
  const operations = grades.map((g: any) => 
    prisma.grade.upsert({
      where: {
        // Assuming a unique constraint on student + exam
        studentId_examId: { studentId: g.studentId, examId: g.examId }
      },
      update: { score: g.score },
      create: { ...g, companyId }
    })
  );

  await prisma.$transaction(operations);

  return formatResponse(true, null, "All grades updated", 200);
}, { requireAuth: true });