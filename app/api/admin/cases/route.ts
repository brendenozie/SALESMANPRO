import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // // app/api/admin/fees/route.ts
// app/api/admin/fees/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";


const caseSelect = {
  id: true,
  title: true,
  description: true,
  caseType: true,
  status: true,
  createdAt: true,

  client: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },

  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};


const getCases = async (req: Request, context: { user?: any }) => {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const companyId = searchParams.get("companyId") || context.user?.companyId; // Allow filtering by companyId, default to user's company
  const skip = (page - 1) * limit;

    const status = searchParams.get("status");

    const where: any = {
      companyId: companyId,
      ...(status && { status }),
    };

    const cacheKey = `admin:cases:${companyId}:page:${page}:limit:${limit}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {}

    // OPTIMIZATION: Run count and fetch in parallel

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where: where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: caseSelect,
    }),
    prisma.case.count({
      where: where,
    }),
  ]);

  // Cache the result for 1 minute
  try {
    await cacheSet(cacheKey, { data: cases, meta: { page, limit, total, totalPages: Math.ceil(total / limit), } }, 60);
  } catch (e) {}

  return NextResponse.json(
    {
      data: cases,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: 200 }
  );
};


const createCase = async (req: Request, context: { user?: any }) => {
  const body = await req.json();

  const {
    title,
    description,
    clientId,
    assignedToUserId,
    caseType,
    status,
    companyId,
  } = body;

  if (!title || !clientId || !caseType) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  const newCase = await prisma.case.create({
    data: {
      title,
      description,
      clientId,
      assignedToUserId,
      caseType,
      status: status ?? "OPEN",
      companyId: companyId, // 🔒 never trust client
      // createdById: context.user.id,
    },
    select: caseSelect,
  });

    // Invalidate relevant caches
  try {    await cacheDel(`admin:cases:${companyId}:*`); // Invalidate all cases list caches for this company
  } catch (e) {}

  return NextResponse.json(newCase, { status: 201 });
};


export const GET = withApiHandler(getCases, {
  requireAuth: true,
  requireRateLimit: true,
});

export const POST = withApiHandler(createCase, {
  requireAuth: true,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
//  => {
//   const { searchParams } = new URL(req.url);
//   const companyId = context.user?.companyId;
  
//   // Pagination params
//   const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
//   const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
//   const status = searchParams.get("status");

//   if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

//   // OPTIMIZATION: Run count and fetch in parallel
//   const [total, cases] = await Promise.all([
//     prisma.case.count({ where: { companyId, ...(status && { status }) } }),
//     prisma.case.findMany({
//       where: { 
//         companyId,
//         ...(status && { status }) 
//       },
//       take: limit,
//       skip: (page - 1) * limit,
//       orderBy: { createdAt: "desc" },
//       select: {
//         id: true,
//         title: true,
//         status: true,
//         caseType: true,
//         createdAt: true,
//         client: {
//           select: {
//             id: true,
//             user: { select: { name: true, image: true } }
//           }
//         },
//         assignedTo: {
//           select: { id: true, name: true, image: true }
//         }
//       }
//     })
//   ]);

//   return formatResponse(true, {
//     cases,
//     pagination: {
//       total,
//       pages: Math.ceil(total / limit),
//       currentPage: page
//     }
//   }, "Cases fetched successfully", 200);
// };

// // ✅ POST new case with Secure Injection
// const createCase = async (req: Request, context: { user?: any }) => {
//   const body = await req.json();
//   const companyId = context.user?.companyId;

//   if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

//   const { title, description, clientId, assignedToUserId, caseType, status } = body;

//   // Validation
//   if (!title || !clientId) {
//     return formatResponse(false, null, "Title and Client ID are required", 400);
//   }

//   const newCase = await prisma.case.create({
//     data: {
//       title,
//       description,
//       clientId,
//       assignedToUserId,
//       caseType,
//       status: status || "OPEN",
//       companyId, // OPTIMIZATION: Injected from verified user context
//     },
//     select: {
//       id: true,
//       title: true,
//       createdAt: true
//     }
//   });

//   return formatResponse(true, newCase, "Case created successfully", 201);
// };

// export const GET = withApiHandler(getCases, { requireAuth: true, requireRateLimit: true });
// export const POST = withApiHandler(createCase, { requireAuth: true, requireRateLimit: true });
// import { NextResponse } from "next/server";
//  => {
//   const cases = await prisma.case.findMany({
//     include: {
//       client: {
//         include: { user: true },
//       },
//       assignedTo: true,
//     },
//   });

//   return NextResponse.json(cases, { status: 200 });
// };

// // --- POST new case
// const createCase = async (req: Request, context: { user?: any }) => {
//   const body = await req.json();
//   const {
//     title,
//     description,
//     clientId,
//     assignedToUserId,
//     caseType,
//     status,
//     companyId,
//   } = body;

//   const newCase = await prisma.case.create({
//     data: {
//       title,
//       description,
//       clientId,
//       assignedToUserId,
//       caseType,
//       status,
//       companyId,
//     },
//     include: {
//       client: {
//         include: { user: true },
//       },
//       assignedTo: true,
//     },
//   });

//   return NextResponse.json(newCase, { status: 201 });
// };

// // ✅ Export wrapped handlers
// export const GET = withApiHandler(getCases, {
//   requireAuth: true,
//   requireRateLimit: true,
// });

// export const POST = withApiHandler(createCase, {
//   requireAuth: true,
//   requireRateLimit: true,
// });
