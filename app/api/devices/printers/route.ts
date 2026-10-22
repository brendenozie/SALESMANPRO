import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET /api/devices/printers
 * List registered printers for a company / store
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const storeId = searchParams.get("storeId");
    const deviceId = searchParams.get("deviceId");
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

    const printers = await (prisma as any).storePrinter.findMany({
      where: whereClause,
      include: {
        assignments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return formatResponse(true, printers, "Printers retrieved successfully", 200);
  } catch (error: any) {
    console.error("[Devices/Printers GET] Error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch printers", 500);
  }
}

/**
 * POST /api/devices/printers
 * Register or update a printer
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      id,
      companyId,
      slug,
      storeId,
      deviceId,
      name,
      connectionType,
      address,
      port,
      paperWidth = "80mm",
      baudRate,
      isDefault = false,
      capabilities,
    } = body;

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId || !name || !connectionType || !address) {
      return formatResponse(false, null, "companyId, name, connectionType, and address are required", 400);
    }

    // If marked as default, clear previous default receipt printers in this store
    if (isDefault) {
      await (prisma as any).storePrinter.updateMany({
        where: {
          companyId: targetCompanyId,
          ...(storeId ? { storeId } : {}),
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    let printer;
    if (id) {
      printer = await (prisma as any).storePrinter.update({
        where: { id },
        data: {
          name,
          connectionType,
          address,
          port: port ? parseInt(port, 10) : null,
          paperWidth,
          baudRate: baudRate ? parseInt(baudRate, 10) : null,
          isDefault: !!isDefault,
          storeId: storeId || null,
          deviceId: deviceId || null,
          capabilities: capabilities || undefined,
        },
      });
    } else {
      // Check if address already registered for this company
      const existing = await (prisma as any).storePrinter.findFirst({
        where: {
          companyId: targetCompanyId,
          address,
        },
      });

      if (existing) {
        printer = await (prisma as any).storePrinter.update({
          where: { id: existing.id },
          data: {
            name,
            connectionType,
            port: port ? parseInt(port, 10) : null,
            paperWidth,
            baudRate: baudRate ? parseInt(baudRate, 10) : null,
            isDefault: isDefault ?? existing.isDefault,
            storeId: storeId || existing.storeId,
            deviceId: deviceId || existing.deviceId,
            capabilities: capabilities || existing.capabilities,
          },
        });
      } else {
        printer = await (prisma as any).storePrinter.create({
          data: {
            companyId: targetCompanyId,
            storeId: storeId || null,
            deviceId: deviceId || null,
            name,
            connectionType,
            address,
            port: port ? parseInt(port, 10) : null,
            paperWidth,
            baudRate: baudRate ? parseInt(baudRate, 10) : null,
            isDefault: !!isDefault,
            capabilities: capabilities || { autoCut: true, openCashDrawer: false },
          },
        });
      }
    }

    return formatResponse(true, printer, "Printer saved successfully", 200);
  } catch (error: any) {
    console.error("[Devices/Printers POST] Error:", error);
    return formatResponse(false, null, error?.message || "Failed to save printer", 500);
  }
}

/**
 * DELETE /api/devices/printers
 * Remove a registered printer
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return formatResponse(false, null, "Printer id is required", 400);
    }

    await (prisma as any).storePrinter.delete({
      where: { id },
    });

    return formatResponse(true, { id }, "Printer deleted successfully", 200);
  } catch (error: any) {
    console.error("[Devices/Printers DELETE] Error:", error);
    return formatResponse(false, null, error?.message || "Failed to delete printer", 500);
  }
}
