import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { companyId, policies } = await request.json();

    // Loop through policies (Annual, Sick, Maternity) and upsert settings
    const updates = await Promise.all(
      policies.map((policy: any) =>
        prisma.leavePolicy.upsert({
          where: {
            companyId_leaveType: {
              companyId,
              leaveType: policy.type,
            },
          },
          update: { daysAllowed: parseInt(policy.days) },
          create: {
            companyId,
            leaveType: policy.type,
            daysAllowed: parseInt(policy.days),
          },
        })
      )
    );

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save policies" }, { status: 500 });
  }
}