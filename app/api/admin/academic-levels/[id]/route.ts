// app/api/academic-levels/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { VerifiedUser } from "@/lib/verifyAuth"; 

// Define a consistent type for the context that our handlers will receive.
type HandlerContext = {
  params: any;
  user?: VerifiedUser; // Use the imported type here
};

export const GET = withApiHandler(async (req: Request, context: HandlerContext) => {
  // No need to check for the user's existence!
  // The withApiHandler wrapper guarantees that 'context.user' is present.
  const { user } = context;
  const { id } = context.params;

  const academicLevel = await prisma.academicLevel.findUnique({ where: { id } });
  if (!academicLevel) {
    return formatResponse(false, null, "Academic level not found", 404);
  }

  return formatResponse(true, academicLevel, "Fetched successfully", 200);
});

export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();
  const { name, description, sortOrder } = body;

  const updatedAcademicLevel = await prisma.academicLevel.update({
    where: { id },
    data: { name, description, sortOrder },
  });

  return formatResponse(true, updatedAcademicLevel, "Updated successfully", 200);
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;

  const deleted = await prisma.academicLevel.delete({ where: { id } });
  return formatResponse(true, { deletedId: deleted.id }, "Deleted successfully", 200);
});
