import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import {
  getFeeItemsByCompany,
  createFeeItem,
  updateFeeItem,
  deleteFeeItem,
  FeeItem,
} from "@/lib/data";

// =======================================================================
// GET /api/admin/fee-items?companyId=xxx
// =======================================================================
async function handleGetFeeItems(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const feeItems = await getFeeItemsByCompany(companyId);

  try {
    if (feeItems) {
      await cacheSet(`admin:fee-items:${companyId || 'global'}:all`, feeItems, 60);
    }
  } catch (e) {}

  return formatResponse(true, feeItems, null, 200);
}

// =======================================================================
// POST /api/admin/fee-items
// =======================================================================
async function handlePostFeeItem(request: Request) {
  const body = await request.json();

  const {
    name,
    description,
    defaultAmount,
    currency = "USD",
    applicableTo,
    academicLevelIds = [],
    classroomIds = [],
    isMandatory = true,
    companyId,
    academicYear,
    term,
  } = body;

  if (!name || defaultAmount === undefined || !applicableTo || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  // 🔐 Validation rules
  if (applicableTo === "ACADEMIC_LEVEL" && academicLevelIds.length === 0) {
    return formatResponse(false, null, "Select at least one academic level", 400);
  }

  if (applicableTo === "CLASS" && classroomIds.length === 0) {
    return formatResponse(false, null, "Select at least one classroom", 400);
  }

  try {
    const item = await createFeeItem({
      name,
      description,
      defaultAmount,
      currency,
      applicableTo,
      academicLevelIds:
        applicableTo !== "ALL" ? academicLevelIds : [],
      classroomIds:
        applicableTo === "CLASS" ? classroomIds : [],
      isMandatory,
      companyId,
      academicYear,
      term,
    });

    try { await cacheDel(`admin:fee-items:${companyId || 'global'}:*`); } catch (e) {}
    
    return formatResponse(true, item, null, 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return formatResponse(
        false,
        null,
        "Fee item with this name already exists",
        409
      );
    }
    throw error;
  }
}

// async function handlePostFeeItemV1(request: Request) {
//   const body = await request.json();

//   const {
//     name,
//     description,
//     defaultAmount,
//     currency = "USD",
//     applicableTo,
//     applicableRef,
//     academicYear,
//     term,
//     isMandatory = true,
//     companyId,
//   } = body;

//   if (!name || defaultAmount === undefined || !applicableTo || !companyId) {
//     return formatResponse(false, null, "Missing required fields", 400);
//   }

//   try {
//     const item = await createFeeItem({
//       name,
//       description,
//       defaultAmount,
//       currency,
//       applicableTo,
//       applicableRef,
//       academicYear,
//       term,
//       isMandatory,
//       companyId,
//     } as any);

//     return formatResponse(true, item, null, 201);
//   } catch (error: any) {
//     if (error.code === "P2002") {
//       return formatResponse(
//         false,
//         null,
//         "Fee item with this name already exists",
//         409
//       );
//     }
//     throw error;
//   }
// }

export const GET = withApiHandler(handleGetFeeItems);
export const POST = withApiHandler(handlePostFeeItem);


// import { withApiHandler } from '@/lib/hooks/withApiHandler';
// import { formatResponse } from '@/lib/formatResponse';
// import { getFeeItems, createFeeItem, FeeItem } from '../../../../lib/data'; // Adjust path for data
// import { verifyAuth } from '@/lib/verifyAuth';

// // =======================================================================
// // GET /api/admin/fee-items
// // Handles GET requests for all fee items
// // =======================================================================
// async function handleGetFeeItems(request: Request) {
//   // 1. Authentication Check
  
//   // const user = await verifyAuth(request);

//   // if (!user) {
//   //   return formatResponse(false, null, 'Unauthorized', 401);
//   // }

//   // const schoolId = request.headers.get('x-school-id');

//   // if (!schoolId) {
//   //   return formatResponse(false, null, 'Missing school ID in headers.', 400);
//   // }

//   // 2. Business Logic
//   const feeItems = await getFeeItems();

//   // 3. Success Response
//   return formatResponse(true, feeItems, null, 200);
// }

// // =======================================================================
// // POST /api/admin/fee-items
// // Handles POST requests for creating a new fee item
// // =======================================================================
// async function handlePostFeeItem(request: Request) {
//   // 1. Authentication Check
  


//   // 2. Parse Body and Validation
//   const body: Omit<FeeItem, 'id'> = await request.json();
//   const { name, description, defaultAmount, applicableTo, applicableValue, academicYear, term, isMandatory } = body;

//   if (!name || defaultAmount === undefined || !applicableTo) {
//     return formatResponse(false, null, 'Missing required fee item fields.', 400);
//   }

//   // 3. Business Logic
//   try {
//     const newFeeItem = await createFeeItem({
//       name, description, defaultAmount, applicableTo, applicableValue, academicYear, term, isMandatory
//     });

//     // 4. Success Response
//     return formatResponse(true, newFeeItem, null, 201);

//   } catch (error: any) {
//     // Handle specific unique constraint violation error (e.g., from Prisma P2002)
//     if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
//       return formatResponse(false, null, 'Fee item with this name already exists.', 409);
//     }
//     // Re-throw to be caught by withApiHandler's generic catch block (results in a 500 error)
//     throw error;
//   }
// }

// // Export the refactored handlers wrapped in withApiHandler
// export const GET = withApiHandler(handleGetFeeItems);
// export const POST = withApiHandler(handlePostFeeItem);
