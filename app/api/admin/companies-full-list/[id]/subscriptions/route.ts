import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { addMonths } from "date-fns";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id: companyId } = params;
    const body = await request.json();
    const { planId, durationMonths, customRenewalDate, adminUserId } = body;

    let renewalDate: Date;

    // Logic: Use custom date if provided, else calculate based on months
    if (customRenewalDate) {
      renewalDate = new Date(customRenewalDate);
    } else {
      renewalDate = addMonths(new Date(), Number(durationMonths || 1));
    }

    const subscriptionId = body.subscriptionId;

    let subscription;

    if (subscriptionId) {
      // Upsert when we have an existing subscription id
      subscription = await prisma.subscriptionCompany.upsert({
        where: { id: subscriptionId },
        update: {
          planId,
          renewalDate,
          updatedAt: new Date(),
        },
        create: {
          id: subscriptionId,
          companyId,
          userId: adminUserId,
          planId,
          status: "ACTIVE",
          renewalDate,
          startedAt: new Date(),
          billingCycle: customRenewalDate
            ? "CUSTOM"
            : Number(durationMonths) >= 12
              ? "ANNUALLY"
              : "MONTHLY",
        },
      });
    } else {
      // Create new subscription when no id provided
      subscription = await prisma.subscriptionCompany.create({
        data: {
          companyId,
          userId: adminUserId,
          planId,
          status: "ACTIVE",
          renewalDate,
          startedAt: new Date(),
          billingCycle: customRenewalDate
            ? "CUSTOM"
            : Number(durationMonths) >= 12
              ? "ANNUALLY"
              : "MONTHLY",
        },
      });
    }

    return NextResponse.json({ success: true, data: subscription });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { addMonths } from "date-fns";

// export async function POST(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const { id: companyId } = params;
//     const body = await request.json();
//     const { planId, durationMonths, status = "ACTIVE" } = body;

//     const now = new Date();
//     const renewalDate = addMonths(now, Number(durationMonths));

//     // We find the existing subscription or create a new one
//     const subscription = await prisma.subscriptionCompany.upsert({
//       where: {
//         // Logic depends on your business rule, usually one active per company
//         id: body.subscriptionId || 'new-id'
//       },
//       update: {
//         planId,
//         status,
//         renewalDate,
//         updatedAt: now,
//       },
//       create: {
//         companyId,
//         userId: body.adminUserId, // The company owner
//         planId,
//         status,
//         renewalDate,
//         startedAt: now,
//         billingCycle: durationMonths >= 12 ? "ANNUALLY" : "MONTHLY",
//       },
//     });

//     return NextResponse.json({ success: true, data: subscription });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
