import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (request) => {
  // List of models to backup. 
  // You can also get these dynamically using (prisma as any)._runtimeDataModel.models
  const models = [
    "user", "company", "productCategory", "lead", "deal", "expense", 
    "academicLevel", "course", "student", "educator", "product", "order"
    // Add all other models from your schema here
  ];

  const backupData: Record<string, any[]> = {};

  try {
    for (const model of models) {
      // @ts-ignore - dynamic access to prisma models
      backupData[model] = await prisma[model].findMany();
    }

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=backup-${new Date().toISOString()}.json`,
      },
    });
  } catch (error: any) {
    return formatResponse(false, null, `Backup failed: ${error.message}`, 500);
  }
});