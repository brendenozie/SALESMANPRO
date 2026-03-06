import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/sales-agents/[agentId]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const POST = withApiHandler(async (request, context) => {
  const { grades } = await request.json(); // Array of { studentId, examId, score, etc. }
  // const companyId = context.user?.companyId;

  // Optimized Database Transaction
  await prisma.$transaction(async (tx) => {
    await Promise.all(
      grades.map(async (g: any) => {
        const existing = await tx.grade.findFirst({
          where: {
            studentId: g.studentId,
            courseId: g.courseId,
            examId: g.examId
          }
        });

        if (existing) {
          await tx.grade.update({
            where: { id: existing.id },
            data: { score: g.score }
          });
        } else {
          await tx.grade.create({
            data: { ...g, companyId: g.companyId }
          });
        }
      })
    );
  });

  return formatResponse(true, null, "All grades updated", 200);
}, { requireAuth: true });