// // app/api/academic-levels/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Force the use of Edge if your DB setup allows it
// export const runtime = 'edge'; 

export const GET = withApiHandler(async (req, context) => {
  const { id } = context.params;

  // OPTIMIZATION: Use 'select' to only pull what you need
  // and use a lean findUnique call.
  const academicLevel = await prisma.academicLevel.findUnique({ 
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      sortOrder: true,
      // Avoid fetching massive 'createdAt' or 'updatedAt' if not needed
    }
  });

  if (!academicLevel) {
    return formatResponse(false, null, "Not found", 404);
  }

  // OPTIMIZATION: Add Cache-Control headers so the browser/CDN can help
  const response = formatResponse(true, academicLevel, "Fetched", 200);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  
  return response;
});

export const PATCH = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();
  
  // OPTIMIZATION: Data validation before hitting the DB
  if (!body.name) return formatResponse(false, null, "Name is required", 400);

  const updated = await prisma.academicLevel.update({
    where: { id },
    data: { 
      name: body.name, 
      description: body.description, 
      sortOrder: body.sortOrder 
    },
  });

  return formatResponse(true, updated, "Updated", 200);
});
// import prisma from "@/server/db/prismadb";
// import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { VerifiedUser } from "@/lib/verifyAuth"; 

// // Define a consistent type for the context that our handlers will receive.
// type HandlerContext = {
//   params: any;
//   user?: VerifiedUser; // Use the imported type here
// };

// export const GET = withApiHandler(async (req: Request, context: HandlerContext) => {
//   // No need to check for the user's existence!
//   // The withApiHandler wrapper guarantees that 'context.user' is present.
//   const { user } = context;
//   const { id } = context.params;

//   const academicLevel = await prisma.academicLevel.findUnique({ where: { id } });
//   if (!academicLevel) {
//     return formatResponse(false, null, "Academic level not found", 404);
//   }

//   return formatResponse(true, academicLevel, "Fetched successfully", 200);
// });

// export const PATCH = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const body = await request.json();
//   const { name, description, sortOrder } = body;

//   const updatedAcademicLevel = await prisma.academicLevel.update({
//     where: { id },
//     data: { name, description, sortOrder },
//   });

//   return formatResponse(true, updatedAcademicLevel, "Updated successfully", 200);
// });

// export const DELETE = withApiHandler(async (request, context) => {
//   const { id } = context.params;

//   const deleted = await prisma.academicLevel.delete({ where: { id } });
//   return formatResponse(true, { deletedId: deleted.id }, "Deleted successfully", 200);
// });
