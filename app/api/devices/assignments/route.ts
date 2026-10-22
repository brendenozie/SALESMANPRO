import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

import { PRINTING_ACTION_KEYS } from "@/lib/printing/unifiedPrintClient";
export { PRINTING_ACTION_KEYS };

/**
 * GET /api/devices/assignments
 * Retrieve hardware print routing assignments for a company / store
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const storeId = searchParams.get("storeId");
    const slug = searchParams.get("slug");

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    const whereClause: any = { companyId: targetCompanyId };
    if (storeId) {
      whereClause.OR = [{ storeId }, { storeId: null }];
    }

    const assignments = await (prisma as any).storePrinterAssignment.findMany({
      where: whereClause,
      include: {
        printer: true,
      },
    });

    // Also get all available printers for easy frontend selection
    const printers = await (prisma as any).storePrinter.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Map by actionKey for direct O(1) lookup
    const routingMap: Record<string, any> = {};
    for (const action of PRINTING_ACTION_KEYS) {
      const match = assignments.find((a: any) => a.actionKey === action);
      if (match) {
        routingMap[action] = {
          assignmentId: match.id,
          actionKey: match.actionKey,
          printerId: match.printerId,
          printerName: match.printer?.name,
          printerAddress: match.printer?.address,
          connectionType: match.printer?.connectionType,
          paperWidth: match.printer?.paperWidth || "80mm",
          copies: match.copies,
          autoCut: match.autoCut,
          openCashDrawer: match.openCashDrawer,
          templateId: match.templateId || null,
        };
      } else {
        // Fallback to default printer if exists
        const defaultPrinter = printers.find((p: any) => p.isDefault) || printers[0] || null;
        routingMap[action] = {
          assignmentId: null,
          actionKey: action,
          printerId: defaultPrinter?.id || null,
          printerName: defaultPrinter?.name || "System Default / Browser Dialog",
          printerAddress: defaultPrinter?.address || null,
          connectionType: defaultPrinter?.connectionType || "WEB",
          paperWidth: defaultPrinter?.paperWidth || (action === "CUSTOMER_INVOICE" ? "A4" : "80mm"),
          copies: 1,
          autoCut: true,
          openCashDrawer: action === "POS_RECEIPT",
          templateId: null,
        };
      }
    }

    return formatResponse(true, { assignments, routingMap, printers }, "Assignments retrieved", 200);
  } catch (error: any) {
    console.error("[Devices/Assignments GET] Error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch assignments", 500);
  }
}

/**
 * POST /api/devices/assignments
 * Upsert action assignments (e.g., POS_RECEIPT -> Counter Printer)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId,
      slug,
      storeId,
      deviceId,
      actionKey,
      printerId,
      copies = 1,
      autoCut = true,
      openCashDrawer = false,
      templateId,
    } = body;

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId || !actionKey || !printerId) {
      return formatResponse(false, null, "companyId, actionKey, and printerId are required", 400);
    }

    // Verify printer belongs to company
    const printer = await (prisma as any).storePrinter.findUnique({
      where: { id: printerId },
    });

    if (!printer) {
      return formatResponse(false, null, "Target printer not found", 404);
    }

    const assignment = await (prisma as any).storePrinterAssignment.upsert({
      where: {
        companyId_storeId_actionKey: {
          companyId: targetCompanyId,
          storeId: storeId || null,
          actionKey,
        },
      },
      create: {
        companyId: targetCompanyId,
        storeId: storeId || null,
        deviceId: deviceId || null,
        actionKey,
        printerId,
        copies: Number(copies) || 1,
        autoCut: !!autoCut,
        openCashDrawer: !!openCashDrawer,
        templateId: templateId || null,
      },
      update: {
        printerId,
        deviceId: deviceId || null,
        copies: Number(copies) || 1,
        autoCut: !!autoCut,
        openCashDrawer: !!openCashDrawer,
        templateId: templateId || null,
      },
      include: {
        printer: true,
      },
    });

    return formatResponse(true, assignment, `Hardware routing for ${actionKey} saved successfully`, 200);
  } catch (error: any) {
    console.error("[Devices/Assignments POST] Error:", error);
    return formatResponse(false, null, error?.message || "Failed to save assignment", 500);
  }
}
