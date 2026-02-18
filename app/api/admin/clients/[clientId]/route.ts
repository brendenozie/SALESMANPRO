import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // // app/api/admin/clients/[id]/route.ts
// app/api/admin/clients/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


const clientSelect = {
  id: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
};


const getClient = async (
  _req: Request,
  context: { params: { id: string }; user?: any }
) => {
  const clientId = context.params.id;

  if (!clientId) {
    return formatResponse(false, null, "Missing client id", 400);
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      companyId: context.user.companyId, // 🔒 tenant isolation
    },
    select: clientSelect,
  });

  if (!client) {
    return formatResponse(false, null, "Client not found", 404);
  }

  return formatResponse(true, {
    id: client.id,
    name: client.user.name,
    email: client.user.email,
    phoneNumber: client.user.phone,
    totalPurchases: 0, // extend later with aggregates
    lastPurchaseDate: null,
    averageOrderValue: 0,
  });
};


const updateClient = async (
  req: Request,
  context: { params: { id: string }; user?: any }
) => {
  const clientId = context.params.id;
  if (!clientId) {
    return formatResponse(false, null, "Missing client id", 400);
  }

  const { name, email, phoneNumber } = await req.json();

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      companyId: context.user.companyId,
    },
    select: { userId: true },
  });

  if (!client) {
    return formatResponse(false, null, "Client not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: client.userId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phoneNumber && { phone: phoneNumber }),
    },
  });

  return formatResponse(true, {
    id: clientId,
    name: updatedUser.name,
    email: updatedUser.email,
    phoneNumber: updatedUser.phone,
    totalPurchases: 0,
    lastPurchaseDate: null,
    averageOrderValue: 0,
  });
};


const deleteClient = async (
  _req: Request,
  context: { params: { id: string }; user?: any }
) => {
  const clientId = context.params.id;
  if (!clientId) {
    return formatResponse(false, null, "Missing client id", 400);
  }

  await prisma.client.delete({
    where: {
      id: clientId,
      companyId: context.user.companyId,
    },
  });

  return formatResponse(true, null, "Client deleted successfully", 204);
};


export const GET = withApiHandler(getClient, { requireAuth: true });
export const PATCH = withApiHandler(updateClient, { requireAuth: true });
export const DELETE = withApiHandler(deleteClient, { requireAuth: true });



//   if (!client) return null;

//   // OPTIMIZATION: Pull real purchase stats in a single pass
//   const stats = await prisma.request.aggregate({
//     where: { requesterId: clientId, status: "COMPLETED" },
//     _sum: { totalAmount: true }, // Assuming 'totalAmount' exists on requests
//     _max: { createdAt: true },
//     _avg: { totalAmount: true }
//   });

//   return {
//     id: client.id,
//     name: client.user.name,
//     email: client.user.email,
//     phoneNumber: client.user.phone,
//     totalPurchases: stats._sum.totalAmount || 0,
//     lastPurchaseDate: stats._max.createdAt || null,
//     averageOrderValue: stats._avg.totalAmount || 0,
//     requestCount: client._count.requests
//   };
// }

// // GET /api/admin/clients/[id]
// async function getClient(_req: Request, context: { params: { id: string }, user?: any }) {
//   const companyId = context.user?.companyId;
//   const data = await getFullClientData(context.params.id, companyId);
  
//   if (!data) return formatResponse(false, null, "Client not found", 404);
//   return formatResponse(true, data);
// }

// // PATCH /api/admin/clients/[id]
// async function updateClient(request: Request, context: { params: { id: string }, user?: any }) {
//   const companyId = context.user?.companyId;
//   const body = await request.json();
//   const { name, email, phoneNumber } = body;

//   try {
//     // OPTIMIZATION: Atomic Update through the relation
//     // This updates the User record linked to this Client in one DB trip
//     await prisma.client.update({
//       where: { id: context.params.id, companyId },
//       data: {
//         user: {
//           update: {
//             ...(name && { name }),
//             ...(email && { email }),
//             ...(phoneNumber && { phone: phoneNumber }),
//           }
//         }
//       }
//     });

//     const updatedData = await getFullClientData(context.params.id, companyId);
//     return formatResponse(true, updatedData, "Client updated successfully");
//   } catch (err: any) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
//       return formatResponse(false, null, "Client not found", 404);
//     }
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// // DELETE /api/admin/clients/[id]
// async function deleteClient(_req: Request, context: { params: { id: string }, user?: any }) {
//   const companyId = context.user?.companyId;
//   try {
//     // Note: This only works if your schema has onDelete: Cascade for the User relation
//     // Otherwise, you should delete the User record specifically.
//     await prisma.client.delete({ 
//       where: { id: context.params.id, companyId } 
//     });
//     return formatResponse(true, null, "Client deleted successfully", 200);
//   } catch (err: any) {
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// export const GET = withApiHandler(getClient, { requireAuth: true });
// export const PATCH = withApiHandler(updateClient, { requireAuth: true });
// export const DELETE = withApiHandler(deleteClient, { requireAuth: true });
// import { NextResponse } from "next/server";
 {
//   const clientId = context.params.id;
//   if (!clientId) {
//     return formatResponse(false, null, "Missing client id", 400);
//   }

//   try {
//     const client = await prisma.client.findUnique({
//       where: { id: clientId },
//       include: {
//         user: { select: { name: true, email: true, phone: true } },
//       },
//     });

//     if (!client) {
//       return formatResponse(false, null, "Client not found", 404);
//     }

//     return formatResponse(true, {
//       id: client.id,
//       name: client.user.name,
//       email: client.user.email,
//       phoneNumber: client.user.phone,
//       totalPurchases: 0, // could be aggregated later
//       lastPurchaseDate: null,
//       averageOrderValue: 0,
//     });
//   } catch (err: any) {
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// async function updateClient(request: Request, context : {
//     params: { id: string };
//   }) {
//   const clientId = context.params.id;
//   if (!clientId) {
//     return formatResponse(false, null, "Missing client id", 400);
//   }

//   const body = await request.json();
//   const { name, email, phoneNumber } = body;

//   try {
//     const existing = await prisma.client.findUnique({
//       where: { id: clientId },
//       select: { userId: true },
//     });

//     if (!existing) {
//       return formatResponse(false, null, "Client not found", 404);
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: existing.userId },
//       data: {
//         name,
//         email,
//         phone: phoneNumber,
//       },
//     });

//     return formatResponse(true, {
//       id: clientId,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       phoneNumber: updatedUser.phone,
//       totalPurchases: 0,
//       lastPurchaseDate: null,
//       averageOrderValue: 0,
//     },);
//   } catch (err: any) {
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// async function deleteClient(_req: Request, context : {
//     params: { id: string };
//   }) {
//   const clientId = context.params.id;
//   if (!clientId) {
//     return formatResponse(false, null, "Missing client id", 400);
//   }

//   try {
//     await prisma.client.delete({ where: { id: clientId } });
//     return formatResponse(true, null, "Client deleted successfully", 204);
//   } catch (err: any) {
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// export const GET = withApiHandler(getClient, { requireAuth: true });
// export const PATCH = withApiHandler(updateClient, { requireAuth: true });
// export const DELETE = withApiHandler(deleteClient, { requireAuth: true });
